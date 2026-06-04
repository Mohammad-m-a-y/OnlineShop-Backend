from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.auth_service import Auth_service
from app.db.async_session import  get_db




async def get_auth_service(db:AsyncSession = Depends(get_db)) -> Auth_service:
    return Auth_service(db)

