from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.admin_service import AdminService
from app.db.async_session import  get_db




async def get_admin_service(db:AsyncSession = Depends(get_db)) -> AdminService:
    return AdminService(db)
