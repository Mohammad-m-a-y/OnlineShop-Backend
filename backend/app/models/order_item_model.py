from sqlalchemy import ForeignKey, Integer, String, DECIMAL, DateTime, func, UUID
from sqlalchemy.dialects.postgresql import JSONB 
from sqlalchemy.orm import relationship , Mapped, mapped_column
from datetime import datetime
import uuid
from app.models.base_model import Base
from decimal import Decimal
from typing import TYPE_CHECKING ,Optional

if TYPE_CHECKING:
    from app.models.order_model import Order
    from app.models.product_model import Product
    from app.models.product_variant_model import ProductVariant



class OrderItem(Base):
    __tablename__ = 'order_items'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True,default=uuid.uuid4) 
    order_id: Mapped[uuid.UUID] = mapped_column( UUID(as_uuid=True),  ForeignKey("orders.id", ondelete="CASCADE"),  index=True,  nullable=False)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('products.id'), index=True, nullable=False)
    variant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('product_variants.id'), index=True, nullable=False) 

    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    price_at_purchase: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False) 
    discounted_price_at_purchase: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=True) 


    product_name_snapshot: Mapped[Optional[str]] = mapped_column(String, nullable=True) 
    variant_details_snapshot: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


    order:Mapped["Order"] = relationship("Order", back_populates="items") 
    product:Mapped["Product"] = relationship("Product", lazy="selectin")  
    variant:Mapped["ProductVariant"] = relationship("ProductVariant")  
