from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.product_variant_service import ProductVariantService
from app.db.async_session import  get_db




async def get_product_variant_service(db:AsyncSession = Depends(get_db)) -> ProductVariantService:
    return ProductVariantService(db)
