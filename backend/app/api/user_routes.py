from fastapi import APIRouter, Depends, Query, UploadFile, File, Form
from app.schemas.user_schemas import CurrentUserResponse 
from app.dependencies.user_dependency import get_user_service
from app.dependencies.current_actor_dependency import get_required_actor
from uuid import UUID
from app.dependencies.role_dependency import require_role
from app.schemas.user_schemas import UsersResponse
from app.dependencies.address_dependency import get_address_service
from app.schemas.address_schemas import UserAddressesResponse
from fastapi_limiter.depends import RateLimiter
from app.schemas.cart_schemas import CartResponse
from app.dependencies.cart_dependency import get_cart_service
from typing import Optional
from pydantic import EmailStr
from typing import Annotated




router = APIRouter(prefix="/users" , tags=["Users"])






@router.get('/',
            response_model=UsersResponse,
            dependencies=[Depends(RateLimiter(times=100, seconds=60))],
            status_code=200
            )
async def get_users(
    page: int = Query(1 , ge=1), 
    page_size: int = Query(10, ge=1, le=100), 
    current_actor= Depends(require_role(["admin", "owner"])),
    service = Depends(get_user_service),
    ):
    
    return await service.get_paginated(
        actor_id = current_actor.id,
        page = page,
        page_size= page_size
    )



@router.get("/me", 
            response_model=CurrentUserResponse, 
            dependencies=[Depends(RateLimiter(times=100, seconds=60))],
            status_code=200
            )
async def read_current_user(current_user : dict = Depends(get_required_actor)):
    return current_user["user"]



@router.get("/me/addresses", 
            response_model=UserAddressesResponse, 
            dependencies=[Depends(RateLimiter(times=100, seconds=60))],
            status_code=200)
async def user_addresses(
    service= Depends(get_address_service),
    current_actor= Depends(get_required_actor)
):
    return await service.get_user_addresses(
        user_id = current_actor["id"]
    )





@router.get("/me/cart",
             response_model=CartResponse, 
             dependencies=[Depends(RateLimiter(times=100, seconds=60))],
             status_code=200
             )
async def user_cart(
    service = Depends(get_cart_service),
    current_actor= Depends(get_required_actor)
):
    return await service.get_cart_for_user(
        user_data = current_actor 
    )




@router.patch("/me", 
            response_model=CurrentUserResponse, 
            dependencies=[Depends(RateLimiter(times=10, seconds=60))],
            status_code=200)
async def update(
    username: Optional[str] = Form(None),
    full_name: Optional[str] = Form(None),
    email: Annotated[Optional[EmailStr], Form()] = None,
    remove_image: bool = Form(False),
    image: Optional[UploadFile] = File(None),
    service = Depends(get_user_service), 
    current_actor: dict= Depends(get_required_actor)
    ):

    return await service.update_user(
        actor_id = current_actor["id"],
        username = username,
        full_name = full_name,
        image = image,
        email = email,
        remove_image = remove_image
    )




@router.patch("/{user_id}/toggle-admin", 
              response_model=CurrentUserResponse,
              dependencies=[Depends(RateLimiter(times=3, seconds=60))], 
              status_code=200
              )
async def toggle_admin(
    user_id:UUID,
    service = Depends(get_user_service),
    current_actor= Depends(require_role(["owner"])),
):
    return await service.toggle_admin_role(
        user_id= user_id,
        actor_id = current_actor.id
    )




@router.patch("/{user_id}/toggle-owner", 
              response_model=CurrentUserResponse,
              dependencies=[Depends(RateLimiter(times=3, seconds=60))], 
              status_code=200
              )
async def toggle_owner(
    user_id:UUID,
    service = Depends(get_user_service),
    current_actor= Depends(require_role(["owner"])),
):
    return await service.toggle_owner_role(
        user_id= user_id,
        actor_id = current_actor.id
    )




@router.patch("/{user_id}/toggle-status", 
              response_model=CurrentUserResponse,
              dependencies=[Depends(RateLimiter(times=3, seconds=60))], 
              status_code=200
              )
async def toggle_status(
    user_id:UUID,
    service = Depends(get_user_service),
    current_actor= Depends(require_role(["owner", "admin"])),
):
    return await service.toggle_status(
        user_id= user_id,
        actor_id = current_actor.id
    )



@router.delete("/{user_id}",
                dependencies=[Depends(RateLimiter(times=5, seconds=60))],
                status_code=204)
async def delete_user(user_id : UUID, service = Depends(get_user_service), current_actor = Depends(get_required_actor)):
    return await service.delete_user(
        user_id = user_id,
        actor_id = current_actor["id"]
    )