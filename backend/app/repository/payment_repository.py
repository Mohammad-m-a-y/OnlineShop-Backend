from app.models.payment_model import Payment
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import joinedload






class PaymentRepository:
    def __init__(self, db:AsyncSession):
        self.db = db

    
    async def create(self, **kwargs):
        payment = Payment(**kwargs)
        self.db.add(payment)
        await self.db.flush()
        return payment
    

    async def update(self, payment:Payment,**kwargs):
        for key , value in kwargs.items():
            setattr(payment, key,value)
        await self.db.flush()
        return payment   

    

    async def get_by_id(self,payment_id:UUID):
        stmt = select(Payment).where(Payment.id == payment_id).options(
            joinedload(Payment.order)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    

    async def get_by_order_id(self,order_id:UUID):
        stmt = select(Payment).where(Payment.order_id == order_id).options(
            joinedload(Payment.order)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    

    async def get_by_authority(self, authority:str):
        stmt = select(Payment).where(Payment.authority == authority).options(
            joinedload(Payment.order)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    

