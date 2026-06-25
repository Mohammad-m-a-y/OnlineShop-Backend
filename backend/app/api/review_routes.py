from fastapi import APIRouter, Depends, Query
from app.dependencies.review_dependency import get_review_service
from app.dependencies.role_dependency import require_role
from app.schemas.review_schemas import UpdateReview,ReviewResponse, GetProductReviewsResponse
from uuid import UUID
from fastapi_limiter.depends import RateLimiter
from app.dependencies.current_actor_dependency import get_required_actor
from datetime import datetime




router = APIRouter(prefix="/reviews" , tags=["Reviews"])



@router.get('/',
            response_model=GetProductReviewsResponse,
            dependencies=[Depends(RateLimiter(times=100, seconds=60))],
            status_code=200
            )
async def get_reviews(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    is_approved: bool | None = Query(default=None),
    start_date: datetime | None = Query(default=None),
    end_date: datetime | None = Query(default=None),
    service = Depends(get_review_service),
    current_actor =Depends(require_role(["admin", "owner"]))
):
    return await service.get_reviews_for_admin_dashboard(
        page= page,
        page_size= page_size,
        actor_id = current_actor.id,
        is_approved= is_approved,
        start_date=start_date,
        end_date=end_date
    )




@router.patch("/approve/{review_id}", 
              response_model=ReviewResponse, 
              dependencies=[Depends(RateLimiter(times=30, seconds=60))], 
              status_code=200)
async def approve_review_toggle(
    review_id:UUID,
    service = Depends(get_review_service),
    current_actor =Depends(require_role(["admin", "owner"]))
):
    return await service.approve_review_toggle(        
        actor_id = current_actor.id,
        review_id = review_id
    )



@router.patch("/{review_id}", 
              response_model=ReviewResponse, 
              dependencies=[Depends(RateLimiter(times=5, seconds=60))], 
              status_code=200)
async def update_review(
    review_id:UUID,
    data:UpdateReview,
    service = Depends(get_review_service),
    current_actor =Depends(get_required_actor)
):
    return await service.update_review(
        actor_id=current_actor["id"],
        review_id=review_id,
        rating=data.rating,
        comment=data.comment,
        title=data.title
    )





@router.delete("/{review_id}",
                dependencies=[Depends(RateLimiter(times=5, seconds=60))], 
                status_code=204
                )
async def delete_review(
    review_id:UUID,
    service = Depends(get_review_service),
    current_actor =Depends(get_required_actor)
):
    return await service.delete_review(        
        actor_id = current_actor["id"],
        review_id = review_id
    )