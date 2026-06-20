from uuid import UUID
from app.repository.product_image_repository import ProductImageRepository
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.base_service import BaseService
from fastapi import UploadFile
from app.exceptions.custom import (BadRequestError, NotFoundError,ForbiddenError,InternalServerError)
from app.repository.user_repository import UserRepository
from app.repository.product_repository import ProductRepository
from app.core.images import save_image , delete_file




class ProductImageService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = ProductImageRepository(db)
        self.user_repo = UserRepository(db)
        self.product_repo = ProductRepository(db)


    async def create(self,product_id:UUID,actor_id:UUID,image:UploadFile,is_primary:bool = False,alt_text:str = None):
        if not all([product_id, actor_id, image]):
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        
        product = await self.product_repo.get_by_id(product_id=product_id)

        if not product:
            raise NotFoundError("PRODUCT_NOT_FOUND")


        if is_primary:
            existing_primary = await self.repo.get_primary_image(product_id)
            if existing_primary:
                existing_primary.is_primary = False
                self.db.add(existing_primary)
            
            if product.images:
                for img in product.images:
                    img.display_order += 1
                    self.db.add(img)
                
                await self.db.flush()
        
            display_order = 0
        
        else:
            display_order = len(product.images) 


        image_path = None
        try:
            image_path = await save_image(upload_file=image, destination_type="product", destination_id=product_id)
            if not image_path:
                raise InternalServerError("FAILED_TO_SAVE_THE_NEW_IMAGE")
            
            new_image =await self.repo.create(
                product_id=product_id,
                image_url=str(image_path),
                alt_text=alt_text,
                display_order = display_order,
                is_primary=is_primary
            )

            await self.db.commit()
            await self.db.refresh(new_image)
            return new_image
        
        except Exception as e:
            await self.db.rollback()

            try:
                delete_file(image_path)
            except Exception as delete_err:
                print(f"Error cleaning up uploaded image: {delete_err}") 
            
            raise InternalServerError(f"FAILED_TO_UPDATE_PRODUCT_IMAGE: {e}")

            
            
    
    async def update_image_order(self,actor_id:UUID, product_id: UUID, image_id: UUID, new_order: int):
        if not all([actor_id,product_id,new_order is not None,image_id]):
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        

        product_images = await self.repo.get_all_by_product_id(product_id) 

        if not product_images:
            raise NotFoundError("PRODUCT_IMAGES_NOT_FOUND")


        target_image = next((img for img in product_images if img.id == image_id), None)
        if not target_image:
            raise NotFoundError("IMAGE_NOT_FOUND")


        current_order = target_image.display_order
        if current_order == new_order:
            return target_image


  

        try:

            original_orders = {img.id: img.display_order for img in product_images}

            for i, img in enumerate(product_images):
                img.display_order = 1000 + i
            await self.db.flush()



            for img in product_images:
                orig = original_orders[img.id]
                if img.id == image_id:
                    img.display_order = new_order

                elif new_order < current_order:
                    if orig >= new_order and orig < current_order:
                        img.display_order = orig + 1
                    else:
                        img.display_order = orig
                
                else:
                    if orig > current_order and orig <= new_order:
                        img.display_order = orig - 1
                    else:
                        img.display_order = orig

            await self.db.flush()



            for img in product_images:
                if img.display_order == 0:
                    if not img.is_primary:
                        img.is_primary = True
                        self.db.add(img)
                else:
                    if img.is_primary:
                        img.is_primary = False
                        self.db.add(img)

             
            await self.db.commit()
            await self.db.refresh(target_image)
            return target_image
        
        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_UPDATE_DISPLAY_ORDER:{e}")
    



    async def delete(self, image_id: UUID, product_id: UUID, actor_id: UUID): 

        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")

        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise NotFoundError("PRODUCT_NOT_FOUND")

        
        product_images = await self.repo.get_all_by_product_id(product_id=product_id)
        image_to_delete = next((img for img in product_images if img.id == image_id), None)
    
        if not image_to_delete:
            raise NotFoundError("IMAGE_NOT_FOUND")
        
        deleted_order = image_to_delete.display_order


        try:
            product_images_remaining = [img for img in product_images if img.id != image_id]
    
            original_orders = {img.id: img.display_order for img in product_images_remaining}
            for i, img in enumerate(product_images_remaining):
                img.display_order = 1000 + i
            await self.db.delete(image_to_delete)
            await self.db.flush()


            for img in product_images_remaining:
                orig = original_orders[img.id]
                if orig > deleted_order:
                    img.display_order = orig - 1
                else:
                    img.display_order = orig
            await self.db.flush()


            if image_to_delete.is_primary:
                new_primary = next(
                    (img for img in product_images_remaining if img.display_order == 0),
                    None
                )
                if new_primary:
                    new_primary.is_primary = True

            await self.db.commit()
            delete_file(image_to_delete.image_url)

        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_DELETE_PRODUCT_IMAGE:{e}")


    


            

          

        



