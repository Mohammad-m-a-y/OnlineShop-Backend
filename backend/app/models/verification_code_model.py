from app.models.base_model import Base
from sqlalchemy import Boolean, String, DateTime, func, Integer, UUID
import uuid
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime



class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    mobile: Mapped[str] = mapped_column(String, index=True, nullable=False)    
    code_hash: Mapped[str] = mapped_column(String, nullable=False)            
    purpose: Mapped[str] = mapped_column(String, nullable=False)               

    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)   
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)                    
    max_attempts: Mapped[int] = mapped_column(Integer, default=5)                      

    is_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)       
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
