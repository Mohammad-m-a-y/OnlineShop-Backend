from app.service.base_service import BaseService
from uuid import UUID
from app.exceptions.custom import (BadRequestError, NotFoundError, ForbiddenError,InternalServerError)
from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.product_repository import ProductRepository
from app.repository.user_repository import UserRepository
from app.repository.category_repository import CategoryRepository
from app.repository.brand_repository import BrandRepository
from decimal import Decimal
from app.models.product_model import Product
import math




class ProductService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = ProductRepository(db)
        self.user_repo = UserRepository(db)
        self.cat_repo = CategoryRepository(db)
        self.brand_repo = BrandRepository(db)


    async def create_product(self,
                       actor_id:UUID,
                       name:str, 
                       slug:str, 
                       description:str,
                       base_price:Decimal, 
                       brand_id : UUID = None,
                       short_description:str= None
    ):
        
        if not name or not slug or not description or not base_price or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor.is_admin:
            raise ForbiddenError('ACCESS_DENIED')
        

        existing_slug = await self.repo.get_by_slug(slug=slug)

        if existing_slug:
            raise BadRequestError("PRODUCT_WITH_THE_SAME_SLUG_ALREADY_EXISTS")
        

        try:
            product = await self.repo.create(name=name,
                                       slug=slug,
                                       description=description,
                                       base_price = base_price,
                                       brand_id= brand_id,
                                       short_description=short_description
                                       )
            
            await self.db.commit()
            await self.db.refresh(product)
            return product
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_CREATE_PRODUCT:{e}")
        


    async def update_product(self,
                       actor_id:UUID,
                       product_id:UUID,
                       name:str = None, 
                       slug:str = None, 
                       base_price:Decimal = None, 
                       description:str = None,
                       short_description:str= None,
                       category_ids: list[UUID] = None,
                       brand_id: UUID = None,
                       remove_brand:bool = False,
                       is_available:bool | None = None
    ):
        
        if not actor_id or not product_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        
        if (name is None and 
            slug is None and 
            description is None and 
            base_price is None and 
            short_description is None and 
            brand_id is None and 
            not category_ids and 
            not remove_brand and 
            is_available is None
            ):
           raise BadRequestError("AT_LEAST_ONE_FIELD_IS_REQUIRED")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor.is_admin:
            raise ForbiddenError('ACCESS_DENIED')
        

        product = await self.get_product_by_id(product_id=product_id)
        

        update_data = {}

        if name and product.name != name:
            update_data['name'] = name


        if slug and product.slug != slug:
            existing_slug = await self.repo.get_by_slug(slug=slug)

            if existing_slug:
                raise BadRequestError("PRODUCT_WITH_THE_SAME_SLUG_ALREADY_EXISTS")
            
            update_data['slug'] = slug

        if description:
            update_data['description'] = description

        if base_price:
            update_data['base_price'] = base_price

        if short_description:
            update_data['short_description'] = short_description


        if is_available is not None:
            if product.is_available != is_available:
                update_data['is_available'] = is_available

        if brand_id:
            update_data['brand_id'] = brand_id

        elif remove_brand:
            update_data['brand_id'] = None

        
        try:
            if category_ids:
                await self.sync_product_categories(product=product,category_ids=category_ids)

            updated = await self.repo.update(product=product, **update_data)
            await self.db.commit()
            await self.db.refresh(updated)

            return updated
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_UPDATE_PRODUCT:{e}")

        
        
    async def get_product_by_id(self, product_id :UUID):
        if not product_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        product = await self.repo.get_by_id(product_id=product_id)

        if not product:
            raise NotFoundError("PRODUCT_NOT_FOUND")
        
        return product
    



    async def get_products(
            self,
            page:int = 1,
            page_size:int = 10,
            brand_id:UUID= None,
            min_price:Decimal= None,
            max_price:Decimal= None,
            category_ids: list[UUID]= None,
            is_active: bool | None = None,
            actor_data: dict = None
            ):
        
        if page < 0 or page_size < 1:
            raise BadRequestError("PAGE_AND_PAGE_SIZE_MUST_BE_GREATER_THAN_0")
        
        actor = actor_data.get("user")
        if not actor:
            
            is_active= True
        else:

            if not actor.is_admin and not actor.is_owner:
                is_active= True
        

        offset = (page - 1) * page_size

        products, total_count = await self.repo.get_paginated(
            limit=page_size,
            offset=offset,
            brand_id=brand_id,
            min_price=min_price,
            max_price=max_price,
            category_ids=category_ids,
            is_active = is_active
        )

        total_pages = math.ceil(total_count / page_size) if total_count else 0

        return{
            "items":products,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "total_count": total_count
        }
    




    async def sync_product_categories(self, product: Product, category_ids: list[UUID]):
        if not product or not category_ids:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
  

        category_ids = list(set(category_ids))

        categories = await self.cat_repo.get_by_ids(category_ids=category_ids)

        if len(categories) != len(category_ids):
            raise NotFoundError("ONE_OR_MORE_CATEGORIES_NOT_FOUND")


        current_categories = {c.id: c for c in product.categories}

        desired_categories = {c.id: c for c in categories}

        for cat_id, category in current_categories.items():
            if cat_id not in desired_categories:
                product.categories.remove(category)

        for cat_id, category in desired_categories.items():
            if cat_id not in current_categories:
                product.categories.append(category)

        
        try:
            # commit in update_product
            await self.db.refresh(product)
            return product
        except Exception as e:
            await self.db.rollback()
            raise Exception(f"FAILED_TO_SYNC_PRODUCT_AND_CATEGORIES: {e}")





    async def toggle_status(self, product_id:UUID, actor_id: UUID):
        if not product_id or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)
        if not actor:
            raise BadRequestError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError('ACCESS_DENIED') 
        
        product = await self.get_product_by_id(product_id=product_id)

        try:
            updated = await self.repo.status(product=product)
            await self.db.commit()
            await self.db.refresh(updated)

            return updated
        except Exception as e:
            raise InternalServerError(f"FALED_TO_TOGGLE_PRODUCT_STATUS:{e}")

        
    

    async def delete_product(self, product_id:UUID , actor_id:UUID): #*********  add delete product images **********
        if not product_id or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)
        if not actor.is_admin:
            raise ForbiddenError('ACCESS_DENIED')
        
        product = await self.get_product_by_id(product_id=product_id)

        try:
            deleted_id= product_id

            await self.repo.delete(product=product)
            await self.db.commit()

            return deleted_id
        
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILE_TO_DELETE_PRODUCT:{e}")






        
