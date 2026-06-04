from app.models.base_model import Base
import uuid
from sqlalchemy.orm import mapped_column,Mapped, relationship
from sqlalchemy import (String, DateTime, func, ForeignKey, UUID)
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user_model import User





class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'),nullable=False)

    token: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    is_revoked: Mapped[bool] = mapped_column(
        default=False
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="refresh_tokens")

