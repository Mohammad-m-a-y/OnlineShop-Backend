from datetime import datetime
import uuid
from sqlalchemy import ForeignKey, String, Text, Boolean, DateTime, CheckConstraint, func, UUID
from sqlalchemy.orm import Mapped, mapped_column , relationship
from app.models.base_model import Base   



class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), index=True
    )

    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reviews.id", ondelete="CASCADE"),
        nullable=True
    )

    
    rating: Mapped[int] = mapped_column(nullable=False)
    
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now()
    )


    replies: Mapped[list["Review"]] = relationship(
        back_populates="parent",
        cascade="all, delete-orphan"
    )

    parent: Mapped["Review"] = relationship(
        back_populates="replies",
        remote_side=[id]
    )



    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )