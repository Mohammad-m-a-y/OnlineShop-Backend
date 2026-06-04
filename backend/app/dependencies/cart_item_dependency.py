from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.cart_item_service import CartItemService
from app.db.async_session import  get_db




async def get_cart_item_service(db:AsyncSession = Depends(get_db)) -> CartItemService:
    return CartItemService(db)
