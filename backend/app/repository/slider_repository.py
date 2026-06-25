from app.models.slider_model import Slider
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select 
from uuid import UUID






class SliderRepository:
    def __init__(self, db:AsyncSession):
        self.db = db


    async def create(self, **kwargs):
        slider = Slider(**kwargs)
        self.db.add(slider)
        await self.db.flush()
        return slider
    

    async def update(self,slider:Slider, **kwargs):
        for key, value in kwargs.items():
            setattr(slider, key, value)
 
        return slider 
    
    async def get_by_id(self, slider_id:UUID):
        stmt = select(Slider).where(Slider.id == slider_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()    


    async def get_sliders(self):
        stmt = select(Slider)
        result = await self.db.execute(stmt)

        return result.scalars().all()
    

    async def status(self, slider:Slider):
        status = not slider.is_active
        slider.is_active = status

        return slider 

    async def delete(self, slider:Slider):
        await self.db.delete(slider) 
        