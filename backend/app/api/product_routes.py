from fastapi import APIRouter, Depends, Query, UploadFile, Form, File
from app.schemas.product_schemas import (CreateProduct, UpdateProduct, ProductResponse,UpdateProductVariant,
ProductImageResponse, UpdateProductImage, ProductVariantResponse, CreateProductVariant,
ProductAttributeResponse,CreateProductAttribute, UpdateProductAttribute, GetProductsResponse)
from app.dependencies.product_dependency import get_product_service
from app.dependencies.role_dependency import require_role
from uuid import UUID
from app.dependencies.product_image_dependency import get_product_image_service
from app.dependencies.product_variant_dependency import get_product_variant_service
from app.dependencies.attribute_dependency import get_attribute_service
from app.schemas.review_schemas import CreateReview,ReviewResponse, GetProductReviewsResponse
from app.dependencies.review_dependency import get_review_service
from fastapi_limiter.depends import RateLimiter
from decimal import Decimal
from app.dependencies.current_actor_dependency import get_actor



router = APIRouter(prefix="/products" , tags=["Products"])



# ============= products ===============


@router.post("/", 
            response_model=ProductResponse,
            dependencies=[Depends(RateLimiter(times=7, seconds=60))],
            status_code=201
            )
async def create_product(data:CreateProduct, service= Depends(get_product_service), current_actor=Depends(require_role(["admin", "owner"]))):
    return await service.create_product(
        actor_id = current_actor.id,
        name = data.name,
        slug = data.slug,
        description = data.description,
        base_price = data.base_price,
        short_description = data.short_description,
        brand_id = data.brand_id
    )        




@router.get("/", 
            response_model=GetProductsResponse,
            dependencies=[Depends(RateLimiter(times=100, seconds=60))], 
            status_code=200
            )
async def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(10 , ge=1, le=100),
    brand_id: int | None = Query(default=None),
    min_price: Decimal | None = Query(default=None),
    max_price: Decimal | None = Query(default=None),
    category_ids: list[UUID] | None = Query(default=None),
    is_active : bool | None = Query(default=None),
    search : str | None = Query(default=None),
    current_actor = Depends(get_actor),
    service = Depends(get_product_service)
):
    return await service.get_products(
        page= page,
        page_size= page_size,
        brand_id= brand_id,
        min_price= min_price,
        max_price= max_price,
        category_ids= category_ids,
        is_active= is_active,
        actor_data= current_actor,
        search= search
    )




@router.get('/{product_id}',
            dependencies=[Depends(RateLimiter(times=100, seconds=60))], 
            response_model=ProductResponse, 
            status_code=200
            )
async def get_product( product_id :UUID,service=Depends(get_product_service)):
    return await service.get_product_by_id(product_id=product_id)




@router.put('/{product_id}',
            dependencies=[Depends(RateLimiter(times=5, seconds=60))],  
            response_model=ProductResponse,status_code=200
            )
async def update_product(
    product_id:UUID,data:UpdateProduct,
    service=Depends(get_product_service),
    current_actor =Depends(require_role(["admin", "owner"]))  
    ):
    
    return await service.update_product(
        actor_id = current_actor.id,
        product_id = product_id,
        name = data.name,
        slug = data.slug,
        base_price = data.base_price,
        description = data.description,
        short_description = data.short_description,
        category_ids =data.category_ids,
        brand_id = data.brand_id,
        remove_brand = data.remove_brand,
        is_available = data.is_available,
        is_active = data.is_active
    )




@router.patch("/{product_id}/toggle-status",
            dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
            status_code=200
            )
async def toggle_product_status(
    product_id:UUID,
    service= Depends(get_product_service),
    cuurent_user = Depends(require_role(['admin','owner']))
):
    await service.toggle_status(
        product_id= product_id,
        actor_id= cuurent_user.id
    )





@router.delete("/{product_id}",
               dependencies=[Depends(RateLimiter(times=5, seconds=60))], 
               status_code=204
               )
async def delete_product(product_id,service=Depends(get_product_service),current_actor =Depends(require_role(["admin", "owner"]))):
    await service.delete_product(
        product_id = product_id,
        actor_id = current_actor.id
    )






# ============= product variants ===============


@router.post("/variants",
            dependencies=[Depends(RateLimiter(times=10, seconds=60))],
            response_model=ProductVariantResponse, 
            status_code=201
            )
async def create_product_variant(
    data:CreateProductVariant,
    current_actor=Depends(require_role(["admin", "owner"])),
    service = Depends(get_product_variant_service)
    ):

    return await service.create_variant(
        actor_id=current_actor.id ,
        product_id=data.product_id ,
        sku=data.sku ,
        price_modifier=data.price_modifier ,
        stock_quantity=data.stock_quantity ,
        discounted_price=data.discounted_price
    )





@router.patch("/variants/{variant_id}",
              dependencies=[Depends(RateLimiter(times=10, seconds=60))],  
              response_model=ProductVariantResponse, 
              status_code=200
              )
