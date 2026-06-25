from uuid import UUID
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Optional
from app.core.status_enum import OrderStatus
from app.schemas.payment_schemas import PaymentResponse
from app.schemas.product_schemas import ProductBriefResponse



class CreateOrder(BaseModel):
    cart_id:UUID
    address_id:UUID
    shipping_method: str
    notes: str | None = None


class UpdateOrder(BaseModel):
    status: OrderStatus | None = None
    tracking_code: str | None = None
    shipping_method: str | None = None



class OrderItems(BaseModel):
    id: UUID
    quantity: int
    price_at_purchase: Decimal
    discounted_price_at_purchase: Decimal
    product_name_snapshot: str
    variant_details_snapshot: dict
    created_at: datetime
    updated_at: datetime
    product: ProductBriefResponse

    class Config:
        from_attributes = True



class OrderAddress(BaseModel):
    id: UUID
    province: str
    city: str
    full_address: str
    postal_code: str
    receiver_name: str
    receiver_mobile: str

    class Config:
        from_attributes = True




class OrderResponse(BaseModel):
    id:UUID
    user_id:UUID
    total_amount:Decimal
    discount_amount:Decimal
    final_amount:Decimal
    shipping_method:str 
    tracking_code:Optional[str] = None
    status:OrderStatus
    notes:Optional[str] = None
    created_at:datetime
    updated_at:datetime
    shipping_address: OrderAddress  # has receiver_name name in it
    items: list[OrderItems] = []
    payments: list[PaymentResponse] = []

    class Config:
        from_attributes = True






class GetOrdersResponse(BaseModel):
    items:list[OrderResponse]
    page:int
    page_size:int
    total_pages:int
    total_count:int