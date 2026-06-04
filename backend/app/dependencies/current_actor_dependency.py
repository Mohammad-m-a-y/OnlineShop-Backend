from fastapi import Depends, Request
from app.service.user_service import UserService
from app.dependencies.user_dependency import get_user_service
from fastapi.security import OAuth2PasswordBearer
from app.core.jwt import decode_token



oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False
)



async def get_actor(
    request: Request,
    token: str = Depends(oauth2_scheme),
    service: UserService = Depends(get_user_service)
):

    try:
        client_ip = request.client.host

        payload = decode_token(token)
        user_id = int(payload.get("sub"))
        user = await service.get_user_by_id(user_id=user_id) 
        return {"type": "user", "id": user.id, "user": user, "ip": client_ip}
        
    except Exception:

        client_ip = request.client.host
        return {"type": "guest", "ip": client_ip, "user": None}
    







