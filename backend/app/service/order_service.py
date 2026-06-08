from app.repository.order_repository import OrderRepository
from sqlalchemy.ext.asyncio import AsyncSession
from app.service.base_service import BaseService
from app.exceptions.custom import (BadRequestError, NotFoundError, ForbiddenError,InternalServerError, UnauthorizedError)
from uuid import UUID
from decimal import Decimal
from app.repository.order_address_repository import OrderAddressRepository 
from app.repository.address_repository import AddressRepository
from app.repository.user_repository import UserRepository
from app.models.user_model import User
from datetime import datetime
import math
from app.repository.cart_repository import CartRepository
from app.core.status_enum import CartStatus
from app.core.status_enum import OrderStatus



class OrderService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = OrderRepository(db)
        self.order_address_repo = OrderAddressRepository (db)
        self.address_repo = AddressRepository(db)
        self.user_repo = UserRepository(db)
        self.cart_repo = CartRepository(db)


    async def create_order(
            self, 
            user_id:UUID,
            cart_id:UUID,
            address_id:UUID,  # user address
            shipping_method: str,
            payment_id = None,
            tracking_code: str = None,
            notes: str = None
            ):
        

        if not all([user_id,cart_id,address_id,shipping_method]):
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        

        address = await self.address_repo.get_by_id(address_id=address_id)
        if not address:
            raise NotFoundError('ADDRESS_NOT_FOUND')
        
        if address.user_id != user_id:
            raise ForbiddenError("NOT_PERMITED")

        item_recoreds= await self.create_order_item_records(actor_id=user_id,cart_id=cart_id)
        total_amount = item_recoreds.total_amount
        discount_amount = item_recoreds.discount_amount
        final_amount = item_recoreds.final_amount
        items_to_create = item_recoreds.items_to_create
        cart = item_recoreds.cart

        if total_amount is None or discount_amount is None or final_amount is None:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")

        if final_amount <= 0:
            raise  BadRequestError("FINAL_AMOUNT_CANT_BE_LESS_THAN_0")

         
        try:

            
            order = await self.repo.create(
                user_id = user_id,
                total_amount = total_amount,
                discount_amount = discount_amount,
                final_amount = final_amount,
                payment_id = payment_id,
                shipping_method = shipping_method,
                tracking_code = tracking_code,
                notes = notes,
            )


            for item in items_to_create:
                item['order_id'] = order.id


            await self.repo.bulk_create_order_items(items_data=items_to_create)

            await self.cart_repo.change_status(cart=cart, status=CartStatus.CONVERTED)


            await self.order_address_repo.create(
                order_id = order.id,
                province = address.province,
                city = address.city,
                full_address = address.full_address,
                postal_code = address.postal_code,
                receiver_name = address.receiver_name,
                receiver_mobile = address.receiver_mobile
            )



            await self.db.commit()
            await self.db.refresh(order)
            return order
        
        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_CREATE_ORDER: {e}")
            raise InternalServerError("FAILED_TO_CREATE_ORDER")
        



    async def create_order_item_records(self,actor_id:UUID, cart_id:UUID):
        if not actor_id or not cart_id :
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        cart = await self.cart_repo.get_to_create_order(cart_id=cart_id)
        if not cart:
            raise NotFoundError("CART_NOT_FOUND")
        
        if cart.user_id != actor_id:
            raise ForbiddenError("ACCESS_DENIED")
        
        cart_items = cart.items
        if not cart_items:
            raise BadRequestError("CART_OBJECT_HAS_NO_ITEMS")
        items_to_create = []
        calculated_total_amount = Decimal('0.0')
        calculated_discount_amount = Decimal('0.0')
        calculated_final_amount = Decimal("0.0")


        for i in cart_items:

            item_quantity = i.quantity
            if item_quantity > i.variant.stock_quantity:
                raise BadRequestError(f"INSUFFICIENT_STOCK_FOR_VARIANT_{i.variant.id}")

            unit_price = i.variant.price_modifier
            unit_final_price = (
            i.variant.discounted_price
            if i.variant.discounted_price is not None
            else unit_price
        )
            
            total_price = unit_price * item_quantity
            final_price = unit_final_price * item_quantity
            discount = total_price - final_price

            calculated_total_amount += total_price
            calculated_final_amount += final_price

            if discount > 0:
                calculated_discount_amount += discount

            details = {attr.name: attr.value for attr in i.variant.attributes}

            item_data = {
            "order_id": None,
            "product_id": i.product_id,
            "variant_id": i.variant_id,
            "quantity": i.quantity,
            "price_at_purchase": i.variant.price_modifier,
            "discounted_price_at_purchase": i.variant.discounted_price,
            "product_name_snapshot": i.product.name,
            "variant_details_snapshot": details 
            }
            items_to_create.append(item_data)



        return {
            "items_to_create":items_to_create,
            "total_amount": calculated_total_amount,
            "discount_amount": calculated_discount_amount,
            "final_amount": calculated_final_amount,
            'cart': cart
        }



    async def get_order_by_id(self,actor_id:UUID,order_id:UUID):
        if not order_id or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        

        order = await self.repo.get_by_id(order_id=order_id)
        if not order:
            raise NotFoundError("ORDER_NOT_FOUND")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)
        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if actor.id != order.user_id and not actor.is_admin:
            raise ForbiddenError("ACCESS_DENIED")
    
        return order

    


    async def update_order(
            self, 
            actor_id: UUID, 
            order_id: UUID,
            status:str,
            payment_id:UUID,
            tracking_code:str,
            shipping_method:str
        ):
        
        if not actor_id or not order_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")

        
        if not any([status,payment_id,tracking_code,shipping_method]):
            raise BadRequestError("AT_LEAST_ONE_OPTIONAL_FIELD_IS_REQUIRED")

        order = await self.repo.get_by_id(order_id)
        if not order: 
            raise NotFoundError("ORDER_NOT_FOUND")
        
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)
        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        if not actor.is_admin:
            raise ForbiddenError("ACCESS_DENIED")
        
        update_data = {}

        if status:
            update_data['status'] = status
        
        if payment_id:
            update_data['payment_id'] = payment_id
        
        if tracking_code:
            update_data['tracking_code'] = tracking_code
        
        if shipping_method:
            update_data['shipping_method'] = shipping_method


        try:
            updated = self.repo.update(order= order,**update_data)

            await self.repo.update(order, **update_data)
            await self.db.commit()
            return updated
        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_UPDATE_ORDER: {e}")
            raise InternalServerError("FAILED_TO_UPDATE_ORDER")





    async def get_orders(
            self,
            actor:User,
            page: int, 
            page_size: int,
            user_id: UUID = None,
            status: OrderStatus = None,
            start_date:datetime = None,
            end_date:datetime = None
            ):
        
        if page < 1 or page_size < 1:
            raise BadRequestError("PAGE_AND_PAGE_SIZE_MUST_BE_GREATER_THAN_0")
        
        if not actor:
            UnauthorizedError("YOU_ARE_NOT_LOGGED_IN")

        if not actor.is_admin:
            user_id = actor.id

        if not any([user_id,status,start_date,end_date]):
            raise BadRequestError("AT_LEAST_ONE_OPTIONAL_FIELD_IS_REQUIRED")


        offset = (page - 1) * page_size 

        items , total = await self.repo.get_all(
            limit=page_size,
            offset=offset,
            user_id=user_id,
            status=status,
            start_date=start_date,
            end_date=end_date
        )

        total_pages = math.ceil(total / page_size) if total else 0

        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "total_count": total,
        }
            
       
    


    async def delete_order(self, actor_id:UUID, order_id:UUID):
        if not order_id or not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        order = await self.repo.get_by_id(order_id=order_id)
        if not order:
            raise NotFoundError("ORDER_NOT_FOUND")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)
        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if actor.id != order.user_id and not actor.is_admin:
            raise ForbiddenError("ACCESS_DENIED")
        
        try:
            await self.repo.delete(order=order)
            await self.db.commit()

        except Exception as e:
            await self.db.rollback()
            print(f"ERROR_DURING_DELETE_ORDER: {e}")
            raise InternalServerError("FAILED_TO_DELETE_ORDER")
            
    


    

        
        

