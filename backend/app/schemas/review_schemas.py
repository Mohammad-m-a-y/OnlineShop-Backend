from uuid import UUID
from pydantic import BaseModel,Field
from datetime import datetime
from typing import Optional, List





class CreateReview(BaseModel):
    rating: int = Field(1, ge=1, le=5)
    comment: str
    title: Optional[str] = None
    parent_id: Optional[UUID] | None = None





class UpdateReview(BaseModel):
    rating: Optional[int] = Field( ge=1, le=5)
    comment: Optional[str] = None
    title: Optional[str] = None



class ReviewResponse(BaseModel):
    id: UUID
    user_id: UUID
    product_id: UUID
    parent_id: Optional[UUID] = None
    rating: int
    title: Optional[str] = None
    comment: str
    is_approved: bool
    created_at: datetime
    updated_at: datetime
    replies: List["ReviewResponse"] = []

    class Config:
        from_attributes = True


ReviewResponse.model_rebuild()



class GetProductReviewsResponse(BaseModel):
    items: List[ReviewResponse]
    page: int
    page_size: int
    total_pages: int
    total_count: int