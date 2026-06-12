from app.models.brand_model import Brand
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select  , func,  and_
from app.models.product_model import Product
from uuid import UUID




class BrandRepository:
    def __init__(self, db:AsyncSession):
        self.db = db


    async def create(self,**kwargs):
        brand = Brand(**kwargs)
        self.db.add(brand)
        await self.db.flush()
        return brand
    

    async def update(self, brand: Brand, **kwargs) -> Brand:
        for key, value in kwargs.items():
            setattr(brand, key, value)
        await self.db.flush()
        return brand
    

    async def get_by_id(self, brand_id:UUID) -> Brand | None:
        stmt = select(Brand).filter(Brand.id == brand_id)

        result= await self.db.execute(stmt)
        return result.scalar_one_or_none()
    

    async def get_by_ids(self, brand_ids: list[UUID]):
        stmt = select(Brand).filter(Brand.id.in_(brand_ids))

        result = await self.db.execute(stmt)
        return result.scalars().all()

    
    
    async def get_by_slug(self, slug: str) -> Brand | None:
        stmt = select(Brand).filter(Brand.slug == slug)
        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()
    

    async def get_all(self,is_active: bool | None) -> list[dict]:
    
        filters = []

        if is_active is not None:
            filters.append(Brand.is_active == is_active)
 
        product_count_subq = (
        select(
            Product.brand_id,
            func.count(Product.id).label("products_count")
        )
        .group_by(Product.brand_id)
        .subquery()
        )

        stmt = (
        select(Brand, product_count_subq.c.products_count)
        .outerjoin(product_count_subq, Brand.id == product_count_subq.c.brand_id)
        .order_by(Brand.name.asc())
    )
        
        if filters:
            stmt = stmt.where(and_(*filters))

        count_stmt = select(func.count(Brand.id))
        if filters:
            count_stmt = count_stmt.where(and_(*filters))

        total_result = await self.db.execute(count_stmt)
        total_count = total_result.scalar() or 0


        result = await self.db.execute(stmt)
        rows = result.all()


        return {
        "total_count": total_count,
        "items": [
            {
                "id": brand.id,
                "name": brand.name,
                "slug": brand.slug,
                "image_url": brand.image_url,
                "description": brand.description,
                "is_active": brand.is_active,
                "created_at": brand.created_at,
                "updated_at": brand.updated_at,
                "products_count": count or 0
            }
            for brand, count in rows
        ]
    }


    async def status(self,brand:Brand):
        new_status = not brand.is_active
        brand.is_active = new_status
        await self.db.flush()
        return brand
        
    

    async def delete(self, brand: Brand):
        await self.db.delete(brand)