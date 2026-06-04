from app.models.base_model import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from sqlalchemy import String, ForeignKey, UniqueConstraint, UUID
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.product_variant_model import ProductVariant




class Attribute(Base):  
    __tablename__ = "attributes"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    variant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("product_variants.id"), nullable=False) 
    name: Mapped[str] = mapped_column(String(50), nullable=False) 
    value: Mapped[str] = mapped_column(String(100), nullable=False)
    
    variant: Mapped["ProductVariant"] = relationship("ProductVariant", back_populates="attributes")

 
    __table_args__ = (
        UniqueConstraint("variant_id", "name", name="uq_variant_attribute_name"),
       
    )