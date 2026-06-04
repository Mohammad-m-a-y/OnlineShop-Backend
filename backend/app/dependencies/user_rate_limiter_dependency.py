from fastapi import Depends, Request
from app.dependencies.current_actor_dependency import get_actor


async def user_identifier(request: Request, user=Depends(get_actor)):
    if user and "id" in user:
        return str(user["id"])
 
    return request.client.host