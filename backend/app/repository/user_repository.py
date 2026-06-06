from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user_model import User
from uuid import UUID


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, **kwargs):
        user = User(**kwargs)
        self.db.add(user)
        await self.db.flush()
        return user


    async def get_by_id(self, user_id: UUID):
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_mobile(self, mobile: str):
        result = await self.db.execute(
            select(User).where(User.mobile == mobile)
        )
        return result.scalar_one_or_none()
    

    async def get_by_username(self, username: str):
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()


    async def get_by_email(self, email: str):
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    

    async def get_by_password(self, hashed_password:str):
        result = await self.db.execute(
            select(User).where(User.hashed_password == hashed_password)
        )
        return result.scalar_one_or_none()


    async def users(self):
        result = await self.db.execute(select(User))
        return result.scalars().all()


    async def update(self, user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            setattr(user, key, value)
        await self.db.flush()
        return user

    async def update_user_image_path(self, user_id: UUID, image_path: str | None):
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        if user:
            user.image_url = image_path
            await self.db.flush()
        return user

    async def delete(self, user: User) -> None:
        await self.db.delete(user)



    async def toggle_admin(self, user: User):
        new_role = not user.is_admin
        user.is_admin = new_role
        await self.db.flush()

        return user



    async def toggle_owner(self, user:User):
        new_role = not user.is_owner
        user.is_owner = new_role
        await self.db.flush()

        return user
    

    async def toggle_active(self, user:User):
        new_stat = not user.is_active
        user.is_active = new_stat
        await self.db.flush()
        return user


    async def get_paginated_users(self, limit: int, offset: int):
        count_result = await self.db.execute(
            select(func.count()).select_from(User)
        )
        total = count_result.scalar_one()

        result = await self.db.execute(
            select(User)
            .order_by(User.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        items = result.scalars().all()

        return items, total