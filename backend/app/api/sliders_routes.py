from uuid import UUID
from app.dependencies.role_dependency import require_role
from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.dependencies.slider_dependency import get_slider_service
from app.schemas.slider_schemas import SliderResponse , GetSlidersResponse
from fastapi_limiter.depends import RateLimiter
from typing import Optional




router = APIRouter(prefix="/sliders" , tags=["Sliders"])






@router.get('/',
            response_model=GetSlidersResponse,
            dependencies=[Depends(RateLimiter(times=100, seconds=60))],
            status_code=200
            )
async def get_sliders(
    service = Depends(get_slider_service)
):
    return await service.get_sliders()





@router.post('/',
            response_model=SliderResponse,
            dependencies=[Depends(RateLimiter(times=10, seconds=60))],
            status_code=201
            )
async def create_slider(
    image: UploadFile = File(...),
    title: str = Form(...),
    display_order: int = Form(...),
    link_url: Optional[str] = Form(None),
    button_text: Optional[str] = Form(None), 
    description: Optional[str] = Form(None),
    current_actor= Depends(require_role(["owner","admin"])),
    service = Depends(get_slider_service)
):
    return await service.create_slider(
        actor_id = current_actor.id,
        image = image,
        title = title,
        display_order = display_order,
        link_url = link_url,
        button_text = button_text,
        description = description
    )



@router.patch('/{slider_id}',
            response_model=SliderResponse,
            dependencies=[Depends(RateLimiter(times=10, seconds=60))],
            status_code=200
            )
async def update_slider(
    slider_id:UUID,
    image: UploadFile = File(None),
    title: str = Form(None),
    display_order: int = Form(None),
    link_url: Optional[str] = Form(None),
    button_text: Optional[str] = Form(None), 
    description: Optional[str] = Form(None),
    current_actor= Depends(require_role(["owner","admin"])),
    service = Depends(get_slider_service)
):
    return await service.update_slider(
        actor_id = current_actor.id,
        slider_id = slider_id,
        title = title,
        description = description,
        image = image,
        link_url = link_url,
        button_text = button_text,
        display_order = display_order
    )



@router.patch('/{slider_id}/status',
            response_model=SliderResponse,
            dependencies=[Depends(RateLimiter(times=10, seconds=60))],
            status_code=200
            )
async def toggle_status(
    slider_id:UUID,
    current_actor= Depends(require_role(["owner","admin"])),
    service = Depends(get_slider_service)
):
    return await service.toggle_status(
        actor_id= current_actor.id,
        slider_id=slider_id
    )



@router.delete('/{slider_id}',
            dependencies=[Depends(RateLimiter(times=4, seconds=60))],
            status_code=204
            )
async def delete_slider(
    slider_id:UUID,   
    current_actor= Depends(require_role(["owner","admin"])),
    service = Depends(get_slider_service)
):
    return await service.delete_slider(
        actor_id = current_actor.id,
        slider_id = slider_id
    )