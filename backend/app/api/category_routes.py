from app.dependencies.role_dependency import require_role
from uuid import UUID
from fastapi import APIRouter, Depends
from app.dependencies.category_dependency import get_category_service
from app.schemas.category_schemas import CategoryResponse, CreateCategory,UpdateCategory, Allcategories
from fastapi_limiter.depends import RateLimiter
from app.dependencies.user_rate_limiter_dependency import user_identifier




router = APIRouter(prefix="/categories" , tags=["Categories"])






@router.get("/", 
            response_model=Allcategories, 
            dependencies=[Depends(RateLimiter(times=100, seconds=60, identifier=user_identifier))], 
            status_code=200)
async def get_categories(service = Depends(get_category_service)):
    return await service.get_all_categories()





@router.post("/", 
             response_model=CategoryResponse, 
             dependencies=[Depends(RateLimiter(times=10, seconds=60, identifier=user_identifier))], 
             status_code=201)
async def create_category(
    data:CreateCategory,
    current_actor=Depends(require_role(["admin", "owner"])),
    service = Depends(get_category_service)
):
    return await service.create_category(
        actor_id=current_actor.id,
        name= data.name,
        slug= data.slug,
        parent_id= data.parent_id,
        description= data.description,
        image= data.image
    )



@router.patch("/{category_id}", 
              response_model=CategoryResponse, 
              dependencies=[Depends(RateLimiter(times=10, seconds=60, identifier=user_identifier))], 
              status_code=200)
async def update_category(
    category_id:UUID,
    data:UpdateCategory,
    current_actor=Depends(require_role(["admin", "owner"])),
    service = Depends(get_category_service)
):
    return await service.update_category(
        category_id= category_id,
        actor_id=current_actor.id,
        name= data.name,
        slug= data.slug,
        parent_id= data.parent_id,
        description= data.description,
        image= data.image,
        remove_image= data.remove_image
    )




@router.delete("/{category_id}", 
               dependencies=[Depends(RateLimiter(times=10, seconds=60, identifier=user_identifier))], 
               status_code=204)
async def delete_category(
    category_id:UUID,
    current_actor=Depends(require_role(["admin", "owner"])),
    service = Depends(get_category_service)
):
        return await service.delete_category(
        category_id= category_id,
        actor_id=current_actor.id,
    )