from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select  , func
from app.models.review_model import Review
from sqlalchemy.orm import selectinload, joinedload




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
    


    async def get_reviews(self, product_id: UUID, limit: int, offset: int):
 
        count_query = select(func.count(Review.id)).where(
            Review.product_id == product_id,
            Review.parent_id == None,
            Review.is_approved == True
        )
        total_count = await self.db.execute(count_query)
        total = total_count.scalar()

 
        stmt = (
            select(Review)
            .where(
                Review.product_id == product_id,
                Review.parent_id == None,
                Review.is_approved == True 
            )
            .options(selectinload(Review.replies).selectinload(Review.replies))  
            .order_by(Review.created_at.desc()) 
            .limit(limit)
            .offset(offset)
        )
    
        result = await self.db.execute(stmt)
        reviews = result.scalars().all()

        return reviews , total
    

    
    async def delete(self, review: Review) -> None:
        await self.db.delete(review) 

