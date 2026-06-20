from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.slider_service import SliderService
from app.db.async_session import  get_db




async def get_slider_service(db:AsyncSession = Depends(get_db)) -> SliderService:
    return SliderService(db)
