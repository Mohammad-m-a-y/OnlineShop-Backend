from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select ,asc, desc,func
from uuid import UUID
from app.models.cart_model import Cart
from sqlalchemy.orm import  selectinload
from typing import Optional, Tuple, List
from app.models.cart_item_model import CartItem
from app.models.product_variant_model import ProductVariant
from app.core.status_enum import CartStatus




class CartRepository:
    def __init__(self, db:AsyncSession):
        self.db= db


    async def create(self , **kwargs):
        cart = Cart(**kwargs)
        self.db.add(cart) 
        return cart
    

    async def update(self, cart: Cart, **kwargs): 
        for key, value in kwargs.items():
            setattr(cart, key, value)
        await self.db.flush()
        return cart 
    

    async def get_by_id(self, cart_id: UUID):  
 
        stmt = select(Cart).filter(Cart.id == cart_id, Cart.status == CartStatus.ACTIVE).options(
            selectinload(Cart.items)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()


    async def get_to_create_order(self, cart_id: UUID):  
 
        stmt = select(Cart).filter(Cart.id == cart_id, Cart.status == CartStatus.ACTIVE).options(
            selectinload(Cart.items).joinedload(CartItem.variant).selectinload(ProductVariant.attributes)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()  
    


    async def get_by_user_id(self, user_id: UUID): 
        stmt = select(Cart).filter(Cart.user_id == user_id , Cart.status == CartStatus.ACTIVE).options(selectinload(Cart.items))
        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()
    

    async def get_by_session_id(self, session_id:str):
        stmt = select(Cart).filter(Cart.session_id == session_id, Cart.status == CartStatus.ACTIVE).options(selectinload(Cart.items))
        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()
    


    async def get_active_cart_for_user_or_session(self,cart_id:UUID ,user_id: Optional[UUID] = None, session_id: Optional[str] = None) -> Optional[Cart]:

        if user_id:
            stmt = select(Cart).filter(Cart.id == cart_id,Cart.user_id == user_id, Cart.status == CartStatus.ACTIVE)
        elif session_id:
            stmt = select(Cart).filter(Cart.id == cart_id,Cart.session_id == session_id, Cart.status == CartStatus.ACTIVE)
        else:
            return None

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()


    
    async def get_all_carts_for_user(self, user_id:UUID):
        stmt = (
            select(Cart)
            .where(Cart.user_id == user_id, Cart.status == CartStatus.ACTIVE)
            .options(selectinload(Cart.items))
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    

    async def change_status(self, cart:Cart , status:str):
        cart.status = status

        await self.db.flush()
        return cart
    

    async def get_paginated(
        self,
        limit: int = 20,
        offset: int = 0,
        status: Optional[str] = None,
        user_id: Optional[UUID] = None,
        session_id: Optional[str] = None,
        order_by: Optional[str] = None,  
        descending: bool = False,  
    ) -> Tuple[List['Cart'], int]:
        
        stmt = select(Cart)

        filters = []
        if status:
            filters.append(Cart.status == status)
        if user_id:
            filters.append(Cart.user_id == user_id)
        if session_id:
            filters.append(Cart.session_id == session_id)

        if filters:
            stmt = stmt.where(*filters)

        if order_by:
            order_column = getattr(Cart, order_by, None)
            if order_column:
                if descending:
                    stmt = stmt.order_by(desc(order_column))
                else:
                    stmt = stmt.order_by(asc(order_column))
        
        stmt = stmt.limit(limit)
        stmt = stmt.offset(offset)   

        count_subquery = stmt.with_only_columns(func.count()).scalar_subquery()
        count_stmt = select(count_subquery)

        total_result = await self.db.execute(count_stmt)
        total_count = total_result.scalar()

        stmt = stmt.options(selectinload(Cart.items))

        carts_result = await self.db.execute(stmt)
        carts = carts_result.scalars().all()

        return carts, total_count





    async def delete(self, cart: Cart) -> None:
        await self.db.delete(cart)
