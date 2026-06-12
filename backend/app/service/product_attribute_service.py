from app.service.base_service import BaseService
from uuid import UUID
from app.exceptions.custom import (BadRequestError, NotFoundError, ForbiddenError,InternalServerError)
from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.attribute_repository import AttributeRepository
from app.repository.user_repository import UserRepository
from app.repository.product_variant_repository import ProductVariantRepository



class ProductAttributeService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = AttributeRepository(db)
        self.user_repo = UserRepository(db)
        self.var_repo = ProductVariantRepository(db)


    async def create_attribute(self,actor_id:UUID,variant_id:UUID,name:str,value:str):
        if not all([actor_id, variant_id, name, value]):
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        
        varaint = await self.var_repo.get_by_id(variant_id=variant_id)
        if not varaint:
            raise NotFoundError("VARIANT_NOT_FOUND")

        variant_attributes = varaint.attributes

        for att in variant_attributes:
            if att.name == name:
                raise BadRequestError("ATTRIBUTE_WITH_THIS_NAME_ALREADY_EXISTS")
            
        try:
            attribute = await self.repo.create(variant_id=variant_id,name=name,value=value)

            await self.db.commit()
            await self.db.refresh(attribute)
            return attribute
        
        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_CREATE_ATTRIBUTE: {e}")  
            raise InternalServerError("FAILED_TO_CREATE_ATTRIBUTE")
        



    async def update_attribute(self, actor_id:UUID, attribute_id:UUID,variant_id:UUID,name:str=None,value:str=None):
        if not actor_id or not attribute_id or not variant_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        if not name and not value:
            raise BadRequestError("AT_LEAST_ONE_OPTIONAL_FIELD_IS_REQUIRED")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        
        attribute = await self.repo.get_by_id(attribute_id=attribute_id)
        if not attribute:
            raise NotFoundError("ATTRIBUTE_NOT_FOUND")
        
        varaint = await self.var_repo.get_by_id(variant_id=variant_id)
        if not varaint:
            raise NotFoundError("VARIANT_NOT_FOUND")
        

        update_data = {}

        if name and name != attribute.name:     
            variant_attributes = varaint.attributes
            for att in variant_attributes:
                if att.name == name:
                    raise BadRequestError("ATTRIBUTE_WITH_THIS_NAME_ALREADY_EXISTS")
            
            update_data['name'] = name

        if value:
            update_data['value'] = value

        try:
            updated = await self.repo.update(attribute=attribute,**update_data)
            await self.db.commit()
            await self.db.refresh(updated)
            return updated
        
        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_UPDATE_ATTRIBUTE: {e}")  
            raise InternalServerError("FAILED_TO_UPDATE_ATTRIBUTE")
        



    async def delete_attribute(self,actor_id:UUID, attribute_id:UUID):
        if not actor_id or not attribute_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        
        attribute = await self.repo.get_by_id(attribute_id=attribute_id)
        if not attribute:
            raise NotFoundError("ATTRIBUTE_NOT_FOUND")
        
        try:
            await self.repo.delete(attribute=attribute)
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_DELETE_ATTRIBUTE: {e}")  
            raise InternalServerError("FAILED_TO_DELETE_ATTRIBUTE")



            

            