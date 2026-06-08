from app.dependencies.payment_dependency import get_payment_service
from fastapi import APIRouter, Depends, Request
from fastapi_limiter.depends import RateLimiter
from app.schemas.payment_schemas import InitiatePaymentResponse, InitiatePaymentRequest
from app.dependencies.role_dependency import require_role
from fastapi.responses import RedirectResponse




router = APIRouter(prefix="/payments", tags=["Payments"])





@router.post("/initiate",
            dependencies=[Depends(RateLimiter(times=3, seconds=60))],
            response_model= InitiatePaymentResponse,
            status_code= 200
        )

async def initiate_payment(
    data: InitiatePaymentRequest,
    service = Depends(get_payment_service),
    current_user =Depends(require_role(["user","admin","owner"])),
):
    return await service.initiate_payment(
        order_id= data.order_id
    )





@router.get("/callback")
async def payment_callback(
    request: Request,
    service = Depends(get_payment_service)
):
    query_params = dict(request.query_params)
    success, message = await service.process_callback(query_params=query_params)
    
    if success:
 
        return RedirectResponse(url="https://yourfrontend.com/payment/success")
    else:
 
        return RedirectResponse(url="https://yourfrontend.com/payment/failed")
    
