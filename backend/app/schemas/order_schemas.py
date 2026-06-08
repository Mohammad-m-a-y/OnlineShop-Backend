from uuid import UUID
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Optional
from app.core.status_enum import OrderStatus
 




class CreateOrder(BaseModel):
    cart_id:UUID
    address_id:UUID
    shipping_method: str
    tracking_code: str | None = None
    notes: str | None = None




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





class GetOrdersResponse(BaseModel):
    items:list[OrderResponse]
    page:int
    page_size:int
    total_pages:int
    total_count:int