from app.dependencies.role_dependency import require_role
from uuid import UUID
from fastapi import APIRouter, Depends
from app.dependencies.order_dependency import get_order_service
from app.schemas.order_schemas import OrderResponse, CreateOrder, GetOrdersResponse, GetOrdersRequest
from fastapi_limiter.depends import RateLimiter
from app.dependencies.user_rate_limiter_dependency import user_identifier



router = APIRouter(prefix="/orders" , tags=["Orders"])





@router.post("/",
             response_model=OrderResponse, 
             dependencies=[Depends(RateLimiter(times=15, seconds=60, identifier=user_identifier))], 
             status_code=201)
async def create_order(
    data:CreateOrder,
    current_user =Depends(require_role(["user","admin","owner"])),
    service = Depends(get_order_service)
):
    return await service.create_order(
        user_id=current_user.id,
        cart_id=data.cart_id,
        address_id=data.address_id,
        shipping_method=data.shipping_method,
        tracking_code=data.tracking_code,
        notes=data.notes
    )






@router.get("/", 
            response_model=GetOrdersResponse,
            dependencies=[Depends(RateLimiter(times=100, seconds=60, identifier=user_identifier))], 
            status_code=200)
async def get_orders(
    data:GetOrdersRequest,
    current_user =Depends(require_role(["user","admin","owner"])),
    service = Depends(get_order_service)
):
    return await service.get_orders(
        actor=current_user.id,
        page=data.page,
        page_size=data.page_size,
        user_id=data.user_id,
        status=data.status,
        start_date=data.start_date,
        end_date=data.end_date,
    )





@router.delete("/{order_id}", 
               dependencies=[Depends(RateLimiter(times=10, seconds=60, identifier=user_identifier))], 
               status_code=204)
async def delete_order(
    order_id:UUID,
    current_user =Depends(require_role(["user","admin","owner"])),
    service = Depends(get_order_service)
):
    return await service.delete_order(
        actor_id=current_user.id,
        order_id=order_id
    )