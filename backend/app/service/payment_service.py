from app.repository.payment_repository import PaymentRepository
from sqlalchemy.ext.asyncio import AsyncSession
from app.exceptions.custom import ( NotFoundError, ConflictError)
from app.service.base_service import BaseService
from app.core.status_enum import PaymentStatus, OrderStatus
from app.models.order_model import Order
from app.service.gateways.zarinpal import ZarinpalGateway
from app.core.config import settings
from typing import Optional, Tuple, Dict
from app.repository.order_repository import OrderRepository
from app.core.logging_handler import logger
from uuid import UUID
from app.repository.product_variant_repository import ProductVariantRepository



class PaymentService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.payment_repo = PaymentRepository(db)
        self.order_repo = OrderRepository(db)
        self.gateway = ZarinpalGateway()
        self.variant_repo = ProductVariantRepository(db)
        self.logger = logger


    async def initiate_payment(self, order_id: UUID):
        """
        Initiates the payment process for a given order.
        1. Checks if the order is already paid.
        2. Creates a PENDING payment record in the database.
        3. Calls the payment gateway to get a payment authority/URL.
        4. Updates the payment record with the authority.
        5. Returns the payment URL and the payment object.

        Args:
            order: The order object for which payment is being initiated.

        Returns:
            A tuple containing:
            - str: The URL to redirect the user to for payment.
            - Payment: The created payment object.
            Returns (None, None) if payment cannot be initiated.
        """

        async with self.db.begin_nested():

            order = await self.order_repo.get_by_id_for_update(order_id=order_id)

            if not order:
                raise NotFoundError("ORDER_NOT_FOUND")

            if order.status != OrderStatus.PENDING:
                raise ConflictError("CANNOT_INITIATE_PAYMENT")

            await self._check_stock_for_order(order_id=order_id)

            successful_payment = await self.payment_repo.get_successfull_payment_for_order(order_id=order.id)
            

            if successful_payment:
                raise ConflictError("PAYMENT_ALREADY_PAID")

            await self.payment_repo.cancel_pending_payments(order.id)

            payment = await self.payment_repo.create(
                order_id=order.id,
                gateway=self.gateway.__class__.__name__,
                payment_method="online",
                status=PaymentStatus.PENDING,
                amount=order.final_amount,
                description=f"Payment for Order #{order.id}",
                transaction_id=None,
                authority=None,
            )

            payment_id = payment.id 

      
        callback_url = settings.PAYMENT_CALLBACK_URL 

        try:
            payment_to_update = await self.payment_repo.get_by_id(payment_id)

            gateway_authority, gateway_data = (
                await self.gateway.create_payment(
                    amount=order.final_amount,
                    callback_url=callback_url,
                    description=f"Payment for Order #{order.id}",
                    order_id=str(order.id),
                )
            )

            if (not gateway_authority or not gateway_data or gateway_data.get("error") ):

                error_message = gateway_data.get("error","Unknown gateway error")

                await self.payment_repo.update(
                    payment=payment_to_update,
                    status=PaymentStatus.FAILED,
                    description=f"Gateway error: {error_message}",
                )

                await self.db.commit()

                return None, None

            redirect_url = gateway_data.get("redirect_url")

            if not redirect_url:

                await self.payment_repo.update(
                    payment=payment_to_update,
                    status=PaymentStatus.FAILED,
                    description="Gateway did not return redirect url",
                )

                await self.db.commit()

                return None, None

            updated = await self.payment_repo.update(
                payment=payment_to_update,
                authority=gateway_authority,
            )

            await self.db.commit()
            await self.db.refresh(updated)

            return {
                "redirect_url": redirect_url,
                "payment": updated,
            }
        except Exception as exc:

            self.logger.exception(
                f"Payment initiation failed for order {order.id}"
            )

            await self.payment_repo.update(
                payment=payment_to_update,
                status=PaymentStatus.FAILED,
                description=str(exc),
            )

            await self.db.commit()

            raise


    async def _reduce_stock_for_order(self, order_id: UUID):
        order = await self.order_repo.get_to_reduce_stock_for_order(order_id=order_id)
        if not order:
            raise NotFoundError("ORDER_NOT_FOUND")
        
        for item in order.items:
            variant = item.variant
            if variant.stock_quantity < item.quantity:
                raise ConflictError(f"INSUFFICIENT_STOCK_FOR_VARIANT_{item.variant_id}")
            await self.variant_repo.update(
                variant=variant,
                stock_quantity=variant.stock_quantity - item.quantity
            )

        await self.db.flush()


    async def _check_stock_for_order(self, order_id: UUID):

        order = await self.order_repo.get_to_reduce_stock_for_order(order_id=order_id)

        for item in order.items:
            variant = item.variant
            if variant.stock_quantity < item.quantity:
                raise ConflictError(f"INSUFFICIENT_STOCK_FOR_VARIANT_{item.variant_id}")



    async def process_callback(self, query_params: Dict[str, str]) -> Tuple[bool, Optional[str]]:
        """
        Processes the callback from the payment gateway after the user attempts payment.
        1. Extracts necessary parameters (authority, status).
        2. Retrieves the corresponding Payment record from the database.
        3. Verifies the payment with the gateway.
        4. Updates the Payment and Order status based on verification result.

        Args:
            query_params: Dictionary of query parameters received from the gateway callback URL.

        Returns:
            A tuple containing:
            - bool: True if payment was successful, False otherwise.
            - str: A message indicating the outcome (e.g., success, failure reason).
        """
        authority = query_params.get("Authority") # Zarinpal uses 'Authority'
        status = query_params.get("Status")      # Zarinpal uses 'Status'

        if not authority:
            self.logger.error("Callback received without authority.")
            return False, "Payment failed: Missing authority parameter."

        
        payment = await self.payment_repo.get_by_authority(authority=authority)
        
        if not payment:
            raise NotFoundError("PAYMENT_RECORD_NOT_FOUND")
            
        order = payment.order

        # If payment is already successful/failed, do nothing (idempotency)
        if payment.status != PaymentStatus.PENDING:           
            raise ConflictError("PAYMENT_ALREADY_PROCESSED")

        # Check status from callback parameters
        if status.lower() != "ok":
            self.logger.error(f"Payment callback status is not OK for authority {authority}. Status: {status}")
            payment.status = PaymentStatus.FAILED
            payment.description = f"Payment failed at gateway. Status: {status}"
            await self.payment_repo.update(payment, status=PaymentStatus.FAILED, description=payment.description)
            await self.db.commit()
            return False, f"Payment failed at gateway. Status: {status}"

        # If status is OK, proceed to verify with the gateway
        print(f"Payment status OK for authority {authority}. Verifying with gateway...")
        
        # Verify the payment
        # IMPORTANT: Use the amount stored in the payment record, not from query_params
        is_verified, verify_data = await self.gateway.verify_payment(
            authority=authority,
            amount=payment.amount # Use the Decimal amount stored in the payment
            # transaction_id is optional here for Zarinpal's verify
        )

        if is_verified:
            ref_id = str(verify_data.get("ref_id"))
            print(f"Payment verified successfully for order {order.id}. Ref ID: {ref_id}")



            # Update payment and order and stock_quantity 
            await self.payment_repo.update(
                payment=payment, 
                status=PaymentStatus.SUCCESS, 
                transaction_id=ref_id, 
                description=f"Payment successful. Ref ID: {ref_id}"
                )

            await self.order_repo.update(order= order,status= OrderStatus.PAID)

            await self._reduce_stock_for_order(order_id=order.id) 

            await self.db.commit()
            return True, "Payment successful. Your order is confirmed."
        else:
            error_message = verify_data.get("error", "Unknown verification error.")
            error_code = verify_data.get("code", "N/A")
            self.logger.error(f"Payment verification failed for order {order.id}: {error_message} (Code: {error_code})")

            # Update payment status to FAILED
            payment.status = PaymentStatus.FAILED
            payment.description = f"Verification failed: {error_message} (Code: {error_code})"
            
            # Optionally, update order status to FAILED or keep as PENDING_PAYMENT
            order.status = OrderStatus.FAILED

            await self.payment_repo.update(payment=payment, status=PaymentStatus.FAILED, description=payment.description)
            await self.order_repo.update(order= order, status= OrderStatus.FAILED)

            await self.db.commit()
            raise Exception("PAYMENT_VERIFICATION_FAILED")
        


    



        