async def update_product_variant(
    variant_id: UUID,
    data:UpdateProductVariant,
    current_actor=Depends(require_role(["admin", "owner"])),
    service = Depends(get_product_variant_service)
    ):
    return await service.update_variant(
        actor_id=current_actor.id,
        variant_id=variant_id,
        sku=data.sku,
        price_modifier=data.price_modifier,
        discounted_price=data.discounted_price,
        stock_quantity=data.stock_quantity,
    )




@router.delete("/variants/{variant_id}",
               dependencies=[Depends(RateLimiter(times=5, seconds=60))],
               status_code=204)
async def delete_product_variant(
    variant_id: UUID,
    current_actor=Depends(require_role(["admin", "owner"])),
    service = Depends(get_product_variant_service)
):
    return await service.delete_variant(
        actor_id = current_actor.id,
        variant_id = variant_id
    )





# ============= product attribute ===============


@router.post("/variants/{variant_id}/attributes",
             dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
             response_model=ProductAttributeResponse, 
             status_code=201
             )
async def create_Product_attribute(
    variant_id: UUID,
    data:CreateProductAttribute,
    service = Depends(get_attribute_service),
    current_actor=Depends(require_role(["admin", "owner"]))
):
    return await service.create_attribute(
        actor_id= current_actor.id,
        variant_id=variant_id,
        name= data.name,
        value=data.value
    )



@router.patch("/variants/{variant_id}/attributes/{attribute_id}",
              dependencies=[Depends(RateLimiter(times=10, seconds=60))],  
              response_model=ProductAttributeResponse, 
              status_code=200
              )
async def update_attribute(
    variant_id: UUID,
    attribute_id: UUID,
    data: UpdateProductAttribute,
    service = Depends(get_attribute_service),
    current_actor=Depends(require_role(["admin", "owner"]))
):
    return await service.update_attribute(
        actor_id=current_actor.id,
        attribute_id=attribute_id,
        variant_id=variant_id,
        name=data.name,
        value=data.value,
    )



@router.delete("/variants/attributes/{attribute_id}",
               dependencies=[Depends(RateLimiter(times=5, seconds=60))],  
               status_code=204
               )
async def delete_attribute(
    attribute_id: UUID,
    service = Depends(get_attribute_service),
    current_actor=Depends(require_role(["admin", "owner"]))
):
    return await service.delete_attribute(
        attribute_id= attribute_id,
        actor_id= current_actor.id
    )






# ============= product images ===============




@router.post("/images",
            dependencies=[Depends(RateLimiter(times=20, seconds=60))], 
            response_model=ProductImageResponse,
            status_code=201
            )
async def create_product_image(
    product_id: UUID = Form(...),
    image: UploadFile = File(...),
    display_order:int = Form(...),
    is_primary:bool = Form(False),
    alt_text: str | None = Form(None),
    service = Depends(get_product_image_service),
    current_actor=Depends(require_role(["admin", "owner"]))
    ):

    return await service.create(
        product_id = product_id,
        actor_id = current_actor.id,
        image = image,
        display_order = display_order,
        is_primary = is_primary,
        alt_text = alt_text
    )



@router.patch('/images/{image_id}',
              dependencies=[Depends(RateLimiter(times=10, seconds=60))],  
              response_model=ProductImageResponse, 
              status_code=200
              )
async def update_image_order(
    product_id: UUID,
    data:UpdateProductImage, 
    service= Depends(get_product_service), 
    current_actor=Depends(require_role(["admin", "owner"]))
    ):

    return await service.update_image_order(
        actor_id = current_actor.id,
        product_id = product_id,
        image_id = data.image_id,
        new_order = data.new_order
    )



@router.delete("/images/{image_id}", 
               dependencies=[Depends(RateLimiter(times=5, seconds=60))], 
               status_code=204
               )
async def delete_product_image(
    image_id: UUID,
    product_id: UUID,
    service = Depends(get_product_image_service),
    current_actor=Depends(require_role(["admin", "owner"]))
):
    return await service.delete(
        image_id= image_id,
        product_id= product_id,
        actor_id = current_actor.id
    )



# ============= product reviews ===============


@router.post("/{product_id}/reviews",
             dependencies=[Depends(RateLimiter(times=5, seconds=60))], 
             response_model=ReviewResponse, 
             status_code=201
             )
async def create_review(
    product_id:UUID,
    data: CreateReview,
    service = Depends(get_review_service),
    current_actor =Depends(require_role(["user","admin", "owner"]))
):
    return await service.create(
        actor_id=current_actor.id,
        product_id=product_id,
        rating=data.rating,
        comment=data.comment,
        title=data.title,
        parent_id=data.parent_id,
    )



@router.get("/{product_id}/reviews",
            dependencies=[Depends(RateLimiter(times=60, seconds=60))], 
            response_model=GetProductReviewsResponse, 
            status_code=201
            )
async def get_product_reviews(
    product_id:UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    is_approved: bool | None = Query(default=None),
    current_actor = Depends(get_actor), 
    service = Depends(get_review_service),
):
    return await service.get_product_reviews(
        product_id= product_id,
        page= page,
        page_size= page_size,
        actor_data = current_actor["user"],
        is_approved= is_approved
    )