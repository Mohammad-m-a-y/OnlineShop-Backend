from app.models.attribute_model import Attribute
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select 
from uuid import UUID






class AttributeRepository:
    def __init__(self, db:AsyncSession):
        self.db = db


    async def create(self,**kwargs):
        attribute = Attribute(**kwargs)
        self.db.add(attribute)

        return attribute
    

    async def update(self, attribute:Attribute, **kwargs):
        for key, value in kwargs.items():
            setattr(attribute, key, value)
        await self.db.flush()
        return attribute 
    

    async def get_by_id(self, attribute_id:UUID):
        stmt = select(Attribute).where(Attribute.id == attribute_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    

    async def delete(self,attribute:Attribute):
        self.db.delete(attribute) 