from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime
from app.core.status_enum import CartStatus
from typing import Optional
from app.schemas.product_schemas import ProductResponse, ProductVariantResponse




class CartResponse(BaseModel):
    id:UUID
    user_id:UUID | None
    session_id:str | None
    status:CartStatus 
    created_at:datetime
    updated_at:datetime
    # items:
    class Config:
        from_attributes = True





class GetCartsResponse(BaseModel):
    items: list[CartResponse]
    page:int
    page_size:int
    total_pages:int
    total_count:int





class CreateCartItem(BaseModel):
    product_id:UUID
    variant_id:UUID
    quantity:int = Field(ge=0)




class CartItemResponse(BaseModel):
    id:UUID
    cart_id:UUID
    quantity:int
    added_at:datetime
    # product: ProductResponse
    # variant: ProductVariantResponse

    class Config:
        from_attributes = True