from app.repository.review_repository import ReviewRepository
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.base_service import BaseService
from app.exceptions.custom import (BadRequestError, NotFoundError,ForbiddenError,InternalServerError)
from uuid import UUID
from app.repository.user_repository import UserRepository
from app.repository.product_repository import ProductRepository
import math




class ReviewService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = ReviewRepository(db)
        self.user_repo = UserRepository(db)
        self.product_repo = ProductRepository(db)

    
    async def create(self, actor_id:UUID,product_id:UUID,rating:int,comment:str,title:str = None,parent_id:UUID = None):
        if not all([actor_id,product_id,rating,comment]):
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        if rating > 5 or rating < 1:
            raise BadRequestError("RATING_MUST_BE_BETWEEN_1_AND_5")
        
        product = await self.product_repo.get_by_id(product_id=product_id)
        if not product:
            raise NotFoundError("PRODUCT_NOT_FOUND")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)
        is_approved = False

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if actor.is_admin and not actor.is_owner:
            is_approved = True


        if parent_id:
            parent = await self.repo.get_by_id(review_id=parent_id)

            if not parent:
                raise NotFoundError("PARENT_REVIEW_NOT_FOUND")
            

        try:
            review = await self.repo.create(
                user_id = actor_id,
                product_id = product_id,
                parent_id = parent_id,
                rating = rating,
                title = title,
                comment = comment,
                is_approved = is_approved
            )

            await self.db.commit()
            await self.db.refresh(review)

            return await self.repo.get_by_id(review_id=review.id)
        
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_CREATE_REVIEW: {e}")
        


    async def update_review(self,actor_id:UUID, review_id:UUID,rating:int = None,comment:str=None,title:str = None):
        if not actor_id or not review_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        if not any([rating,title,comment]):
            raise BadRequestError("AT_LEAST_ONE_OPTIONAL_FIELD_IS_REQUIRED")
        
        review = await self.repo.get_by_id(review_id=review_id)
        if not review:
            raise NotFoundError("REVIEW_NOT_FOUND")
        
        if review.user_id != actor_id:
            raise ForbiddenError('ACCESS_DENIED')
        
        update_data = {}

        if rating and review.rating != rating:
            if rating > 5 or rating < 1:
                raise BadRequestError("RATING_MUST_BE_BETWEEN_1_AND_5")
            
            update_data['rating'] = rating


        if comment:
            update_data['comment'] = comment

        if title:
            update_data['title'] = title

        try:
            updated= await self.repo.update(review=review, **update_data)

            await self.db.commit()
            await self.db.refresh(updated)

            return updated
        
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_UPDATE_REVIEW: {e}")
        

    async def get_product_reviews(
            self,
            product_id:UUID, 
            page:int, 
            page_size:int,
            is_approved: bool | None = None,
            actor_data: dict = None
            ):
        
        """
        admin and owner can see unapproved reviews.
        users can see their own unapproved reviews.
        """

        if not product_id or not page or not page_size:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = actor_data.get("user")
        if not actor:
            is_approved = True
        elif actor.is_admin or actor.is_owner:
       
            pass
        else:
            # if users are not admin or owner
            # approved + their own unapproved

            is_approved = True
            current_user_id = actor.id
        
        offset = (page - 1) * page_size

        reviews , total = await self.repo.get_reviews(
            product_id=product_id, 
            limit=page_size, 
            offset=offset, 
            is_approved=is_approved,
            current_user_id= current_user_id
            )

        total_pages = math.ceil(total / page_size) if total else 0

        return{
            "items":reviews,
            "page":page,
            "page_size": page_size,
            "total_pages": total_pages,
            "total_count": total
        }
        


    
    async def approve_review_toggle(self, actor_id:UUID, review_id:UUID):
        if not actor_id or not review_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)
        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError('ACCESS_DENIED')
        
        review = await self.repo.get_by_id(review_id=review_id)
        if not review:
            raise NotFoundError("REVIEW_NOT_FOUND")
        
        try:
            toggled = await self.repo.approve_toggle(review=review)

            await self.db.commit()
            await self.db.refresh(toggled)

            return toggled
        
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_TOGGLE_REVIEW_APPROVE_STATUS:{e})")
        

    async def delete_review(self, actor_id:UUID,review_id:UUID):
        if not actor_id or not review_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        review = await self.repo.get_by_id(review_id=review_id)
        if not review:
            raise NotFoundError("REVIEW_NOT_FOUND")
        
        
        if review.user_id != actor_id:
            raise ForbiddenError('ACCESS_DENIED')
        
        try:
            deleted_id = review_id

            await self.repo.delete(review=review)
            await self.db.commit()

            return deleted_id
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_DELETE_REVIEW:{e})")
        





        

        
