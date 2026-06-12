from app.repository.category_repository import CategoryRepository
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.base_service import BaseService
from app.exceptions.custom import (BadRequestError, NotFoundError, ForbiddenError,InternalServerError, ConflictError)
from app.repository.user_repository import UserRepository
from app.core.images import save_image , delete_file
from fastapi import UploadFile
from uuid import UUID



class CategoryService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = CategoryRepository(db)
        self.user_repo = UserRepository(db)


    async def create_category(
            self, 
            actor_id:UUID,
            name:str, 
            slug:str,
            parent_id:UUID | None = None,
            description:str | None = None,
            image:UploadFile | None = None):
        
        if not actor_id or not name or not slug :
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        
        existing_slug= await self.repo.get_by_slug(slug=slug)

        if existing_slug:
            raise BadRequestError("CATEGORY_WITH_THE_SAME_SLUG_ALREADY_EXISTS")
        
        if parent_id:
            parent = await self.repo.get_by_id(category_id=parent_id)

            if not parent:
                raise NotFoundError("PARENT_NOT_FOUND")
        

            if parent.parent_id:
                raise ConflictError("CAN_NOT_ADD_CHILDREN_TO_CHIALD_CATEGORIES")


        try:
            category = await self.repo.create(name=name, slug=slug,parent_id=parent_id,description=description)

            if image:
                image_path = await save_image(upload_file=image,  destination_type="category" , destination_id= category.id)

                category.image_url = str(image_path)


            await self.db.commit()
            await self.db.refresh(category)
            return category
        except Exception:
            await self.db.rollback()
            raise InternalServerError("FAILED_TO_CREATE_CATEGORY")
        

    async def update_category(self,actor_id:UUID,category_id:UUID,name:str=None,slug:str=None,parent_id:UUID = None,
                        description:str = None,image:UploadFile= None,remove_image:bool = False
        ):

        if not actor_id or not category_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        if not name and not slug and not parent_id and not description and not image and not remove_image:
            raise BadRequestError("AT_LEAST_ONE_FIELD_IS_REQUIRED")
        

        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        
        category = await self.get_category_by_id(category_id=category_id)
        

        update_data = {}

        if name:
            update_data['name']= name

        if slug and category.slug != slug:
            existing_slug = await self.repo.get_by_slug(slug=slug)

            if existing_slug:
                raise BadRequestError("CATEGORY_WITH_THE_SAME_SLUG_ALREADY_EXISTS")
            
            update_data['slug'] = slug

        if parent_id:
            parent = await self.repo.get_by_id(category_id=parent_id)
            if not parent:
                raise NotFoundError("PARENT_NOT_FOUND")
            
            update_data['parent_id'] = parent_id


        if description:
            update_data['description'] = description


        new_image_path = None
        image_updated = False

        if remove_image:
            if category.image_url:
                delete_file(category.image_url)

            new_image_path = None
            image_updated = True

        elif image:
            if category.image_url:
                delete_file(category.image_url)

            new_image_path = await save_image(upload_file = image, destination_type="category" , destination_id= category.id)
            if not new_image_path:
                
                raise InternalServerError("FAILED_TO_SAVE_THE_NEW_IMAGE")
            image_updated = True

        if image_updated:
            update_data['image_url'] = str(new_image_path)


        try:
            updated = await self.repo.update(category=category, **update_data)
            await self.db.commit()
            await self.db.refresh(updated)

            return updated
        except Exception as e:
            await self.db.rollback()

            if image_updated and new_image_path and not category.image_url == new_image_path: 
                 try:
                    delete_file(new_image_path)
                 except Exception as delete_err:
                     print(f"Error cleaning up uploaded image: {delete_err}") 
            raise InternalServerError(f"FAILED_TO_UPDATE_CATEGORY: {e}")




    async def get_category_by_id(self,category_id:UUID):
        if not category_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        category = await self.repo.get_by_id(category_id=category_id)
        if not category:
            raise NotFoundError("CATEGORY_NOT_FOUND")
        
        return category
    


    async def toggle_status(self, category_id:UUID, actor_id: UUID):
        if not category_id or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)
        if not actor:
            raise BadRequestError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError('ACCESS_DENIED') 
        
        category = await self.get_category_by_id(category_id=category_id)

        try:
            updated = await self.repo.status(category=category)
            await self.db.commit()
            await self.db.refresh(updated)

            return updated
        except Exception as e:
            raise InternalServerError(f"FALED_TO_TOGGLE_CATEGORY_STATUS:{e}")

    


    @staticmethod
    def category_to_nested( cat, products_count=None):
        return{ 
            "id":cat.id,
            "name":cat.name,
            "slug":cat.slug,
            "description":cat.description,
            "image_url":cat.image_url,
            "is_active":cat.is_active,
            "created_at":cat.created_at,
            "updated_at":cat.updated_at,
            "products_count":products_count,
        }
    

    async def get_all_categories(self,  is_active: bool | None = None, actor_data: dict = None):

        actor = actor_data.get("user")
        if not actor:
            
            is_active= True
        else:

            if not actor.is_admin and not actor.is_owner:
                is_active= True

        results = await self.repo.get_all(is_active=is_active)

        return { "items": [
            {
                "id":cat.id,
                "name":cat.name,
                "slug":cat.slug,
                "description":cat.description,
                "image_url":cat.image_url,
                "is_active":cat.is_active,
                "created_at":cat.created_at,
                "updated_at":cat.updated_at,
                "products_count":count,
                "children":[CategoryService.category_to_nested(cat=child) for child in cat.children],
            }
            for cat, count in results ]
        }

    async def delete_category(self,actor_id:UUID, category_id:UUID):

        if not actor_id or not category_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        

        category = await self.get_category_by_id(category_id=category_id)

        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError('ACCESS_DENIED')
        
        try:
            deleted_id = category_id
            await self.repo.delete(category=category)

            if category.image_url:
                delete_file(category.image_url)

            await self.db.commit()

            return deleted_id
        
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_DELETE_CATEGORY: {e}")



