from fastapi import APIRouter, Depends
from app.dependencies.review_dependency import get_review_service
from app.dependencies.role_dependency import require_role
from app.schemas.review_schemas import UpdateReview,ReviewResponse
from uuid import UUID
from fastapi_limiter.depends import RateLimiter
from app.dependencies.current_actor_dependency import get_required_actor






router = APIRouter(prefix="/reviews" , tags=["Reviews"])




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