from pydantic import BaseModel, computed_field
from uuid import UUID
from datetime import datetime
from app.core.config import settings




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

    @computed_field
    @property
    def full_image_url(self) -> str:
        return f"{settings.BASE_URL}/{self.image_url}"

    class Config:
        from_attributes = True


class AllBrandsResponse(BaseModel):
    total_count: int 
    items: list[BrandResponse]


