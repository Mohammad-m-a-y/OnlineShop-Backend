from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint, func, UUID
import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base_model import Base
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from app.models.product_model import Product





class ProductImage(Base):
    __tablename__ = "product_images"
    __table_args__ = (
        UniqueConstraint("product_id", "display_order", name="uq_product_images_product_display_order"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    image_url: Mapped[str] = mapped_column(String(1000), nullable=False)

    alt_text: Mapped[str | None] = mapped_column(String(500), nullable=True)

    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    product:Mapped["Product"] = relationship(back_populates="images")
