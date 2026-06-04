import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, func , UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
from app.models.base_model import Base
from typing import TYPE_CHECKING
from sqlalchemy import CheckConstraint
from app.core.status_enum import CartStatus
from sqlalchemy import Enum

if TYPE_CHECKING:
    from app.models.user_model import User
    from app.models.cart_item_model import CartItem





class Cart(Base):
    __tablename__ = "carts"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"), index=True, nullable=True
    )
    session_id: Mapped[Optional[str]] = mapped_column(
        String(255), index=True, unique=True, nullable=True
    )
    status: Mapped[CartStatus] = mapped_column(Enum(CartStatus), default=CartStatus.ACTIVE , nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )


    user: Mapped["User"] = relationship("User", back_populates="carts")
    

    items: Mapped[List["CartItem"]] = relationship("CartItem", back_populates="cart")

    __table_args__ = (
        CheckConstraint(
        "(user_id IS NOT NULL) OR (session_id IS NOT NULL)",
        name="ck_cart_user_or_session"
    ),
    )

    def __repr__(self):
        return f"<Cart(id={self.id}, user_id={self.user_id})>"
