from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.user_repository import UserRepository
from app.exceptions.custom import (BadRequestError, NotFoundError,ForbiddenError, ConflictError,InternalServerError)
from app.core.security import hash_password
from fastapi import  UploadFile
from app.core.images import delete_file, save_image
import math
from app.service.base_service import BaseService
from uuid import UUID
from app.service.verification_code_service import VerificationCodeService
from app.core.status_enum import OTPCodePurpose
from sqlalchemy.exc import IntegrityError
from app.core.logging_handler import logger



class UserService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = UserRepository(db)
        self.otp_service = VerificationCodeService(db)


    async def create_user(
        self,
        username:str,
        full_name: str,
        mobile: str,
        password: str,
        email: str | None = None,
        image: UploadFile = None
    ):
        if not full_name or not mobile or not password or not username:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        # بررسی اینکه شماره با فرمت +98 یا 09 وارد شده باشه

        existing_mobile = await self.repo.get_by_mobile(mobile=mobile)
        if existing_mobile:
            raise ConflictError("MOBILE_ALREADY_EXISTS")

        if email:
            existing_email = await self.repo.get_by_email(email=email)
            if existing_email:
                raise ConflictError("EMAIL_ALREADY_EXISTS")
            

        existing_username = await self.repo.get_by_username(username=username)
        if existing_username:
            raise ConflictError("USERNAME_ALREADY_EXISTS")

            
        hashed_password = hash_password(password)

        try:
            

            user = await self.repo.create(
                username=username,
                full_name=full_name,
                hashed_password=hashed_password,
                mobile=mobile,
                email=email,
                is_verified= False
            )

            if image:
                image_path = await save_image(
                upload_file=image,
                destination_type="user",
                destination_id=user.id
                )

                user.image_url = str(image_path)

            await self.db.commit()
            await self.db.refresh(user)

        except IntegrityError as e:
            await self.db.rollback()
            print(f"FAILED_TO_CREATE_USER: {e}")

            constraint_name = getattr(getattr(e.orig, "diag", None), "constraint_name", None)

            if constraint_name == "uq_users_username":
             raise ConflictError("USERNAME_ALREADY_EXISTS")
            if constraint_name == "uq_users_mobile":
                raise ConflictError("MOBILE_ALREADY_EXISTS")
            if constraint_name == "uq_users_email":
                raise ConflictError("EMAIL_ALREADY_EXISTS")

            raise InternalServerError("FAILED_TO_CREATE_USER")
        
        try:
            await self.otp_service.send_code(mobile=mobile, purpose=OTPCodePurpose.REGISTER)
        except Exception as e:
            print(f"SEND_OTP_FAILED_BUT_NEW_USER_CREATED:{e}")

        return user

        
        


    async def update_user(
        self,
        actor_id: UUID,
        username: str = None,
        full_name: str = None,
        image: UploadFile = None,
        email: str = None,
        remove_image: bool = False
    ):
        if not actor_id:
            raise BadRequestError("ACTOR_ID_IS_REQUIRED")

        if username is None and full_name is None and image is None and email is None and not remove_image:
            raise BadRequestError("AT_LEAST_ONE_FIELD_IS_REQUIRED")

        updated_user = await self.repo.get_by_id(user_id=actor_id)
        if not updated_user:
            raise NotFoundError("USER_NOT_FOUND")

        update_data = {}

        if full_name is not None and full_name != updated_user.full_name:
            update_data["full_name"] = full_name

        if email is not None and email != updated_user.email:
            existing_email = await self.repo.get_by_email(email=email)
            if existing_email:
                raise ConflictError("EMAIL_ALREADY_EXISTS")
            update_data["email"] = email


        if username and username != updated_user.username:
            existing_username = await self.repo.get_by_username(username=username)
            if existing_username:
                raise ConflictError("USERNAME_ALREADY_EXISTS")
            update_data["username"] = username
            

        new_image_path = None
        image_updated = False
        if remove_image:
            if updated_user.image_url:
                delete_file(updated_user.image_url)

            new_image_path = None
            image_updated = True

        elif image:
            if updated_user.image_url:
                delete_file(updated_user.image_url)

            new_image_path = save_image(
                upload_file=image,
                destination_type="user",
                destination_id=updated_user.id
            )

            if not new_image_path:
                raise InternalServerError("FAILED_TO_SAVE_THE_NEW_IMAGE")
            
            image_updated = True

        if image_updated:
            update_data['image_url'] = new_image_path 


        try:
        
            updated = await self.repo.update(user=updated_user, **update_data)

            await self.db.commit()
            await self.db.refresh(updated)
            return updated

        except Exception as e:
            await self.db.rollback()

            if image_updated and new_image_path and not updated_user.image_url == new_image_path: 
                try:
                    delete_file(new_image_path)
                except Exception as delete_err:
                    print(f"Error cleaning up uploaded image: {delete_err}") 

            raise InternalServerError(f"FAILED_TO_UPDATE_USER: {e}")


    async def get_user_by_id(self, user_id:UUID):
        if not user_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        user = await self.repo.get_by_id(user_id=user_id)

        if not user:
            raise NotFoundError("USER_NOT_FOUND")
        
        return user



    
    async def toggle_admin_role (self, user_id: UUID, actor_id: UUID):
        if not user_id or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")

        user = await self.repo.get_by_id(user_id=user_id)
        actor = await self.repo.get_by_id(user_id=actor_id)

        if not user or not actor:
            raise NotFoundError("ACTOR_OR_USER_NOT_FOUND")

        if not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")

        try:
            new_admin = await self.repo.toggle_admin(user=user)
            await self.db.commit()
            await self.db.refresh(new_admin)
            return new_admin

        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_MAKE_USER_ADMIN: {e}")



    async def toggle_owner_role (self, user_id: UUID, actor_id: UUID):
        if not user_id or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")

        user = await self.repo.get_by_id(user_id=user_id)
        actor = await self.repo.get_by_id(user_id=actor_id)

        if not user or not actor:
            raise NotFoundError("ACTOR_OR_USER_NOT_FOUND")

        if not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")

        try:
            new_owner = await self.repo.toggle_owner(user=user)
            await self.db.commit()
            await self.db.refresh(new_owner)
            return new_owner

        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_MAKE_USER_ADMIN: {e}")


    async def toggle_status(self, user_id: UUID, actor_id: UUID):
        """
            active or deactive users
        """
        if not user_id or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")

        user = await self.repo.get_by_id(user_id=user_id)
        actor = await self.repo.get_by_id(user_id=actor_id)

        if not user or not actor:
            raise NotFoundError("ACTOR_OR_USER_NOT_FOUND")

        if not actor.is_owner and not actor.is_admin:
            raise ForbiddenError("ACCESS_DENIED")

        try:
            updated = await self.repo.toggle_active(user=user)
            await self.db.commit()
            await self.db.refresh(updated)
            return updated
        
        except Exception as e:
            logger.error(f"FAILED_TO_TOGGLE_USER_STATUS:{e}")
            raise InternalServerError("FAILED_TO_TOGGLE_USER_STATUS")


    
    async def get_paginated(self,actor_id:UUID, page: int = 1, page_size: int = 10) -> dict:
        if not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        if page < 1 or page_size < 1:
            raise BadRequestError("PAGE_AND_PAGE_SIZE_MUST_BE_GREATER_THAN_0")
        
        actor = await self.get_user_by_id(user_id=actor_id)
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")

        offset = (page - 1) * page_size
        items, total = await self.repo.get_paginated_users(limit=page_size, offset=offset)

        total_pages = math.ceil(total / page_size) if total else 0

        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "total_count": total,
        }


    async def delete_user(self, user_id:UUID, actor_id:UUID):
        if not user_id and not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        

        user_to_delete = await self.get_user_by_id(user_id=user_id)

        actor = await self.get_user_by_id(user_id=actor_id)

        if user_to_delete.id != actor.id and not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        
        try:
            deleted_id = user_to_delete.id
            await self.repo.delete(user=user_to_delete)

            if user_to_delete.image_url:
                delete_file(file_path=user_to_delete.image_url)

            await self.db.commit()
            return deleted_id
        
        except Exception:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_DELETE_USER:{Exception}")



            




