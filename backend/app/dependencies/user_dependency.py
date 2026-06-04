from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.user_service import UserService
from app.db.async_session import  get_db




async def get_user_service(db:AsyncSession = Depends(get_db)) -> UserService:
    return UserService(db)


