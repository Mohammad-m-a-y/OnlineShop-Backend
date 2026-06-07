from datetime import datetime
from sqlalchemy import ForeignKey, DateTime, func, UniqueConstraint , UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.models.base_model import Base
import uuid
from typing import TYPE_CHECKING
from sqlalchemy import CheckConstraint


if TYPE_CHECKING:
    from app.models.cart_model import Cart
    from app.models.product_model import Product
    from app.models.product_variant_model import ProductVariant





class CartItem(Base):
    __tablename__ = "cart_items"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True, default=uuid.uuid4
    )
    
    cart_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("carts.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )
    
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id"), 
        index=True, 
        nullable=False  
    )
    
    variant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("product_variants.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False  
    )
    
    quantity: Mapped[int] = mapped_column(
        nullable=False, default=1
    )
    
    added_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

 
    cart: Mapped["Cart"] = relationship("Cart", back_populates="items")
    product: Mapped["Product"] = relationship("Product", lazy="selectin") 
    variant: Mapped[Optional["ProductVariant"]] = relationship("ProductVariant", lazy="selectin")

  
    __table_args__ = (
        UniqueConstraint(
            "cart_id", 
            "variant_id", 
            name="uq_cart_item_variant"
        ),
        CheckConstraint("quantity > 0", name="ck_cart_item_quantity_positive"),
    )

    def __repr__(self):
        return f"<CartItem(id={self.id}, cart_id={self.cart_id}, product_id={self.product_id}, variant_id={self.variant_id}, quantity={self.quantity})>"
