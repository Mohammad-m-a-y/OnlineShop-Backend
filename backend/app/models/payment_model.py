import uuid
from sqlalchemy import ForeignKey, String, DateTime, func ,DECIMAL,Enum as SQLAlchemyEnum , UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base_model import Base
from datetime import datetime
from app.core.status_enum import PaymentStatus
from decimal import Decimal
from typing import Optional , TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.order_model import Order




class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("orders.id"), index=True, nullable=False )
    
    gateway: Mapped[str] = mapped_column(String, nullable=False) # e.g., "Zarinpal", "Mellat", "PayPal"
    payment_method: Mapped[str] = mapped_column(String, nullable=False) # e.g., "Online", "CardToCard", "COD"
    
    transaction_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)  
    authority: Mapped[Optional[str]] = mapped_column(String, nullable=True)  
    
    status: Mapped[PaymentStatus] = mapped_column(SQLAlchemyEnum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    
    amount: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False)
    refunded_amount: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False, default=Decimal("0.00"))

    description: Mapped[Optional[str]] = mapped_column(String, nullable=True) 

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationship
    order: Mapped["Order"] = relationship("Order", back_populates="payments") 