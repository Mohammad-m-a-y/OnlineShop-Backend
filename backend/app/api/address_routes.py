from app.dependencies.address_dependency import get_address_service
from app.dependencies.role_dependency import require_role
from uuid import UUID
from fastapi import APIRouter, Depends
from app.schemas.address_schemas import AddressResponse, CreateAddress, UpdateAddress
from fastapi_limiter.depends import RateLimiter
from app.dependencies.user_rate_limiter_dependency import user_identifier





router = APIRouter(prefix="/addresses" , tags=["Addresses"])





@router.post("/", 
             response_model=AddressResponse, 
             dependencies=[Depends(RateLimiter(times=10, seconds=60, identifier=user_identifier))], 
             status_code= 201
             )
async def create_address(
    data:CreateAddress,
    service= Depends(get_address_service),
    current_user= Depends(require_role(["admin", "owner","user"])) 
    ):

    return await service.create_address(
        user_id=current_user.id ,
        province=data.province ,
        city=data.city ,
        full_address=data.full_address ,
        postal_code=data.postal_code ,
        receiver_name=data.receiver_name ,
        receiver_mobile=data.receiver_mobile ,
    )




@router.put("/{address_id}", 
            response_model=AddressResponse, 
            dependencies=[Depends(RateLimiter(times=10, seconds=60, identifier=user_identifier))], 
            status_code=200
            )
async def update_address(
    address_id:UUID,
    data:UpdateAddress,
    service= Depends(get_address_service),
    current_user= Depends(require_role(["admin", "owner","user"]))
    ):
    return await service.update_address(
        address_id=address_id,
        actor_id=current_user.id,
        province=data.province,
        city=data.city,
        full_address=data.full_address,
        postal_code=data.postal_code,
        receiver_name=data.receiver_name,
        receiver_mobile=data.receiver_mobile,
    )



@router.get("/{address_id}", 
            response_model=AddressResponse, 
            dependencies=[Depends(RateLimiter(times=100, seconds=60, identifier=user_identifier))], 
            status_code=200
            )
async def get_address(
    address_id: UUID,
    service= Depends(get_address_service),
    current_user= Depends(require_role(["admin", "owner","user"]))
):
    return await service.get_address_by_id(
        address_id=address_id
    )





@router.delete("/{address_id}", 
               dependencies=[Depends(RateLimiter(times=10, seconds=60, identifier=user_identifier))], 
               status_code=204)
async def delete_address(
    address_id: UUID, 
    service= Depends(get_address_service),
    current_user= Depends(require_role(["admin", "owner","user"]))
):
    
    return await service.delete_address(
        address_id= address_id,
        actor_id= current_user.id
    )