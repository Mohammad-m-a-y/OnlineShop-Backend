from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.review_service import ReviewService
from app.db.async_session import  get_db




async def get_review_service(db:AsyncSession = Depends(get_db)) -> ReviewService:
    return ReviewService(db)