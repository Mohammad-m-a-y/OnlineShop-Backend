from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.cart_service import CartService
from app.db.async_session import  get_db




async def get_cart_service(db:AsyncSession = Depends(get_db)) -> CartService:
    return CartService(db)

