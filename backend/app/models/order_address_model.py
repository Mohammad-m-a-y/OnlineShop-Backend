import uuid
from sqlalchemy import ForeignKey, String, UUID
from sqlalchemy.orm import Mapped, mapped_column , relationship
from app.models.base_model import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.order_model import Order



class OrderAddress(Base):
    __tablename__ = "order_addresses"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), unique=True)

    province:Mapped[str] = mapped_column(String(50), nullable=False)
    city: Mapped[str] = mapped_column(String(50), nullable=False)
    full_address: Mapped[str] = mapped_column(String(500), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False)  
    receiver_name: Mapped[str] = mapped_column(String, nullable=False)
    receiver_mobile: Mapped[str] = mapped_column(String(20), nullable=False)
    

    order: Mapped["Order"] = relationship(back_populates="shipping_address")

