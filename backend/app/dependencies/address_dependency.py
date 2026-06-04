from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.address_service import AddressService
from app.db.async_session import  get_db




async def get_address_service(db:AsyncSession = Depends(get_db)) -> AddressService:
    return AddressService(db)
