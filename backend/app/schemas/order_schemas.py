from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional
from app.core.status_enum import OrderStatus
 




class CreateOrder(BaseModel):
    cart_id:UUID
    address_id:UUID
    shipping_method: str
    # payment_id = None
    tracking_code: str = None
    notes: str = None




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
    # shipping_address:
    # items:
    # payment:




class GetOrdersRequest(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)
    user_id: Optional[UUID] = None
    status: Optional[OrderStatus] = None 
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class GetOrdersResponse(BaseModel):
    items:list[OrderResponse]
    page:int
    page_size:int
    total_pages:int
    total_count:int