from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc,func , insert
from uuid import UUID
from app.models.order_model import Order
from datetime import datetime
from sqlalchemy.orm import joinedload, selectinload
from app.models.order_item_model import OrderItem
from app.core.status_enum import OrderStatus
 



class OrderRepository:
    def __init__(self, db:AsyncSession):
        self.db = db


    async def create(self, **kwargs):
        order = Order(**kwargs)
        self.db.add(order) 
        await self.db.flush()
        return order
    

    async def bulk_create_order_items(self, items_data: list[dict]):
        """
        items_data: لیستی از دیکشنری‌ها که هر کدام شامل فیلدهای OrderItem است
        """
        if not items_data:
            return
 
        stmt = insert(OrderItem).values(items_data)
        await self.db.execute(stmt)
    

    async def update(self, order:Order, **kwargs):
        for key, value in kwargs.items():
            setattr(order, key, value)
        await self.db.flush()
        return order   
    

    async def get_by_id(self, order_id:UUID):
        stmt = select(Order).where(Order.id == order_id).options(
            joinedload(Order.shipping_address),
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    

    async def get_to_reduce_stock_for_order(self, order_id:UUID):
        stmt = select(Order).where(Order.id == order_id).with_for_update().options(
            joinedload(Order.shipping_address).selectinload(Order.items).joinedload(OrderItem.variant)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    

    async def get_by_user_id(self, user_id:UUID):
        stmt = select(Order).where(Order.user_id == user_id)
        result = await self.db.execute(stmt)

        return result.scalars().all()


    async def get_all(self, offset: int = 0, limit: int = 20, 
                      user_id: UUID = None, status: OrderStatus = None, 
                      start_date: datetime = None, end_date:datetime = None):
        
        
        filters = []
        if user_id: filters.append(Order.user_id == user_id)
        if status: filters.append(Order.status == status)
        if start_date: filters.append(Order.created_at >= start_date)
        if end_date: filters.append(Order.created_at <= start_date)

        if filters:
            stmt_list = stmt_list.where(and_(*filters))

        stmt_list = select(Order).order_by(desc(Order.created_at)).offset(offset).limit(limit)
        
        result_list = await self.db.execute(stmt_list)
        orders = result_list.scalars().all()

        stmt_count = select(func.count(Order.id)) 
        if filters:
            stmt_count = stmt_count.where(and_(*filters))
            
        result_count = await self.db.execute(stmt_count)
        total_orders = result_count.scalar_one() 

        return orders, total_orders 
    

    async def delete(self,order:Order):
        await self.db.delete(order)
        