from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from app.models.refresh_token_model import RefreshToken
from uuid import UUID


class RefreshTokenRepository:
    def __init__(self, db: AsyncSession):
        self.db = db


    async def create(self, **kwargs) -> RefreshToken:
        refresh_token = RefreshToken(**kwargs)
        self.db.add(refresh_token)  
        await self.db.flush()      
        return refresh_token

    async def get_by_token(self, token: str) -> RefreshToken | None:
        result = await self.db.execute(
            select(RefreshToken).filter(RefreshToken.token == token)
        )
        return result.scalar_one_or_none()

    async def revoke_token(self, refresh_token: RefreshToken) -> None:
        refresh_token.is_revoked = True
        await self.db.flush()

    async def revoke_all_for_user(self, user_id: UUID):

        await self.db.execute(
            update(RefreshToken)
            .where(and_(RefreshToken.user_id == user_id, RefreshToken.is_revoked == False))
            .values(is_revoked=True)
        )
        await self.db.flush()