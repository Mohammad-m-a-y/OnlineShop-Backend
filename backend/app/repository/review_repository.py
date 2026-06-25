from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select  , func, and_ , or_
from app.models.review_model import Review
from sqlalchemy.orm import selectinload, joinedload
from datetime import datetime



class ReviewRepository:
    def __init__(self, db:AsyncSession):
        self.db = db


    async def create(self , **kwargs):
        review = Review(**kwargs)
        self.db.add(review)

        return review
    

    async def update(self,review:Review,**kwargs):
        for key, value in kwargs.items():
            setattr(review, key, value)
        await self.db.flush()
        return review 
    

    async def get_by_id(self, review_id:UUID):
        stmt = (
        select(Review)
        .where(Review.id == review_id)
        .options(
            joinedload(Review.replies),
            joinedload(Review.parent).joinedload(Review.replies),  # replies روی parent هم لود میشه
        )
        )
        result = await self.db.execute(stmt)
        return result.unique().scalar_one_or_none()
    

    async def approve_toggle(self,review:Review):
        status = review.is_approved
        review.is_approved = not status
        await self.db.flush()
        return review
    


    async def get_reviews(
            self, 
            limit: int, 
            offset: int, 
            product_id: UUID | None = None, 
            is_approved: bool | None = None,
            current_user_id: UUID | None = None,
            start_date: datetime | None = None, 
            end_date:datetime | None = None    
            ):

        base_filters = []

        if is_approved is not None:
            if current_user_id:
                base_filters.append(
                    or_(
                    Review.is_approved == is_approved,
                    Review.user_id == current_user_id
                    )
                )
            else:
                base_filters.append(Review.is_approved == is_approved)


        if start_date:
                base_filters.append(Review.created_at >= start_date)

        if end_date:
                base_filters.append(Review.created_at <= end_date)

        if product_id:
                base_filters.append(Review.product_id == product_id)

 
        count_query = (
            select(func.count(Review.id))
            .where(and_(*base_filters))
        )
        total_count = await self.db.execute(count_query)
        total = total_count.scalar()

 
        stmt = (
            select(Review)
            .where(and_(*base_filters))
            .options(selectinload(Review.replies).selectinload(Review.replies), joinedload(Review.user))  
            .order_by(Review.created_at.desc()) 
            .limit(limit)
            .offset(offset)
        )
    
        result = await self.db.execute(stmt)
        reviews = result.scalars().all()

        return reviews , total
    

    
    async def delete(self, review: Review) -> None:
        await self.db.delete(review) 

