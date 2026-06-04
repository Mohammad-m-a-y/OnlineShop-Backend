from pydantic import BaseModel , Field
from decimal import Decimal
from uuid import UUID
from datetime import datetime
from fastapi import  UploadFile, Form, File




#=========== products ============

class CreateProduct(BaseModel):
    name: str
    slug:str
    description:str
    base_price:Decimal
    brand_id:UUID | None = None
    short_description:str | None = None





class UpdateProduct(BaseModel):
    name:str | None = None
    slug:str | None = None
    description:str | None = None
    base_price:Decimal | None = None
    short_description:str | None = None
    category_ids: list[UUID] | None = None
    brand_id:UUID | None = None
    remove_brand: bool = False
    is_active:bool | None = None
    is_available:bool | None = None




class ProductResponse(BaseModel):
    id:UUID
    name:str
    slug:str
    description:str
    base_price:Decimal
    short_description:str | None
    is_active: bool
    is_available: bool
    created_at: datetime
    updated_at: datetime | None
    #categories
    #brand
    #images
    class Config:
        from_attributes = True






class GetProductsRequest(BaseModel):
    page: int  = Field(1, ge=1)
    page_size: int = Field(10, ge=1, le=100)
    brand_id: UUID
    min_price: Decimal
    max_price: Decimal
    category_ids: list[UUID]




class GetProductsResponse(BaseModel):
    items: list[ProductResponse]
    page: int
    page_size: int
    total_pages: int
    total_count: int





#=========== product images ============

class CreateProductImage(BaseModel):
    product_id: UUID = Form(...)
    image: UploadFile = File(...)
    display_order:int = Form(...)
    is_primary:bool = Form(False)
    alt_text: str | None = Form(None)



class UpdateProductImage(BaseModel):
    image_id: UUID
    new_order: int



class ProductImageResponse(BaseModel):
    id: UUID
    product_id: UUID
    image_url: str
    alt_text: str
    display_order: int
    is_primary: bool
    created_at: datetime

    class Config:
        from_attributes = True



#=========== product variants ============

class CreateProductVariant(BaseModel):
    product_id: UUID
    sku: str
    price_modifier: Decimal
    stock_quantity: int
    discounted_price: Decimal


class UpdateProductVariant(BaseModel):
    sku: str | None = None
    price_modifier: Decimal | None = None
    discounted_price: Decimal | None = None
    stock_quantity: int | None = None



class ProductVariantResponse(BaseModel):
    id:UUID
    product_id:UUID
    sku: str
    price_modifier: Decimal
    discounted_price: Decimal
    stock_quantity: int
    created_at: datetime
    updated_at: datetime | None
    #attributes

    class Config:
        from_attributes = True





#=========== product attributes ============

class CreateProductAttribute(BaseModel):
    name: str
    value: str



class UpdateProductAttribute(BaseModel):
    name: str | None
    value: str | None




class ProductAttributeResponse(BaseModel):
    id: UUID
    variant_id: UUID
    name: str
    value: str