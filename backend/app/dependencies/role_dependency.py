from fastapi import Depends
from app.dependencies.current_actor_dependency import get_actor
from app.exceptions.custom import ForbiddenError, UnauthorizedError






def require_role(allowed_roles: list[str]):
    """
    Dependency که نقش کاربر را بررسی می‌کند.

    Args:
        allowed_roles: لیستی از نقش‌های مجاز (مثلا ['admin', 'owner'])
    """
    async def role_checker(actor_info: dict = Depends(get_actor)):
        if actor_info.get("type") == "guest":

            if "user" in allowed_roles or "admin" in allowed_roles or "owner" in allowed_roles:
                raise ForbiddenError("You are a guest, but an authenticated user is required for this action.")
          

        user = actor_info.get("user") 
        if not user:
            raise UnauthorizedError("Authenticated user object not found.")


        user_roles = []
        if user.is_admin:
            user_roles.append("admin")
        if user.is_owner:
            user_roles.append("owner")
        

        if not user.is_admin and not user.is_owner:
            user_roles.append("user") 


        if not any(role in allowed_roles for role in user_roles):
            raise ForbiddenError(f"You do not have the required role(s). Allowed: {', '.join(allowed_roles)}. Your roles: {', '.join(user_roles)}.")


        return user 

    return role_checker
