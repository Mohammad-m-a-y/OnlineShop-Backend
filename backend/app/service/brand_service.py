from app.service.base_service import BaseService
from app.repository.brand_repository import BrandRepository
from app.repository.user_repository import UserRepository
from sqlalchemy.ext.asyncio import AsyncSession
from app.exceptions.custom import (BadRequestError, NotFoundError,ForbiddenError,InternalServerError)
from app.core.images import save_image , delete_file
from fastapi import UploadFile
from uuid import UUID



class BrandService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = BrandRepository(db)
        self.user_repo = UserRepository(db)


    async def create_brand(
            self,
            actor_id:UUID,
            name:str, 
            slug:str,
            description:str =None,
            image: UploadFile = None
            ):
        if not actor_id or not name or not slug:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)
        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        
        existing_slug =  await self.repo.get_by_slug(slug=slug)
        if existing_slug:
            raise BadRequestError("BRAND_WITH_THE_SAME_SLUG_ALREADY_EXISTS")

        
        try:
            brand = await self.repo.create(name=name, slug=slug, description=description)
            if image:
                image_path = await save_image(upload_file=image, destination_type="brand", destination_id=brand.id)
                brand.image_url = str(image_path)

            await self.db.commit()
            await self.db.refresh(brand)

            return brand
        except Exception:
            await self.db.rollback()
            print(Exception)
            raise InternalServerError("FAILED_TO_CREATE_BRAND")
        

    
    async def update_brand(
            self, 
            actor_id: UUID, 
            brand_id: UUID, 
            name: str = None, 
            slug: str = None, 
            description: str = None, 
            image: UploadFile = None, 
            remove_image: bool = False
            ):
        if not actor_id or not brand_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")

        if not any([name, slug, description, image, remove_image]):
            raise BadRequestError("AT_LEAST_ONE_FIELD_IS_REQUIRED")

        actor = await self.user_repo.get_by_id(user_id=actor_id)  
        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")

        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")

        brand = await self.get_brand_by_id(brand_id=brand_id)

        update_data = {}

        if name:
            update_data['name'] = name

        if slug and brand.slug != slug:
            existing_slug = await self.repo.get_by_slug(slug=slug)
            if existing_slug:
                raise BadRequestError("BRAND_WITH_THE_SAME_SLUG_ALREADY_EXISTS")
            update_data['slug'] = slug  


        update_data['description'] = description

        new_image_path = None
        image_updated = False

        if remove_image:
            if brand.image_url:
                delete_file(brand.image_url)  
            new_image_path = None
            image_updated = True
        elif image:
            if brand.image_url:
                delete_file(brand.image_url)  

            new_image_path = await save_image(upload_file=image, destination_type="brand", destination_id=brand.id)

            if not new_image_path:
                raise InternalServerError("FAILED_TO_SAVE_THE_NEW_IMAGE")
            image_updated = True

        if image_updated:
            update_data['image_url'] = str(new_image_path) 


        if not update_data and not image_updated:
             return brand  

        try:

            updated = await self.repo.update(brand=brand, **update_data)
            await self.db.refresh(updated)
            await self.db.commit()

            return updated
        except Exception as e:
            await self.db.rollback()

            if image_updated and new_image_path and not brand.image_url == new_image_path: 
                 try:
                    delete_file(new_image_path)
                 except Exception as delete_err:
                    print(f"Error cleaning up uploaded image: {delete_err}") 
            raise InternalServerError(f"FAILED_TO_UPDATE_BRAND: {e}")
        



    async def get_brand_by_id(self,brand_id:UUID):
        if not brand_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        brand = await self.repo.get_by_id(brand_id=brand_id)
        if not brand:
            raise NotFoundError("BRAND_NOT_FOUND")
        return brand
    

    async def toggle_status(self, brand_id:UUID, actor_id: UUID):
        if not brand_id or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)
        if not actor:
            raise BadRequestError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError('ACCESS_DENIED') 
        
        brand = await self.get_brand_by_id(brand_id=brand_id)

        try:
            updated = await self.repo.status(brand=brand)
            await self.db.commit()
            await self.db.refresh(updated)

            return updated
        except Exception as e:
            raise InternalServerError(f"FALED_TO_TOGGLE_BRAND_STATUS:{e}")



    async def get_all_brands(self,is_active: bool | None = None,actor_data: dict = None):
        actor = actor_data.get("user")
        if not actor:
            
            is_active= True
        else:

            if not actor.is_admin and not actor.is_owner:
                is_active= True

        brands = await self.repo.get_all(is_active=is_active)
        return brands
    


    async def delete_brand(self, brand_id:UUID, actor_id:UUID):
        if not brand_id or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        brand = await self.get_brand_by_id(brand_id=brand_id)

        actor = await self.user_repo.get_by_id(user_id=actor_id)
        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError('ACCESS_DENIED')
        
        try:
            await self.repo.delete(brand=brand)               
            await self.db.commit()  

            if brand.image_url:
                delete_file(file_path=brand.image_url)

        except Exception as e:
            await self.db.rollback()  
            raise Exception(f"An error occurred during brand deletion: {e}")
        


