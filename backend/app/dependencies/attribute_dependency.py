from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.product_attribute_service import ProductAttributeService
from app.db.async_session import  get_db




async def get_attribute_service(db:AsyncSession = Depends(get_db)) -> ProductAttributeService:
    return ProductAttributeService(db)
