from pydantic import BaseModel
from decimal import Decimal
from uuid import UUID
from app.core.status_enum import PaymentStatus
from datetime import datetime




class PaymentResponse(BaseModel):
    id: UUID
    order_id: UUID
    gateway: str
    payment_method: str
    transaction_id: str | None = None
    authority: str | None = None
    status: PaymentStatus
    amount: Decimal
    refunded_amount:Decimal | None = None
    description: str | None = None
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True





class InitiatePaymentResponse(BaseModel):
    redirect_url: str
    payment: PaymentResponse


class InitiatePaymentRequest(BaseModel):
    order_id: UUID    