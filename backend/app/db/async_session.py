from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings



settings = get_settings()


engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=True, 
    future=True
)


AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


async def get_db():
    async with AsyncSessionLocal() as db:
        try:
            yield db
            
        except Exception:
            await db.rollback()
            raise
        finally:
            await db.close()