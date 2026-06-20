from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field , computed_field
from datetime import datetime
from typing import Optional, List
from app.core.config import settings






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

    @computed_field
    @property
    def full_image_url(self) -> str:
        return f"{settings.BASE_URL}/{self.image_url}"

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


