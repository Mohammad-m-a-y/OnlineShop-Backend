from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.category_service import CategoryService
from app.db.async_session import  get_db




async def get_category_service(db:AsyncSession = Depends(get_db)) -> CategoryService:
    return CategoryService(db)
