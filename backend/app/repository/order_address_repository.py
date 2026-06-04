from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.models.order_address_model import OrderAddress




class OrderAddressRepository :
    def __init__(self, db:AsyncSession):
        self.db = db


    async def create(self, **kwargs):
        order_address = OrderAddress(**kwargs)
        self.db.add(order_address) 
        await self.db.flush()
        return order_address
    

    async def update(self, order_address:OrderAddress, **kwargs):
        for key, value in kwargs.items():
            setattr(order_address, key, value)
        await self.db.flush()
        return order_address   
    

    async def get_by_id(self, order_address_id:UUID):
        stmt = select(OrderAddress).where(OrderAddress.id == order_address_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    


    async def get_by_order_id(self, order_id:UUID):
        stmt = select(OrderAddress).where(OrderAddress.order_id == order_id)
        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()
    


    async def delete(self,order_address:OrderAddress):
        self.db.delete(order_address)
