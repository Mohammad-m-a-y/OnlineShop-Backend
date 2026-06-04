import uuid
from sqlalchemy import ForeignKey, String, Integer, DateTime, func,DECIMAL, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base_model import Base
from typing import TYPE_CHECKING
from datetime import datetime
from decimal import Decimal


if TYPE_CHECKING:
    from app.models.product_model import Product
    from app.models.attribute_model import Attribute



class ProductVariant(Base):
    __tablename__ = "product_variants"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),primary_key=True, default=uuid.uuid4)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("products.id"))
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    price_modifier: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), default=0) 
    discounted_price: Mapped[Decimal | None] = mapped_column(DECIMAL(12, 2), nullable=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    created_at:Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )
    

    product: Mapped["Product"] = relationship("Product", back_populates="variants")
    attributes: Mapped[list["Attribute"]] = relationship("Attribute", back_populates="variant")

