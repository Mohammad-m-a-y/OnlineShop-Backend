from app.core.images import save_image , delete_file
from uuid import UUID
from app.exceptions.custom import (BadRequestError, NotFoundError,ForbiddenError,InternalServerError)
from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.slider_repository import SliderRepository
from app.service.base_service import BaseService
from fastapi import UploadFile
from app.repository.user_repository import UserRepository






class SliderService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = SliderRepository(db)
        self.user_repo = UserRepository(db)



    async def create_slider(
        self,
        actor_id:UUID,
        image: UploadFile,
        title: str ,
        display_order: int | None,
        link_url: str | None = None,
        button_text: str | None = None,
        description: str | None = None, 

    ):
        
        if not actor_id and not image  and display_order is None and not title:
            raise BadRequestError("MISSING_REQUIRED_FIELDS") 
        

        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        


        sliders = await self.repo.get_sliders()
        
        if display_order:

            if display_order >= len(sliders):
                display_order = len(sliders)

            else:
        
                for s in sliders:
                    if s.display_order >= display_order:
                        s.display_order += 1
                        self.db.add(s)
               
                await self.db.flush()
        else:
            display_order = len(sliders)
      

        try:
            slider = await self.repo.create(
                title=title,
                link_url=link_url,
                button_text=button_text,
                description=description
                )        
        except Exception :
            raise IndentationError("FAILED_TO_CREATE_SLIDER")
        
        image_url = await save_image(upload_file=image, destination_type="slider", destination_id=slider.id)

        if not image_url:
            raise InternalServerError("FAILED_TO_UPLOAD_SLIDER_IMAGE")
        
        slider.image_url= str(image_url)

        await self.db.commit()
        await self.db.refresh(slider)
        return slider
    



    async def update_slider(
            self,
            actor_id: UUID,
            slider_id:UUID,
            title: str | None,
            description: str | None,
            image: UploadFile | None,
            link_url: str | None,
            button_text: str | None,
            display_order: int | None,
    ):
        if not actor_id or not slider_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        
        slider = await self.repo.get_by_id(slider_id)
        if not slider:
            raise NotFoundError("SLIDER_NOT_FOUND")
        

        update_data = {}

        update_data['description'] = description
        update_data['button_text'] = button_text
        update_data['link_url'] = link_url
        
        
        if title:
            update_data["update_data"] = update_data


        if display_order:
            sliders = await self.repo.get_sliders()

            if display_order >= len(sliders):
                display_order = len(sliders)

            else:
                for s in sliders:
                    if s.display_order >= display_order:
                        s.display_order += 1
                        self.db.add(s)
     
                await self.db.flush()
            
            update_data["display_order"] = display_order


        if image:
            delete_file(slider.image_url)

            new_image_url= await save_image(upload_file=image, destination_type="slider", destination_id=slider.id)

            if not new_image_url:
                raise InternalServerError("FAILED_TO_UPLOAD_SLIDER_IMAGE")
            
            update_data["image_url"] = new_image_url


        try:
            updated = await self.repo.update(slider=slider, **update_data)
            await self.db.commit()
            await self.db.refresh(updated)
            return updated
        
        except Exception:
            raise IndentationError("FAILED_TO_UPDATE_SLIDER")
        

    async def get_sliders(self):
        sliders = await self.repo.get_sliders()

        return {"items": sliders}
    

    async def delete_slider(self, actor_id:UUID, slider_id:UUID):
        if not actor_id or not slider_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        
        slider = await self.repo.get_by_id(slider_id)
        if not slider:
            raise NotFoundError("SLIDER_NOT_FOUND")
        

        slider = await self.repo.get_by_id(slider_id)
        if not slider:
            raise NotFoundError("SLIDER_NOT_FOUND")
        
        await self.repo.delete(slider=slider)
        








                    



        


    
        


