from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload
from app.models.product_model import Product
from uuid import UUID
from decimal import Decimal
from app.models.category_model import Category



class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, **kwargs):
        product = Product(**kwargs)
        self.db.add(product)
        await self.db.flush()
        return product

    async def update(self, product: Product, **kwargs):
        for key, value in kwargs.items():
            setattr(product, key, value)
        await self.db.flush()
        return product

    async def get_by_id(self, product_id: UUID):
        stmt = (
        select(Product)
        .where(Product.id == product_id)
        .options(
            joinedload(Product.categories),
            joinedload(Product.brand),
            joinedload(Product.images),
            joinedload(Product.variants),
        )
    )
        result = await self.db.execute(stmt)
        return result.unique().scalar_one_or_none()

    async def get_by_slug(self, slug: str):
        stmt = select(Product).where(Product.slug == slug)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    


    async def get_paginated(
            self,
            limit:int= 10,
            offset:int= 0,
            brand_id:UUID= None,
            min_price:Decimal= None,
            max_price:Decimal= None,
            category_ids: list[UUID]= None,     
            is_active : bool | None = None        
    ):
        
        filters = []
        if brand_id:
            filters.append(Product.brand_id == brand_id)
        if min_price is not None:
            filters.append(Product.price >= min_price)
        if max_price is not None:
            filters.append(Product.price <= max_price)
        if category_ids:
            filters.append(Product.categories.any(Category.id.in_(category_ids)))
        if is_active is not None:
            filters.append(Product.is_active == is_active)

        count_stmt = select(func.count(Product.id))
        if filters:
            count_stmt = count_stmt.where(and_(*filters))

        total_result = await self.db.execute(count_stmt)
        total_count = total_result.scalar() or 0


        stmt = (
            select(Product)
            .options(
                joinedload(Product.brand),
                joinedload(Product.images),
                joinedload(Product.categories)
            )
        )
        if filters:
            stmt = stmt.where(and_(*filters))

        stmt = stmt.order_by(Product.created_at.desc()).offset(offset).limit(limit)
        
        result = await self.db.execute(stmt)
        products = result.unique().scalars().all()
        
        return products, total_count
    


    async def status(self, product: Product):
        new_status = not product.is_active
        product.is_active = new_status
        return product


    async def delete(self, product: Product) -> None:
        await self.db.delete(product)
         