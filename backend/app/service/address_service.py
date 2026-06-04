
from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.address_repository import AddressRepository
from app.repository.user_repository import UserRepository
from app.exceptions.custom import (BadRequestError, NotFoundError, ForbiddenError)
from app.service.base_service import BaseService
from uuid import UUID



class AddressService(BaseService):
    def __init__(self, db: AsyncSession):
        super().__init__(db)
        self.repo = AddressRepository(db)
        self.user_repo = UserRepository(db) 

    async def create_address(self, province: str, city: str, full_address: str, postal_code: str, receiver_name: str, receiver_mobile: str, user_id: UUID):  
        if not province or not city or not full_address or not postal_code or not receiver_mobile or not receiver_name or not user_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")

        try:
  
            address = await self.repo.create(
                province=province,
                city=city,
                full_address=full_address,
                postal_code=postal_code,
                receiver_name=receiver_name,
                user_id=user_id
            )

            await self.db.commit()
            await self.db.refresh(address) 

            return address
        except Exception as e:
            await self.db.rollback() 
            raise Exception(f"An error occurred during address creation: {e}") 

    async def get_address_by_id(self, address_id: UUID):
        if not address_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")


        address = await self.repo.get_by_id(address_id=address_id)

        if not address:
            raise NotFoundError("ADDRESS_NOT_FOUND")

        return address
    



    async def get_user_addresses(self,user_id:UUID):
        if not user_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        user = await self.user_repo.get_by_id(user_id=user_id)
        if not user:
            raise NotFoundError("USER_NOT_FOUND") 
        
        addresses = await self.repo.get_by_user_id(user_id=user_id)
        return {"items":addresses}






    async def update_address(self,
                           address_id: UUID,
                           actor_id:UUID,
                           province: str = None,
                           city: str = None,
                           full_address: str = None,
                           postal_code: str = None,
                           receiver_name: str = None,
                           receiver_mobile: str = None
                           ):

        if not address_id or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")


        if not any([province, city, full_address, postal_code, receiver_name, receiver_mobile]):
            raise BadRequestError("AT_LEAST_ONE_FIELD_IS_REQUIRED")

        
        address = await self.get_address_by_id(address_id=address_id)

        if address.user_id != actor_id:
            raise ForbiddenError("ACCESS_DENIED")

        update_data = {}
        if province:
            update_data['province'] = province
        if city:
            update_data['city'] = city
        if full_address:
            update_data['full_address'] = full_address
        if postal_code:
            update_data['postal_code'] = postal_code
        if receiver_name:
            update_data['receiver_name'] = receiver_name
        if receiver_mobile:
            update_data['receiver_mobile'] = receiver_mobile

        try:
 
            updated = await self.repo.update(address=address, **update_data)
            await self.db.commit() 
 
            await self.db.refresh(updated) 

            return updated
        except Exception as e:
            await self.db.rollback()  
            raise Exception(f"An error occurred during address update: {e}")


    async def delete_address(self, address_id: UUID, actor_id: UUID):  
 
        if not address_id or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")

 
        address = await self.get_address_by_id(address_id=address_id)

        if address.user_id != actor_id:
            raise ForbiddenError("ACCESS_DENIED")

        try:
 
            await self.repo.delete(address=address)
            await self.db.commit()  

        except Exception as e:
            await self.db.rollback()  
            raise Exception(f"An error occurred during address deletion: {e}")
