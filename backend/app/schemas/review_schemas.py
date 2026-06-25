from uuid import UUID
from pydantic import BaseModel,Field , computed_field
from datetime import datetime
from typing import Optional, List
from app.core.config import settings




class CreateReview(BaseModel):
    rating: int | None = None
    comment: str
    title: Optional[str] = None
    parent_id: Optional[UUID] | None = None





class UpdateReview(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None
    title: Optional[str] = None



class UserMiniResponse(BaseModel):
    id: UUID
    username: str 
    image_url: str | None = None

    @computed_field
    @property
    def full_image_url(self) -> str:
        return f"{settings.BASE_URL}/{self.image_url}"

    class Config:
        from_attributes = True



class ReviewResponse(BaseModel):
    id: UUID
    user_id: UUID
    product_id: UUID
    parent_id: Optional[UUID] = None
    rating: int | None = None
    title: Optional[str] = None
    comment: str
    is_approved: bool
    created_at: datetime
    updated_at: datetime
    replies: List["ReviewResponse"] = []
    user: UserMiniResponse

    class Config:
        from_attributes = True


ReviewResponse.model_rebuild()



class GetProductReviewsResponse(BaseModel):
    items: List[ReviewResponse]
    page: int
    page_size: int
    total_pages: int
    total_count: int