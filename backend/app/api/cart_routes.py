from app.dependencies.role_dependency import require_role
from app.dependencies.current_actor_dependency import get_actor
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from app.dependencies.cart_dependency import get_cart_service
from app.schemas.cart_schemas import  CartResponse, GetCartsResponse,GetCartsRequest,CreateCartItem,CartItemResponse
from app.dependencies.cart_item_dependency import get_cart_item_service
from fastapi_limiter.depends import RateLimiter





router = APIRouter(prefix="/carts" , tags=["Carts"])




@router.get("/", 
            response_model=GetCartsResponse, 
            dependencies=[Depends(RateLimiter(times=100, seconds=60))], 
            status_code=200)
async def get_carts(
    data:GetCartsRequest,
    service= Depends(get_cart_service),
    current_user = Depends(require_role(["admin","owner"]))
):
    return await service.get_paginated_carts(
        actor_id= current_user.id,
        page= data.page,
        page_size=data.page_size, 
        status= data.status,
        user_id= data.user_id,
        session_id= data.session_id,
        order_by= data.order_byd,
        descending= data.descending
    )




@router.post("/", 
             response_model=CartResponse, 
             dependencies=[Depends(RateLimiter(times=15, seconds=60))], 
             status_code=201
             )
async def create_cart(
    service= Depends(get_cart_service),
    current_user= Depends(get_actor)
):
    return await service.create_cart(
        user_id= current_user["id"],
        session_id= current_user["ip"]
    )




@router.patch("/{cart_id}", 
              response_model=CartResponse, 
              dependencies=[Depends(RateLimiter(times=15, seconds=60))], 
              status_code=200
              )
async def abandone(
    cart_id:UUID,
    service= Depends(get_cart_service),
    current_user= Depends(get_actor)
):
    
    return await service.abandone_cart(
        cart_id=cart_id,
        user_id=current_user["id"],
        session_id= current_user["ip"]
    )




#============= cart items ==============


@router.post("/{cart_id}/cart-item", 
            response_model=CartItemResponse,
            dependencies=[Depends(RateLimiter(times=20, seconds=60))], 
            status_code=201
             )
async def create_cart_item(
    cart_id:UUID,
    data:CreateCartItem,
    service= Depends(get_cart_item_service),
    current_user= Depends(get_actor)
):
    return await service.create_item(
        user_id=current_user["id"],
        session_id=current_user["ip"],
        cart_id=cart_id,
        product_id=data.product_id,
        variant_id=data.variant_id,
        quantity=data.quantity,
    )



@router.patch("/{cart_id}/cart-item/{item_id}", 
              response_model=CartItemResponse, 
              dependencies=[Depends(RateLimiter(times=20, seconds=60))], 
              status_code=200)
async def update_item_quantity(
    cart_id:UUID,
    item_id:UUID,
    quantity:int = Query(ge=0),
    service= Depends(get_cart_item_service),
    current_user= Depends(get_actor)
):
    return await service.update_quantity(
        cart_id=cart_id,
        item_id=item_id,
        quantity=quantity,
        user_id=current_user["id"],
        session_id=current_user["ip"],
    )
    