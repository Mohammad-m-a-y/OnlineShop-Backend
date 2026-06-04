from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from fastapi import  UploadFile, Form, File
from datetime import datetime
from typing import Optional, List





class CreateCategory(BaseModel):
    name: str = Form(...)
    slug: str = Form(...)
    parent_id: str | None = Form(None)
    description: str | None = Form(None)
    image: UploadFile | None = File(None) 



class UpdateCategory(BaseModel):
    name: str | None = Form(None)
    slug: str | None = Form(None)
    parent_id: str | None = Form(None)
    description: str | None = Form(None)
    image: UploadFile | None = File(None) 
    remove_image: bool = Form(False)





class CategoryBase(BaseModel):
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
    parent: Optional[CategoryNested] = None
    children: List[CategoryNested] = Field(default_factory=list)


class Allcategories(BaseModel):
    items: List[CategoryResponse] = Field(default_factory=list)


