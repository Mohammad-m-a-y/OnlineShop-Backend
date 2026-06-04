from fastapi import APIRouter, Depends, Query
from app.schemas.user_schemas import CurrentUserResponse , UpdateUser
from app.dependencies.user_dependency import get_user_service
from app.dependencies.current_actor_dependency import get_actor
from uuid import UUID
from app.dependencies.role_dependency import require_role
from app.schemas.user_schemas import UsersResponse
from app.dependencies.address_dependency import get_address_service
from app.schemas.address_schemas import UserAddressesResponse
from fastapi_limiter.depends import RateLimiter
from app.dependencies.user_rate_limiter_dependency import user_identifier




router = APIRouter(prefix="/users" , tags=["Users"])






@router.get('/',
            response_model=UsersResponse,
            dependencies=[Depends(RateLimiter(times=100, seconds=60, identifier=user_identifier))],
            status_code=200
            )
async def get_users(
    page: int = Query(1 , ge=1), 
    page_size: int = Query(10, ge=1, le=100), 
    current_actor= require_role(["admin", "owner"]),
    service = Depends(get_user_service),
    ):
    
    return await service.get_paginated(
        actor_id = current_actor.id,
        page = page,
        page_size= page_size
    )





@router.get("/me", 
            response_model=CurrentUserResponse, 
            dependencies=[Depends(RateLimiter(times=100, seconds=60, identifier=user_identifier))],
            status_code=200
            )
async def read_current_user(current_user : dict = Depends(get_actor)):
    return current_user["user"]



@router.get("/me/addresses", response_model=UserAddressesResponse, status_code=200)
async def user_addresses(
    service= Depends(get_address_service),
    current_actor= Depends(get_actor)
):
    return await service.get_user_addresses(
        user_id = current_actor["id"]
    )




@router.put("/me", 
            response_model=CurrentUserResponse, 
            dependencies=[Depends(RateLimiter(times=10, seconds=60, identifier=user_identifier))],
            status_code=200)
async def update(data:UpdateUser , service = Depends(get_user_service), current_actor: dict= Depends(get_actor)):

    return await service.update_user(
        actor_id = current_actor["id"],
        username = data.username,
        full_name = data.full_name,
        image = data.image,
        email = data.email,
        remove_image = data.remove_image
    )





@router.delete("/{user_id}",
                dependencies=[Depends(RateLimiter(times=5, seconds=60, identifier=user_identifier))],
                status_code=204)
async def delete_user(user_id = UUID, service = Depends(get_user_service), current_actor = Depends(get_actor)):
    return await service.delete_user(
        user_id = user_id,
        actor_id = current_actor["id"]
    )