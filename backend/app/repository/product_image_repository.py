from app.models.product_image_model import ProductImage
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from sqlalchemy import select , func




class ProductImageRepository:
    def __init__(self, db:AsyncSession):
        self.db = db


    async def create(self, **kwargs):
        image = ProductImage(**kwargs)

        self.db.add(image)
        return image
    

    async def get_by_id(self, image_id:UUID):
        result = await self.db.execute(select(ProductImage).where(ProductImage.id == image_id))

        return result.scalar_one_or_none()
    

    async def get_all_by_product_id(self, product_id: UUID, order_by_display_order: bool = True):
        stmt = select(ProductImage).where(ProductImage.product_id == product_id)
        if order_by_display_order:
            stmt = stmt.order_by(ProductImage.display_order)
        result = await self.db.execute(stmt)
        return result.scalars().all()
    

    async def get_max_display_order(self, product_id: UUID) -> int | None:
        stmt = select(func.max(ProductImage.display_order)).where(ProductImage.product_id == product_id)
        result = await self.db.execute(stmt)
        return result.scalar()
    

    async def get_primary_image(self, product_id: UUID):
        stmt = select(ProductImage).where(
            ProductImage.product_id == product_id,
            ProductImage.is_primary == True
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    

    async def get_images_by_order(self, product_id: UUID, order: int):
        stmt = select(ProductImage).where(
            ProductImage.product_id == product_id,
            ProductImage.display_order == order
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    

    async def get_images_with_order_greater_than(self, product_id: UUID, order: int):
        stmt = select(ProductImage).where(
            ProductImage.product_id == product_id,
            ProductImage.display_order > order
        ).order_by(ProductImage.display_order)
        result = await self.db.execute(stmt)
        return result.scalars().all()
    

    async def get_images_with_order_less_than(self, product_id: UUID, order: int):
        stmt = select(ProductImage).where(
            ProductImage.product_id == product_id,
            ProductImage.display_order < order
        ).order_by(ProductImage.display_order)
        result = await self.db.execute(stmt)
        return result.scalars().all()
    

    async def get_images_with_order_between(self, product_id: UUID, start_order: int, end_order: int):
        stmt = select(ProductImage).where(
            ProductImage.product_id == product_id,
            ProductImage.display_order >= start_order,
            ProductImage.display_order < end_order
        ).order_by(ProductImage.display_order)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    

    async def delete(self, image:ProductImage):
        await self.db.delete(image)
        