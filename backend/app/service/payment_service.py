from app.repository.payment_repository import PaymentRepository
from sqlalchemy.ext.asyncio import AsyncSession
from app.exceptions.custom import (BadRequestError, NotFoundError, ForbiddenError, ConflictError)
from app.service.base_service import BaseService
from app.core.status_enum import PaymentStatus, OrderStatus
from app.models.payment_model import Payment
from app.models.order_model import Order
from app.service.gateways.base import PaymentGatewayBase
from app.core.config import get_settings
from typing import Optional, Tuple, Dict
from app.repository.order_repository import OrderRepository



class PaymentService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = PaymentRepository(db)
        self.order_repo = OrderRepository(db)
        self.gateway = PaymentGatewayBase
        self.setting = get_settings


    async def initiate_payment(self, order: Order) -> Tuple[Optional[str], Optional[Payment]]:
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
        if order.status != OrderStatus.PENDING:
            print(f"Order {order.id} is in status '{order.status.value}', cannot initiate payment.")
            raise ConflictError("CANNOT_INIIATE_PAYMENT")

        # Prevent multiple payment initiations for the same order
        existing_payment = await self.repo.get_by_order_id(order.id)
        if existing_payment and existing_payment.status == PaymentStatus.PENDING:
            print(f"Payment for order {order.id} is already pending. Using existing authority.")
            # If pending, maybe just return the existing redirect URL
            gateway_authority = existing_payment.authority
            if gateway_authority:
                redirect_url = f"{self.gateway.base_url}/pg/StartPay/{gateway_authority}"
                return redirect_url, existing_payment
            else:
                # If authority is missing for a pending payment, something is wrong.
                # Maybe try to re-initiate or mark as failed. For now, let's try re-initiate.
                pass # Fall through to re-initiate

        # Prepare callback URL dynamically
        # Ensure your domain and port are correctly configured in SETTINGS
        # Example: https://yourdomain.com/api/v1/payments/callback
        callback_url = f"{self.settings.APP_URL}/api/v1/payments/callback" # Adjust path as needed

        # Amount is typically in Toman (or your base currency), gateway converts to Rial
        amount_decimal = order.final_amount
        description = f"Payment for Order #{order.id}"

        # 1. Call the gateway to create payment request
        # The gateway's create_payment should handle amount conversion if necessary
        gateway_authority, gateway_data = await self.gateway.create_payment(
            amount=amount_decimal,
            callback_url=callback_url,
            description=description,
            order_id=str(order.id) # Pass order ID as string
        )

        if not gateway_authority or not gateway_data or gateway_data.get("error"):
            error_message = gateway_data.get("error", "Unknown error during gateway payment initiation.")
            print(f"Failed to initiate payment for order {order.id}: {error_message}")
            # Optionally create a FAILED payment record here
            await self.repo.create(
                order_id=order.id,
                gateway=self.gateway.__class__.__name__, # e.g., "ZarinpalGateway"
                payment_method="online", # Or get dynamically
                status=PaymentStatus.FAILED,
                amount=amount_decimal,
                description=f"Initiation failed: {error_message}"
            )
            await self.db.commit()
            return None, None

        # 2. Create Payment record in PENDING state
        payment_kwargs = {
            "order_id": order.id,
            "gateway": self.gateway.__class__.__name__,
            "payment_method": "online", # Could be more dynamic
            "status": PaymentStatus.PENDING,
            "amount": amount_decimal,
            "authority": gateway_authority,
            "description": description,
            "transaction_id": None # Not set yet
        }
        
        payment = await self.repo.create(**payment_kwargs)
        await self.db.commit() # Commit to get the payment ID and ensure it's saved

        # 3. Get the redirect URL from gateway data
        redirect_url = gateway_data.get("redirect_url")
        if not redirect_url:
            print(f"Gateway did not return a redirect URL for order {order.id}.")
            # Mark payment as failed if no redirect URL
            await self.payment_repo.update(payment, status=PaymentStatus.FAILED, description="Missing redirect URL from gateway")
            await self.db.commit()
            return None, None

        print(f"Payment initiated for order {order.id}. Redirecting to: {redirect_url}")
        return redirect_url, payment
    




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
            print("Callback received without authority.")
            return False, "Payment failed: Missing authority parameter."

        # Retrieve the payment record using authority (more robust than order_id here)
        # We need to query Payment directly by authority if our repo supports it,
        # or fetch it via Order if authority is also stored in Order, or assume authority is unique.
        # Let's assume the repo can find by authority or we adapt it.
        # For now, let's adjust the repo or make a direct query:
        
        payment = await self.repo.get_by_authority(authority=authority)
        
        if not payment:
            print(f"Payment record not found for authority: {authority}")
            raise NotFoundError("PAYMENT_RECORED_NOT_FOUND")
            
        order = payment.order

        # If payment is already successful/failed, do nothing (idempotency)
        if payment.status != PaymentStatus.PENDING:
            print(f"Payment {payment.id} for order {order.id} already has status {payment.status.value}. Skipping.")
            raise ConflictError("PAYMENT_ALREADY_PROCESSED")

        # Check status from callback parameters
        if status.lower() != "ok":
            print(f"Payment callback status is not OK for authority {authority}. Status: {status}")
            payment.status = PaymentStatus.FAILED
            payment.description = f"Payment failed at gateway. Status: {status}"
            await self.repo.update(payment, status=PaymentStatus.FAILED, description=payment.description)
            await self.db_session.commit()
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
            ref_id = verify_data.get("ref_id")
            print(f"Payment verified successfully for order {order.id}. Ref ID: {ref_id}")

            # Update payment status to SUCCESS
            payment.status = PaymentStatus.SUCCESS
            payment.transaction_id = ref_id # Store gateway's reference ID
            payment.description = f"Payment successful. Ref ID: {ref_id}"
            
            # Update order status to PAID
            order.status = OrderStatus.PAID
            order.payment_id = payment.id # Link payment to order if not already done by relationship

            # Update both payment and order
            await self.repo.update(payment=payment, status=PaymentStatus.SUCCESS, transaction_id=ref_id, description=payment.description)

            await self.order_repo.update(order= order,status= OrderStatus.PAID) 

            await self.db.commit()
            return True, "Payment successful. Your order is confirmed."
        else:
            error_message = verify_data.get("error", "Unknown verification error.")
            error_code = verify_data.get("code", "N/A")
            print(f"Payment verification failed for order {order.id}: {error_message} (Code: {error_code})")

            # Update payment status to FAILED
            payment.status = PaymentStatus.FAILED
            payment.description = f"Verification failed: {error_message} (Code: {error_code})"
            
            # Optionally, update order status to FAILED or keep as PENDING_PAYMENT
            # order.status = OrderStatus.FAILED # Or keep PENDING_PAYMENT if user can retry

            await self.repo.update(payment=payment, status=PaymentStatus.FAILED, description=payment.description)
            # await self.update_order_status(order.id, OrderStatus.FAILED) # If you want to fail the order too

            await self.db.commit()
            raise Exception("PAYMENT_VERIFICATION_FAILED")
        


    



        