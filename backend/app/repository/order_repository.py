from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc,func , insert
from uuid import UUID
from app.models.order_model import Order
from datetime import datetime , timedelta, timezone
from sqlalchemy.orm import  selectinload
from app.models.order_item_model import OrderItem
from app.core.status_enum import OrderStatus
from app.models.product_model import Product



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
          selectinload(Order.items),
          selectinload(Order.payments)
        )
        result = await self.db.execute(stmt)
        return result.unique().scalar_one_or_none()
    

    async def get_to_reduce_stock_for_order(self, order_id:UUID):
        stmt = select(Order).where(Order.id == order_id).with_for_update().options(
            selectinload(Order.items).joinedload(OrderItem.variant)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    

    async def get_by_user_id(self, user_id:UUID):
        stmt = select(Order).where(Order.user_id == user_id)
        result = await self.db.execute(stmt)

        return result.scalars().all()


    async def get_all(self, 
        offset: int = 0, 
        limit: int = 20, 
        user_id: UUID = None, 
        status: OrderStatus = None, 
        start_date: datetime = None, 
        end_date:datetime = None       
        ):
        
        stmt_list = select(Order).options(
            selectinload(Order.items).joinedload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.payments)
        ).order_by(desc(Order.created_at)).offset(offset).limit(limit)
        
        filters = []
        if user_id: filters.append(Order.user_id == user_id)
        if status: filters.append(Order.status == status)
        if start_date: filters.append(Order.created_at >= start_date)
        if end_date: filters.append(Order.created_at <= end_date)

        if filters:
            stmt_list = stmt_list.where(and_(*filters))

        
        result_list = await self.db.execute(stmt_list)
        orders = result_list.unique().scalars().all()

        stmt_count = select(func.count(Order.id)) 
        if filters:
            stmt_count = stmt_count.where(and_(*filters))
            
        result_count = await self.db.execute(stmt_count)
        total_orders = result_count.scalar_one() 

        return orders, total_orders 


    # used in payment service
    async def get_by_id_for_update(self,order_id: UUID) -> Order | None:

        stmt = (
            select(Order)
            .where(Order.id == order_id)
            .with_for_update()
        )

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()



    # for admin dashboard
    async def orders_count(self, start_date: datetime | None = None, end_date: datetime | None = None):
        stmt = select(func.count(Order.id))

        filters = []

        if start_date:
            filters.append(Order.created_at >= start_date)

        if end_date:
            filters.append(Order.created_at <= end_date)

        if filters:
            stmt = stmt.where(and_(*filters)) 

        else:
            now = datetime.now(timezone.utc)

            start_of_day = now.replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0
            )

            end_of_day = start_of_day + timedelta(days=1)

            stmt = stmt.where(Order.created_at >= start_of_day, Order.created_at < end_of_day)

        
        count = await self.db.execute(stmt)
        return count.scalar() or 0
        
    

    async def delete(self,order:Order):
        await self.db.delete(order)
        