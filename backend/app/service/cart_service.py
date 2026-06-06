from uuid import UUID
from app.service.base_service import BaseService
from sqlalchemy.ext.asyncio import AsyncSession
from app.exceptions.custom import (BadRequestError, NotFoundError,InternalServerError,ForbiddenError)
from app.repository.cart_repository import CartRepository
from app.repository.user_repository import UserRepository
from typing import Optional
import math
from app.core.status_enum import CartStatus



class CartService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = CartRepository(db)
        self.user_repo = UserRepository(db)

    
    async def create_cart(self,user_id:UUID =None, session_id:str = None):

        if not user_id and not session_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS") 
        
        try:

            if user_id:
                active_cart_for_user = await self.repo.get_by_user_id(user_id=user_id)
                if active_cart_for_user:
                    return active_cart_for_user

                if session_id:
                    active_cart_for_session = await self.repo.get_by_session_id(session_id=session_id)
                    if active_cart_for_session:
                        active_cart_for_session.user_id = user_id
                        active_cart_for_session.session_id = None

                        cart = await self.repo.update(
                            active_cart_for_session,
                            user_id=user_id,
                            session_id=None
                        )
                        await self.db.commit()
                        await self.db.refresh(cart)
                        return cart


                cart = await self.repo.create(user_id=user_id)
                await self.db.commit()
                await self.db.refresh(cart)
                return cart


            if session_id:
                active_cart_for_session = await self.repo.get_by_session_id(session_id=session_id)
                if active_cart_for_session:
                    return active_cart_for_session

                cart = await self.repo.create(session_id=session_id)
                await self.db.commit()
                await self.db.refresh(cart)
                return cart

        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_CREATE_CART: {e}")
            raise InternalServerError("FAILED_TO_CREATE_CART")
        


    
    async def get_paginated_carts(
            self, 
            actor_id:UUID,
            page: int = 1, 
            page_size: int = 10,
            status: Optional[str] = None,
            user_id: Optional[UUID] = None,
            session_id: Optional[str] = None,
            order_by: Optional[str] = None,  
            descending: bool = False,
            ):
        
        if page < 1 or page_size < 1:
            raise BadRequestError("PAGE_AND_PAGE_SIZE_MUST_BE_GREATER_THAN_0")
        
        if not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS") 
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)
        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin:
            raise ForbiddenError("ACCESS_DENIED")
        
        offset = (page - 1) * page_size

        carts, total_count = await self.repo.get_paginated(
            limit=page_size,
            offset=offset,
            status=status,
            user_id=user_id,
            session_id=session_id,
            order_by=order_by,
            descending=descending
        )

        total_pages = math.ceil(total_count / page_size) if total_count else 0

        return {
            "items":carts,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "total_count": total_count
        }



    async def get_carts_for_user(self, user_id:UUID):
        if not user_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")

        carts = await self.repo.get_all_carts_for_user(user_id=user_id)
        return carts
        

            

    
    async def abandone_cart(self, cart_id:UUID, user_id:UUID= None,session_id:str = None):
        if not cart_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS") 
        
        if not user_id and not session_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS") 
        
        cart = await self.repo.get_active_cart_for_user_or_session(cart_id=cart_id,user_id=user_id,session_id=session_id)

        if not cart:
            raise NotFoundError("NO_ACTIVE_CART_FOUND")

        
        try:

            abandoned= await self.repo.change_status(cart = cart , status=CartStatus.ABANDONED)
            await self.db.commit()
            await self.db.refresh(abandoned)
            return abandoned
        
        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_ABANDONE_CART: {e}")
            raise InternalServerError("FAILED_TO_ABANDONE_CART")
        


        
        




        



        

        



