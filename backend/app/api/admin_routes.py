from fastapi import APIRouter, Depends
from app.dependencies.role_dependency import require_role
from fastapi_limiter.depends import RateLimiter
from fastapi_limiter.depends import RateLimiter
from app.schemas.admin_schemas import AdminDashboardStatus
from app.dependencies.admin_dependency import get_admin_service


router = APIRouter(prefix="/admin", tags=["Admin"])







@router.get('/dashboard/sttus',
            response_model=AdminDashboardStatus, 
            dependencies=[Depends(RateLimiter(times=100, seconds=60))], 
            status_code=200
            )
async def get_admin_dashboard_status(
    service= Depends(get_admin_service),
    current_user = Depends(require_role(["admin","owner"]))
):
    return await service.get_admin_dashboard_records(
        actor_id = current_user.id
    )