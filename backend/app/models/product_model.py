import uuid
from sqlalchemy import String, Text, Boolean, DateTime ,func, ForeignKey , DECIMAL, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.models.base_model import Base
from app.models.associations import product_categories
from decimal import Decimal
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.category_model import Category 
    from app.models.brand_model import Brand
    from app.models.product_image_model import ProductImage
    from app.models.product_variant_model import ProductVariant




class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)

    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    brand_id: Mapped[uuid.UUID | None] = mapped_column(
    UUID(as_uuid=True),
    ForeignKey("brands.id"),
    nullable=True,
    index=True
    )


    description: Mapped[str] = mapped_column(Text, nullable=False)

    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    base_price: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


    categories: Mapped[list["Category"]] = relationship(
        "Category",
        secondary=product_categories,
        lazy="selectin",
        back_populates="products"
    )

    brand:Mapped["Brand"] = relationship(back_populates="products")
    
    images:Mapped[list["ProductImage"]] = relationship(
    back_populates="product",
    cascade="all, delete-orphan",
    lazy="selectin",
    order_by="ProductImage.display_order")

    variants:Mapped[list["ProductVariant"]] = relationship(
        "ProductVariant",
        back_populates="product",
        cascade="all, delete-orphan",
        lazy="selectin"
        )

