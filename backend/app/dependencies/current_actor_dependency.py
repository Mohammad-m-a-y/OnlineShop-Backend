from fastapi import Depends, Request, HTTPException, status
from app.service.user_service import UserService
from app.dependencies.user_dependency import get_user_service
from fastapi.security import OAuth2PasswordBearer
from app.core.jwt import decode_token


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False
)



def get_access_token_from_cookie(
    request: Request,
) -> str | None:

    return request.cookies.get(
        "access_token"
    )


async def get_actor(
    request: Request,
    service: UserService = Depends( get_user_service )
):
    """
    احراز هویت اختیاری: برای روت‌هایی که هم برای مهمان و هم کاربر لاگین‌کرده
    کار می‌کنند (مثل مشاهده محصولات). اگر توکن نباشد یا نامعتبر باشد،
    به جای خطا، actor از نوع guest برمی‌گرداند.
    """

    client_ip = request.client.host

    token = request.cookies.get( "access_token" )

    if not token:
        return { "type": "guest", "ip": client_ip, "user": None, }

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        user = await service.get_user_by_id(user_id=user_id)

        return {"type": "user", "id": user.id, "user": user, "ip": client_ip}
    except Exception:
        return { "type": "guest", "ip": client_ip, "user": None, }




async def get_required_actor(
    request: Request,
    service: UserService = Depends( get_user_service )
):
    """
    احراز هویت اجباری: برای روت‌هایی که حتما باید کاربر لاگین‌کرده باشد
    (مثل /users/me). اگر توکن نباشد، منقضی شده باشد یا نامعتبر باشد،
    خطای 401 می‌دهد تا فرانت بتواند رفرش توکن را انجام دهد یا کاربر
    را به صفحه ورود هدایت کند.
    """

    token = request.cookies.get("access_token")

    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        user = await service.get_user_by_id(user_id=user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    client_ip = request.client.host
    return {"type": "user", "id": user.id, "user": user, "ip": client_ip}




