from app.dependencies.payment_dependency import get_payment_service
from fastapi import APIRouter, Depends, Request
from fastapi_limiter.depends import RateLimiter
from app.schemas.payment_schemas import InitiatePaymentResponse, InitiatePaymentRequest
from fastapi.responses import RedirectResponse
from app.core.config import get_settings
from app.dependencies.current_actor_dependency import get_required_actor



router = APIRouter(prefix="/payments", tags=["Payments"])





@router.post("/initiate",
            dependencies=[Depends(RateLimiter(times=3, seconds=60))],
            response_model= InitiatePaymentResponse,
            status_code= 200
        )

async def initiate_payment(
    data: InitiatePaymentRequest,
    service = Depends(get_payment_service),
    current_user =Depends(get_required_actor),
):
    return await service.initiate_payment(
        order_id= data.order_id
    )





@router.get("/callback")
async def payment_callback(
    request: Request,
    service = Depends(get_payment_service),
    settings = Depends(get_settings)
):
    query_params = dict(request.query_params)
    success, message = await service.process_callback(query_params=query_params)
    
    if success:

        return RedirectResponse(url=settings.PAYMENT_SUCCESS_REDIRECT_URL)
    else:

        return RedirectResponse(url=settings.PAYMENT_FAILED_REDIRECT_URL)
    
