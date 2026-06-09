from datetime import datetime
from typing import Optional
import uuid
from sqlalchemy import ForeignKey, String, DateTime, func ,DECIMAL , UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base_model import Base
from app.core.status_enum import OrderStatus
from sqlalchemy import Enum
from decimal import Decimal
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.order_address_model import OrderAddress
    from app.models.order_item_model import OrderItem
    from app.models.payment_model import Payment





class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("users.id"), index=True)

    total_amount: Mapped[Decimal] = mapped_column(DECIMAL(12, 2),nullable=False)
    discount_amount: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(12, 2),nullable=False, default=0)
    final_amount: Mapped[Decimal] = mapped_column(DECIMAL(12, 2),nullable=False)
    
    shipping_method: Mapped[str] = mapped_column(String(50))
    tracking_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    status: Mapped[OrderStatus] = mapped_column(
    Enum(OrderStatus), 
    default=OrderStatus.PENDING,
    nullable=False
    )
    
    notes: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=func.now(), server_default=func.now())

    shipping_address: Mapped["OrderAddress"] = relationship(
        "OrderAddress", back_populates="order", uselist=False
    )

    items: Mapped[list["OrderItem"]] = relationship("OrderItem",back_populates="order") 
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="order")

    def __repr__(self) -> str:
        return f"Order(id={self.id}, final_amount={self.final_amount})"




# 2c092e08-41de-48c7-a64c-6afaa900bab6