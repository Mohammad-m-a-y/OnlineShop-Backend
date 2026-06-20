from app.dependencies.role_dependency import require_role
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from app.dependencies.order_dependency import get_order_service
from app.schemas.order_schemas import OrderResponse, CreateOrder, GetOrdersResponse, UpdateOrder
from fastapi_limiter.depends import RateLimiter
from app.core.status_enum import OrderStatus
from datetime import datetime
from app.dependencies.current_actor_dependency import  get_required_actor


router = APIRouter(prefix="/orders" , tags=["Orders"])





@router.post("/",
             response_model=OrderResponse, 
             dependencies=[Depends(RateLimiter(times=15, seconds=60))], 
             status_code=201)
async def create_order(
    data:CreateOrder,
    current_user =Depends(get_required_actor),
    service = Depends(get_order_service)
):
    return await service.create_order(
        user_id=current_user["id"],
        cart_id=data.cart_id,
        address_id=data.address_id,
        shipping_method=data.shipping_method,
        tracking_code=data.tracking_code,
        notes=data.notes
    )






@router.get("/", 
            response_model=GetOrdersResponse,
            dependencies=[Depends(RateLimiter(times=100, seconds=60))], 
            status_code=200
            )
async def get_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    user_id: UUID = Query(None),
    status: OrderStatus = Query(None),
    start_date:datetime = Query(None),
    end_date:datetime = Query(None),
    current_user =Depends(get_required_actor),
    service = Depends(get_order_service)
):
    return await service.get_orders(
        actor_id=current_user["id"],
        page=page,
        page_size=page_size,
        user_id=user_id,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )






@router.get('/{order_id}',
            dependencies=[Depends(RateLimiter(times=100, seconds=60))], 
            response_model= OrderResponse,
            status_code=200
            )
async def get_order_by_id(
    order_id:UUID,
    current_user =Depends(get_required_actor),
    service = Depends(get_order_service)
):
    return await service.get_order_by_id(
        actor_id= current_user["id"],
        order_id= order_id
    )



@router.patch('/{order_id}',
            dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
            response_model= OrderResponse,
            status_code=200
            )
async def update_order(
    order_id:UUID,
    data: UpdateOrder,
    current_user =Depends(require_role(["admin","owner"])),
    service = Depends(get_order_service)
):
    return await service.update_order(
        order_id= order_id,
        actor_id = current_user.id,
        status = data.status,
        tracking_code = data.tracking_code,
        shipping_method = data.shipping_method
    )
    




@router.delete("/{order_id}", 
               dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
               status_code=204)
async def delete_order(
    order_id:UUID,
    current_user =Depends(get_required_actor),
    service = Depends(get_order_service)
):
    return await service.delete_order(
        actor_id=current_user["id"],
        order_id=order_id
    )