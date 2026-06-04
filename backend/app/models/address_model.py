from app.models.base_model import Base
from sqlalchemy import String, DateTime, ForeignKey, func , UUID
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship , Mapped, mapped_column
from typing import TYPE_CHECKING



if TYPE_CHECKING:
    from app.models.user_model import User


class Address(Base):
    __tablename__ = 'address'  

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)  
    province: Mapped[str] = mapped_column(String, nullable=False)
    city: Mapped[str] = mapped_column(String, nullable=False)
    full_address: Mapped[str] = mapped_column(String, nullable=False)
    postal_code: Mapped[str] = mapped_column(String, nullable=False)  
    receiver_name: Mapped[str] = mapped_column(String, nullable=False)
    receiver_mobile: Mapped[str] = mapped_column(String, nullable=False)  
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

  
    user: Mapped["User"] = relationship( back_populates="addresses")