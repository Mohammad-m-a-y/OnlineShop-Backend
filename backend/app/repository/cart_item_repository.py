from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select 
from uuid import UUID
from app.models.cart_item_model import CartItem
from sqlalchemy.orm import selectinload 
from typing import Optional



class CartItemRepository:
    def __init__(self, db:AsyncSession):
        self.db = db

    
    async def create(self,**kwargs):
        item = CartItem(**kwargs)
        self.db.add(item) 
        return item
    

    async def get_by_id(self, item_id:UUID):
        stmt = select(CartItem).filter(CartItem.id == item_id).options(
            selectinload(CartItem.product),  
            selectinload(CartItem.variant)   
        )

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    

    async def get_by_cart_and_variant(self, cart_id: UUID, variant_id: UUID) -> Optional[CartItem]:

        stmt = select(CartItem).filter(
            CartItem.cart_id == cart_id,
            CartItem.variant_id == variant_id
        ).options(
            selectinload(CartItem.product),
            selectinload(CartItem.variant)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    

    async def update(self, item: CartItem, **kwargs): 
        for key, value in kwargs.items():
            setattr(item, key, value)
        await self.db.flush()
        return item 
    

    async def delete(self,item:CartItem):
        await self.db.delete(item)


