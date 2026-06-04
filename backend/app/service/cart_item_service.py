from uuid import UUID
from app.service.base_service import BaseService
from sqlalchemy.ext.asyncio import AsyncSession
from app.exceptions.custom import (BadRequestError, NotFoundError,InternalServerError, ForbiddenError)
from app.repository.cart_item_repository import CartItemRepository
from app.repository.cart_repository import CartRepository
from app.core.status_enum import CartStatus



class CartItemService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = CartItemRepository(db)
        self.cart_repo = CartRepository(db)


    
    async def create_item(self,cart_id:UUID,product_id:UUID,variant_id:UUID,quantity:int = 1,user_id:UUID = None,session_id:str = None):
        if not all([cart_id,product_id,variant_id,quantity]):
            raise BadRequestError("MISSING_REQUIRED_FIELDS") 
        
        if not user_id and not session_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS") 
        
        if quantity <= 0:
             raise BadRequestError("INVALID_QUANTITY")
        
        cart = await self.cart_repo.get_by_id(cart_id=cart_id)
        if not cart:
            raise NotFoundError("CART_NOT_FOUND")
        
        if cart.status != CartStatus.ACTIVE.value:
            raise BadRequestError("CART_IS_NOT_ACTIVE")

        
        if user_id:
            if user_id != cart.user_id:
                raise ForbiddenError("ACCESS_DENIED")
        else:
            if session_id != cart.session_id:
                raise ForbiddenError("ACCESS_DENIED")
        


        try:
            
            existing_item = await self.repo.get_by_cart_and_variant(
                cart_id=cart_id,
                variant_id=variant_id  
            )
                
            if existing_item:
                new_quantity = existing_item.quantity + quantity
                updated_item = await self.repo.update(
                    item=existing_item,
                    quantity=new_quantity
                )
                await self.db.commit()
                await self.db.refresh(updated_item)
                return updated_item
            else:

                new_item = await self.repo.create(
                    cart_id=cart_id,
                    product_id=product_id,
                    variant_id=variant_id,
                    quantity=quantity
                )
                await self.db.commit()
                await self.db.refresh(new_item)
                return new_item

        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_CREATE_ITEM: {e}")
            raise InternalServerError("FAILED_TO_CREATE_ITEM")
        

    async def update_quantity(self,cart_id:UUID ,item_id:UUID, quantity:int = None,user_id:UUID = None,session_id:str = None):
        if not item_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        if not user_id and not session_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS") 
        
        item = await self.repo.get_by_id(item_id=item_id)
        if not item:
            raise NotFoundError("ITEM_NOT_FOUND")
        
        cart = await self.cart_repo.get_by_id(cart_id=cart_id)
        if not cart:
            raise NotFoundError("CART_NOT_FOUND")
        
        if cart.status != CartStatus.ACTIVE.value:
            raise BadRequestError("CART_IS_NOT_ACTIVE")
        
        if user_id:
            if user_id != cart.user_id:
                raise ForbiddenError("ACCESS_DENIED")
        else:
            if session_id != cart.session_id:
                raise ForbiddenError("ACCESS_DENIED")
        
        try:
            if quantity is None or quantity <= 0:  
                return await self.delete_item(item_id=item_id)
                
                

            updated = await self.repo.update(item=item, quantity=quantity)
            await self.db.commit()
            await self.db.refresh(updated)
            return updated

        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_UPDATE_ITEM: {e}")
            raise InternalServerError("FAILED_TO_UPDATE_ITEM")

        

    
    async def delete_item(self,item_id:UUID):
        if not item_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        item = await self.repo.get_by_id(item_id=item_id)
        if not item:
            raise NotFoundError("ITEM_NOT_FOUND")
        
        try:
            await self.repo.delete(item=item)
            await self.db.commit()
            return True
        
        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_DELETE_ITEM: {e}")
            raise InternalServerError("FAILED_TO_DELETE_ITEM")

                

                


    
        

