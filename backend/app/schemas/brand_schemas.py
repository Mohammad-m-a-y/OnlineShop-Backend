from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from fastapi import File, UploadFile, Form 



class CreateBrand(BaseModel):
    name: str
    slug: str
    description: str | None = None




class BrandResponse(BaseModel):
    id:UUID
    name:str
    slug:str
    image_url:str | None
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    products_count: int | None = None

    class Config:
        from_attributes = True


class AllBrandsResponse(BaseModel):
    total_count: int 
    items: list[BrandResponse]


