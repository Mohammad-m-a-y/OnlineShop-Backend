from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from datetime import datetime, timezone
from app.models.verification_code_model import VerificationCode
from uuid import UUID


class VerificationCodeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, **kwargs) -> VerificationCode:
        code = VerificationCode(**kwargs)
        self.db.add(code)   
        await self.db.flush()
        return code

    async def get_by_id(self, code_id: UUID) -> VerificationCode | None:
        result = await self.db.execute(
            select(VerificationCode).where(VerificationCode.id == code_id)
        )
        return result.scalar_one_or_none()

    async def get_latest_active_code(self, mobile: str, purpose: str) -> VerificationCode | None:
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(VerificationCode)
            .where(
                and_(
                    VerificationCode.mobile == mobile,
                    VerificationCode.purpose == purpose,
                    VerificationCode.is_used.is_(False),
                    VerificationCode.expires_at > now
                )
            )
            .order_by(VerificationCode.created_at.desc())
        )
        return result.scalars().first()

    async def invalidate_all(self, mobile: str, purpose: str):
        now = datetime.now(timezone.utc)
        await self.db.execute(
            update(VerificationCode)
            .where(
                and_(
                    VerificationCode.mobile == mobile,
                    VerificationCode.purpose == purpose,
                    VerificationCode.is_used == False,
                    VerificationCode.expires_at > now
                )
            )
            .values(is_used=True)
        )
        await self.db.flush()

    async def mark_as_used(self, code: VerificationCode):
        code.is_used = True
        await self.db.flush()

    async def increase_attempt(self, code: VerificationCode):
        code.attempt_count += 1
        await self.db.flush()

    async def get_for_verify(self, mobile: str, purpose: str) -> VerificationCode | None:
        return await self.get_latest_active_code(mobile, purpose)
