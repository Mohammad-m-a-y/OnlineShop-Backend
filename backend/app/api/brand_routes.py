from app.dependencies.brand_dependency import get_brand_service
from uuid import UUID
from fastapi import APIRouter, Depends
from app.schemas.brand_schemas import CreateBrand, BrandResponse, UpdateBrand, AllBrandsResponse
from app.dependencies.role_dependency import require_role
from fastapi_limiter.depends import RateLimiter
from app.dependencies.user_rate_limiter_dependency import user_identifier




router = APIRouter(prefix="/brands" , tags=["Brands"])







@router.get("/", 
            response_model=AllBrandsResponse, 
            dependencies=[Depends(RateLimiter(times=100, seconds=60, identifier=user_identifier))], 
            status_code=200)
async def get_all_brands(service= Depends(get_brand_service)):
    return await service.get_all_brands()




@router.post("/", 
             response_model=BrandResponse, 
             dependencies=[Depends(RateLimiter(times=10, seconds=60, identifier=user_identifier))], 
             status_code=201)
async def create_brand(
    data:CreateBrand,
    service= Depends(get_brand_service),
    cuurent_user = Depends(require_role(['admin','owner']))
    ):
    return await service.create_brand(
        actor_id= cuurent_user.id,
        name=data.name,
        slug=data.slug,
        description=data.description
    )



@router.put("/{brand_id}", 
            response_model=BrandResponse, 
            dependencies=[Depends(RateLimiter(times=10, seconds=60, identifier=user_identifier))], 
            status_code=200)
async def update_brand(
    brand_id:UUID,
    data:UpdateBrand,
    service= Depends(get_brand_service),
    cuurent_user = Depends(require_role(['admin','owner']))
):
    
    return await service.update_brand(
        actor_id=cuurent_user.id,
        brand_id=brand_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        image=data.image,
        remove_image=data.remove_image
    )





@router.delete("/{brand_id}",
                dependencies=[Depends(RateLimiter(times=10, seconds=60, identifier=user_identifier))], 
                status_code=204
                )
async def delete_brand(
    brand_id:UUID,
    service= Depends(get_brand_service),
    cuurent_user = Depends(require_role(['admin','owner']))
):
    return await service.delete_brand(
        brand_id= brand_id,
        actor_id= cuurent_user.id
    )