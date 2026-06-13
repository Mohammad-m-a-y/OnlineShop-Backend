# app/tasks/cleanup_tasks.py
from sqlalchemy import delete
from datetime import datetime, timezone, timedelta
from app.models.user_model import User
from app.db.async_session import AsyncSessionLocal
from app.core.logging_handler import logger



async def cleanup_unverified_users():
    async with AsyncSessionLocal() as db:
        try:
            cutoff = datetime.now(timezone.utc) - timedelta(days=1)
            result = await db.execute(
                delete(User)
                .where(
                    User.is_verified == False,
                    User.created_at < cutoff
                )
            )
            await db.commit()
            logger.info(f"Deleted {result.rowcount} unverified users")
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to cleanup unverified users: {e}")