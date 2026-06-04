from app.repository.product_variant_repository import ProductVariantRepository
from app.service.base_service import BaseService
from app.exceptions.custom import (BadRequestError, NotFoundError,ForbiddenError,InternalServerError,ConflictError)
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from decimal import Decimal
from app.repository.user_repository import UserRepository
from app.repository.product_repository import ProductRepository





class ProductVariantService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = ProductVariantRepository(db)
        self.user_repo = UserRepository(db)
        self.product_repo = ProductRepository(db)


    async def create_variant(self,actor_id:UUID,product_id:UUID,sku:str,price_modifier:Decimal,stock_quantity:int,discounted_price:Decimal = None):
        if not all([actor_id,product_id, sku, price_modifier, stock_quantity]):
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin:
            raise ForbiddenError("ACCESS_DENIED")

        if price_modifier < 0 or stock_quantity < 0:
            raise BadRequestError("PRICE_OR_STOCK_QUANTITY_CANT_BE_LESS_THAN_0")
        
        if discounted_price and discounted_price > price_modifier:
            raise BadRequestError("DISCONTED_PRICE_CANT_BE_GREATER_THAN_BASE_PRICE")
        
        product = await self.product_repo.get_by_id(product_id=product_id)

        if not product:
            raise NotFoundError("PRODUCT_NOT_FOUND")
        
        existing_sku = await self.repo.get_by_sku(sku=sku)
        if existing_sku:
            raise BadRequestError("VARIANT_WITH_THE_SAME_SKU_ALREADY_EXISTS")
        

        try:
            variant = await self.repo.create(
                product_id=product_id,
                sku=sku,
                price_modifier=price_modifier,
                discounted_price=discounted_price,
                stock_quantity=stock_quantity
            )

            await self.db.commit()
            await self.db.refresh(variant)

            return variant
        
        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_CREATE_VARIANT: {e}") 
            raise InternalServerError("FAILED_TO_CREATE_VARIANT")
        

    
    async def update_variant(
            self, 
            actor_id:UUID, 
            variant_id:UUID,
            sku:str=None,
            price_modifier:Decimal=None,
            discounted_price:Decimal = None,
            stock_quantity:int=None
        ):
        
        if not actor_id or not variant_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        if not any([sku,price_modifier,stock_quantity,discounted_price]):
            raise BadRequestError("AT_LEAST_ONE_OPTIONAL_FIELD_IS_REQUIRED")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin:
            raise ForbiddenError("ACCESS_DENIED")
        
        variant = await self.repo.get_by_id(variant_id=variant_id)
        if not variant:
            raise NotFoundError("VARIANT_NOT_FOUND")
        

        update_data = {}

        if sku and variant.sku != sku:
            existing_sku = await self.repo.get_by_sku(sku=sku)
            if existing_sku:
                raise BadRequestError("VARIANT_WITH_THE_SAME_SKU_ALREADY_EXISTS")
            
            update_data["sku"] = sku

        if price_modifier:
            if price_modifier < 0:
                raise BadRequestError("PRICE_CANT_BE_LESS_THAN_0")
        
            update_data["price_modifier"] = price_modifier

        if discounted_price:
            if  discounted_price > price_modifier:
                raise BadRequestError("DISCONTED_PRICE_CANT_BE_GREATER_THAN_BASE_PRICE")
            update_data["discounted_price"] = discounted_price

        if stock_quantity:
            update_data["stock_quantity"] = stock_quantity

        
        try:
            updated = await self.repo.update(variant=variant, **update_data)

            await self.db.commit()
            await self.db.refresh(updated)
            return updated
        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_UPDATE_VARIANT: {e}") 
            raise InternalServerError("FAILED_TO_UPDATE_VARIANT")
        

    async def get_variants_by_product_id(self,product_id:UUID):
        if not product_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        try:
            return await self.repo.get_by_product_id(product_id=product_id)
        except Exception as e:
            print(f"ERROR_DURING_GET_VARIANTS: {e}") 
            raise InternalServerError("FAILED_TO_GET_VARIANTS")
        


    
    async def delete_variant(self,actor_id:UUID, variant_id:UUID):
        if not actor_id or not variant_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin:
            raise ForbiddenError("ACCESS_DENIED")
        
        variant = await self.repo.get_by_id(variant_id=variant_id)
        if not variant:
            raise NotFoundError("VARIANT_NOT_FOUND")
        
        try:
            await self.repo.delete(variant=variant)
            await self.db.commit()

        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_DELETE_VARIANT: {e}") 
            raise InternalServerError("FAILED_TO_UPDATE_VARIANT")

        



        




