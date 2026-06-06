from app.service.base_service import BaseService
from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.refresh_token_repository import RefreshTokenRepository
from app.exceptions.custom import (BadRequestError, NotFoundError, UnauthorizedError,InternalServerError)
from app.core.jwt import create_refresh_token , decode_token, create_access_token
from app.repository.user_repository import UserRepository
from app.core.config import get_settings
from datetime import datetime , timezone, timedelta
from uuid import UUID
from app.core.security import verify_password
from app.service.verification_code_service import VerificationCodeService
from app.core.status_enum import OTPCodePurpose
from app.core.logging_handler import logger



settings = get_settings()


class Auth_service(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.token_repo = RefreshTokenRepository(db)
        self.user_repo = UserRepository(db)
        self.otp_service= VerificationCodeService(db)



    async def create_refresh_token(self, actor_id: UUID): 
        if not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)
        if not actor:
            raise NotFoundError("USER_NOT_FOUND")
        
        if not actor.is_active:
            raise UnauthorizedError("USER_HAS_BEEN_DEACTIVATED")

        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        token_string = create_refresh_token(data={"sub": str(actor_id)}, expires_at=expires_at)

        try:
            refresh_token = await self.token_repo.create(user_id=actor_id, token=token_string, expires_at=expires_at)
            await self.db.commit()
            await self.db.refresh(refresh_token)
            return refresh_token
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_CREATE_REFRESH_TOKEN: {e}")





    async def revoke_all_tokens(self, user_id: UUID):
        user = await self.user_repo.get_by_id(user_id=user_id)
        if not user:
            raise NotFoundError('USER_NOT_FOUND')
        
        try:
            await self.token_repo.revoke_all_for_user(user_id=user_id)
            await self.db.commit()
            return user
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_REVOKE_TOKENS: {e}")


    async def get_by_token(self, token: str):
        if not token:
            raise BadRequestError('MISSING_REQUIRED_FIELDS')
        return await self.token_repo.get_by_token(token=token)
        

        
    async def validate_and_rotate(self, token_str: str):
        if not token_str:
            raise BadRequestError('MISSING_REQUIRED_FIELDS')

        payload = decode_token(token_str)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedError("INVALID_TOKEN")

        user_id = UUID(payload.get("sub", 0))
        refresh_token_obj = await self.get_by_token(token=token_str)

        if not refresh_token_obj:
            raise NotFoundError('TOKEN_NOT_FOUND')

        if refresh_token_obj.expires_at < datetime.now(timezone.utc):
            raise UnauthorizedError("TOKEN_EXPIRED")

        if refresh_token_obj.is_revoked:
            raise UnauthorizedError("TOKEN_REVOKED")

        try:
            await self.token_repo.revoke_token(refresh_token=refresh_token_obj)
            
            new_access_token = create_access_token(data={"sub": str(user_id)})
            new_refresh_token_obj = await self.create_refresh_token(actor_id=user_id)

            # commit in create_refresh_token
            
            return {
                "access_token": new_access_token,
                "refresh_token": new_refresh_token_obj.token,
            }
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_ROTATE_TOKEN: {e}")
        


    
    async def verify_user(self, mobile:str, otp_code:str, purpose: OTPCodePurpose):
        if not mobile or not otp_code or not purpose:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
    
        await self.otp_service.verify_code(mobile=mobile, otp_code=otp_code, purpose= purpose)

        user = await self.user_repo.get_by_mobile(mobile=mobile)
        if not user:
            raise NotFoundError("USER_NOT_FOUND")

        try:

            await self.user_repo.update(user=user, is_verified=True)

            await self.db.commit()

        except Exception as e:
            await self.db.rollback()
            logger.error(f"VERIFY_USER_FAILED: {e}")
            raise InternalServerError("FAILED_TO_VERIFY_USER")
        
        refresh_token = await self.create_refresh_token(actor_id=user.id)
        access_token = create_access_token(data={"sub":str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token.token, 
        }



    
    async def login_whit_username_and_password(self, username:str, password:str):
        if not username or not password:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        user = await self.user_repo.get_by_username(username=username)
        if not user:
            raise BadRequestError("INVALID_CREDENTIALS")
        
        if not user.is_active:
            raise UnauthorizedError("USER_HAS_BEEN_DEACTIVATED")
        
        if not user.is_verified:
            raise UnauthorizedError("USER_IS_NOT_VERIFIED")

        if not verify_password(password=password, hashed=user.hashed_password):
            raise BadRequestError("INVALID_CREDENTIALS")
        

        refresh_token = await self.create_refresh_token(actor_id=user.id)
        access_token = create_access_token(data={"sub":str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token.token, 
        }


    
    async def login_with_mobile(self, mobile:str, otp_code:str, purpose: OTPCodePurpose):

        """
        1. check if the user exists
        2. check if the user is active or verified
        3. if not verified calls verify_user method.
        4. create tokens
        """

        if not mobile or not otp_code or not purpose:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
         
        user = await self.user_repo.get_by_mobile(mobile=mobile)

        if not user:
            raise NotFoundError("USER_NOT_FOUND") 

        if not user.is_active:
            raise UnauthorizedError("USER_HAS_BEEN_DEACTIVATED")

        if not user.is_verified:
            return await self.verify_user(mobile=mobile, otp_code=otp_code, purpose=purpose)
        

        await self.otp_service.verify_code(mobile=mobile, otp_code=otp_code, purpose= purpose)
        refresh_token = await self.create_refresh_token(actor_id=user.id)
        access_token = create_access_token(data={"sub":str(user.id)})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token.token, 
        }



    
    async def logout(self, refresh_token: str):
        token_obj = await self.get_by_token(token=refresh_token)
        if not token_obj or token_obj.is_revoked or token_obj.expires_at < datetime.now(timezone.utc):
            raise UnauthorizedError("INVALID_OR_EXPIRED_TOKEN")

        try:
            await self.token_repo.revoke_token(refresh_token=token_obj)
            await self.db.commit()
            return {"message": "Successfully logged out"}
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_LOGOUT: {e}")
        


