from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from fastapi import  UploadFile, Form, File
from datetime import datetime
from typing import Optional, List







class CategoryBase(BaseModel):
    id: UUID
    name: str
    slug: str
    parent_id: Optional[UUID] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    products_count: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class CategoryNested(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    products_count: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)



class CategoryResponse(CategoryBase):
    children: List[CategoryNested] = Field(default_factory=list)


class Allcategories(BaseModel):
    items: List[CategoryResponse] = Field(default_factory=list)


