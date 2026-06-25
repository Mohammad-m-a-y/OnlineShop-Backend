from datetime import datetime
import uuid
from sqlalchemy import String, Text, Boolean, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.models.base_model import Base


class Slider(Base):
    __tablename__ = "sliders" 

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    link_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    button_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column( DateTime(timezone=True), server_default=func.now() )
    updated_at: Mapped[datetime] = mapped_column( DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def __repr__(self):
        try:
            return f"<Slider(id={self.id}, title={self.title})>"
        except Exception:
            return "<Slider(detached)>"