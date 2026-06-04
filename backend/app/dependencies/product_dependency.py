from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.product_service import ProductService
from app.db.async_session import  get_db




async def get_product_service(db:AsyncSession = Depends(get_db)) -> ProductService:
    return ProductService(db)


