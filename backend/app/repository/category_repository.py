from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category_model import Category
from app.models.associations import product_categories
from sqlalchemy import func, select 
from uuid import UUID
from sqlalchemy.orm import selectinload 




class CategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, **kwargs) -> Category:
        category = Category(**kwargs)
        self.db.add(category)
        await self.db.flush()
        return category
    


    async def update(self, category: Category, **kwargs) -> Category:
        for key, value in kwargs.items():
            setattr(category, key, value)
        await self.db.flush() 
        return category


    async def get_by_id(self, category_id: UUID) -> Category | None:
        result = await self.db.execute(select(Category).where(Category.id == category_id))
        return result.scalar_one_or_none()

    async def get_by_ids(self, category_ids: list[UUID]):
        stmt = select(Category).filter(Category.id.in_(category_ids))
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_by_slug(self, slug: str) -> Category | None:
        result = await self.db.execute(select(Category).where(Category.slug == slug))
        return result.scalar_one_or_none()

    async def get_all(self):

        products_count = func.count(product_categories.c.product_id).label("products_count")

        stmt = (
        select(Category, products_count)
        .outerjoin(product_categories, Category.id == product_categories.c.category_id)
        .options(selectinload(Category.children))
        .where(Category.parent_id == None) 
        .group_by(Category.id)
        .order_by(Category.name.asc())
        )      

        result = await self.db.execute(stmt)
        return result.all()


    async def update_category_image_path(self, category_id: UUID, image_path: str | None) -> Category | None:
        category = await self.get_by_id(category_id)
        if category:
            category.image_url = image_path
            await self.db.flush()
        return category
    

    async def status(self,category: Category):
        new_status = not category.is_active
        category.is_active = new_status
        return category
        
    

    async def delete(self, category: Category):
        await self.db.delete(category)
