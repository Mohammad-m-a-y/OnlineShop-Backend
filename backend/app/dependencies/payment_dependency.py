from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.payment_service import PaymentService
from app.db.async_session import  get_db




async def get_payment_service(db:AsyncSession = Depends(get_db)) -> PaymentService:
    return PaymentService(db)
