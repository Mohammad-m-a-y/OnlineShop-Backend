import uuid
from sqlalchemy import Boolean, String, DateTime, func, UUID
from app.models.base_model import Base
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy.orm import relationship , Mapped, mapped_column

if TYPE_CHECKING:
    from app.models.address_model import Address 
    from app.models.refresh_token_model import RefreshToken
    from app.models.cart_model import Cart
    from app.models.review_model import Review




class User(Base):
    __tablename__ = 'users'

    id: Mapped[uuid.UUID]= mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String,unique=True, index=True , nullable=False)
    mobile: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_owner: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now(),nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now(),onupdate=func.now(),nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False , nullable=False)



    addresses: Mapped[list["Address"]] = relationship(back_populates="user", cascade= "all, delete-orphan")
    refresh_tokens:Mapped[list["RefreshToken"]] = relationship(back_populates="user",cascade="all, delete-orphan")
    carts : Mapped[list["Cart"]] = relationship("Cart",back_populates="user")
    reviews: Mapped[list["Review"]] = relationship(back_populates="user")