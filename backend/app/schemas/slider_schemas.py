from pydantic import BaseModel, computed_field
from uuid import UUID
from datetime import datetime
from app.core.config import settings



class SliderResponse(BaseModel):
    id:UUID
    title: str
    description: str | None = None
    image_url: str
    link_url: str | None = None
    button_text: str | None = None
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def full_image_url(self) -> str:
        return f"{settings.BASE_URL}/{self.image_url}"

    class Config:
        from_attributes = True



class GetSlidersResponse(BaseModel):
    items: list[SliderResponse]