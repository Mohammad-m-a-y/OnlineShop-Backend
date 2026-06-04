from fastapi import APIRouter, Depends, Query
from app.dependencies.role_dependency import require_role
from app.schemas.user_schemas import UsersResponse
from app.dependencies.current_actor_dependency import get_actor
from app.dependencies.user_dependency import get_user_service





router = APIRouter(prefix="/admin", tags=["Admin"])




