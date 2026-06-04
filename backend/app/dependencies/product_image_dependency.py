from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.product_image_service import ProductImageService
from app.db.async_session import  get_db




async def get_product_image_service(db:AsyncSession = Depends(get_db)) -> ProductImageService:
    return ProductImageService(db)
