from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.address_model import Address
from uuid import UUID



class AddressRepository:

    def __init__(self, db: AsyncSession):  
        self.db = db

    async def create(self, **kwargs):  
        address = Address(**kwargs)
        self.db.add(address) 
        # await self.db.flush()
        return address

    async def get_by_id(self, address_id: UUID):  
 
        stmt = select(Address).filter(Address.id == address_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()  

    async def get_by_user_id(self, user_id: UUID): 
        stmt = select(Address).filter(Address.user_id == user_id)
        result = await self.db.execute(stmt)

        return result.scalars().all()


    async def update(self, address: Address, **kwargs): 
        for key, value in kwargs.items():
            setattr(address, key, value)
        await self.db.flush()
        return address 

    async def delete(self, address: Address) -> None:
        await self.db.delete(address) 

        