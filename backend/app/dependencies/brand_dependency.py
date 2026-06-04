from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.brand_service import BrandService
from app.db.async_session import  get_db




async def get_brand_service(db:AsyncSession = Depends(get_db)) -> BrandService:
    return BrandService(db)

