from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.order_service import OrderService
from app.db.async_session import  get_db




async def get_order_service(db:AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(db)
