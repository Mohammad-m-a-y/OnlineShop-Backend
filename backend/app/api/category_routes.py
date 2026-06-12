from app.dependencies.role_dependency import require_role
from uuid import UUID
from fastapi import APIRouter, Depends, Form, File, UploadFile , Query
from app.dependencies.category_dependency import get_category_service
from app.schemas.category_schemas import CategoryResponse, Allcategories
from fastapi_limiter.depends import RateLimiter
from app.dependencies.current_actor_dependency import get_actor




router = APIRouter(prefix="/categories" , tags=["Categories"])






@router.get("/", 
            response_model=Allcategories, 
            dependencies=[Depends(RateLimiter(times=100, seconds=60))], 
            status_code=200)
async def get_categories(
    is_active : bool | None = Query(default=None),
    current_actor = Depends(get_actor), 
    service = Depends(get_category_service)
    ):
    return await service.get_all_categories(
        is_active= is_active,
        actor_data = current_actor 
    )





@router.post("/", 
             response_model=CategoryResponse, 
             dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
             status_code=201)
async def create_category(
    name: str = Form(...),
    slug: str = Form(...),
    parent_id: str | None = Form(None),
    description: str | None = Form(None),
    image: UploadFile | None = File(None),
    current_actor=Depends(require_role(["admin", "owner"])),
    service = Depends(get_category_service)
):
    return await service.create_category(
        actor_id=current_actor.id,
        name= name,
        slug= slug,
        parent_id= parent_id,
        description= description,
        image= image
    )



@router.patch("/{category_id}", 
              response_model=CategoryResponse, 
              dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
              status_code=200)
async def update_category(
    category_id:UUID,
    name: str | None = Form(None),
    slug: str | None = Form(None),
    parent_id: str | None = Form(None),
    description: str | None = Form(None),
    image: UploadFile | None = File(None),
    remove_image: bool = Form(False),
    current_actor=Depends(require_role(["admin", "owner"])),
    service = Depends(get_category_service)
):
    return await service.update_category(
        category_id= category_id,
        actor_id=current_actor.id,
        name= name,
        slug= slug,
        parent_id= parent_id,
        description= description,
        image= image,
        remove_image= remove_image
    )





@router.patch("/{category_id}/toggle-status",
            dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
            status_code=200
            )
async def toggle_category_status(
    category_id:UUID,
    service= Depends(get_category_service),
    cuurent_user = Depends(require_role(['admin','owner']))
):
    await service.toggle_status(
        category_id= category_id,
        actor_id= cuurent_user.id
    )




@router.delete("/{category_id}", 
               dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
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