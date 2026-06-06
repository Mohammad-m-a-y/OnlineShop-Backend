from app.models.product_variant_model import ProductVariant
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select 
from uuid import UUID
from sqlalchemy.orm import selectinload





class ProductVariantRepository:
    def __init__(self, db:AsyncSession):
        self.db = db


    async def create(self,**kwargs):
        variant = ProductVariant(**kwargs)
        self.db.add(variant)

        return variant
    

    async def update(self, variant:ProductVariant, **kwargs):
        for key, value in kwargs.items():
            setattr(variant, key, value)
        await self.db.flush()
        return variant 
    

    async def get_by_id(self, variant_id:UUID):
        stmt = select(ProductVariant).options(selectinload(ProductVariant.attributes)).where(ProductVariant.id == variant_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_by_sku(self, sku:str):
        result = await self.db.execute(select(ProductVariant).where(ProductVariant.sku == sku ))
        return result.scalar_one_or_none()
    
    async def get_by_product_id(self,product_id:UUID):
        stmt = select(ProductVariant).options(selectinload(ProductVariant.attributes)).where(ProductVariant.product_id == product_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    

    async def delete(self,variant:ProductVariant):
        await self.db.delete(variant) 