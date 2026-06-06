from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.verification_code_service import VerificationCodeService
from app.db.async_session import  get_db




async def get_verification_code_service(db:AsyncSession = Depends(get_db)) -> VerificationCodeService:
    return VerificationCodeService(db)
