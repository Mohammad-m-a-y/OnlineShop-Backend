import httpx 
from decimal import Decimal 
from typing import Any, Dict, Optional, Tuple
from app.service.gateways.base import PaymentGatewayBase
from app.core.config import get_settings 
from uuid import UUID
from app.core.logging_handler import logger






class ZarinpalGateway(PaymentGatewayBase):
    """
    Implementation of the PaymentGatewayBase for Zarinpal.
    Uses Zarinpal's v4 API.
    """

    def __init__(self):
        self.logger= logger
        self.setting = get_settings
        self.merchant_id = self.setting.ZARINPAL_MERCHANT_ID
        if not self.merchant_id:
            raise ValueError("Zarinpal merchant ID is not configured.")
        
        super().__init__(merchant_id=self.merchant_id, sandbox=self.setting.ZARINPAL_SANDBOX)



    def _get_base_url(self) -> str:
        """Returns the base URL for Zarinpal API based on sandbox mode."""
        if self.sandbox:
            return "https://sandbox.zarinpal.com"
        else:
            return "https://payment.zarinpal.com"


    async def create_payment(
        self, amount: Decimal, callback_url: str, description: str, order_id: UUID
    ) -> Tuple[Optional[str], Optional[Dict[str, Any]]]:
        """
        Initiates a payment request with Zarinpal.

        Args:
            amount: The amount to be paid (in Rial for Zarinpal API).
            callback_url: The URL Zarinpal should redirect to after payment.
            description: A short description for the payment.
            order_id: The internal order ID for reference.

        Returns:
            A tuple containing:
            - str: The payment authority token to be used for redirection.
            - dict: Additional data, including the redirection URL.
            Returns (None, None) if an error occurs.
        """
        # Zarinpal API expects amount in Rial. Convert from Decimal (e.g., Toman) to Rial.
        # Assuming amount is in Toman, multiply by 100. Adjust if your base unit is different.
        amount_in_rial = int(amount * 100) # Zarinpal uses integer Rial

        url = f"{self.base_url}/pg/v4/payment/request.json"
        
        # Payload structure as per Zarinpal v4 API documentation
        payload = {
            "merchant_id": self.merchant_id,
            "amount": amount_in_rial,
            "callback_url": callback_url,
            "description": description,
            # Optional fields:
            # "metadata": {mobile: , email: , order_id: }

        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
                data = response.json()

            if data.get("errors"):
                # Handle Zarinpal specific errors
                error_code = data["errors"].get("code")
                error_message = data["errors"].get("message")
                print(f"ZARINPAL_CREATE_PAYMENT_ERROR: Code={error_code}, Message={error_message}")
                return None, {"ERROR": f"Zarinpal API Error: {error_message} (Code: {error_code})"}

            if data.get("data") and data["data"].get("code") == 100:
                # Success code for Zarinpal request is 100
                authority = data["data"]["authority"]
                # The redirection URL is usually constructed like this:
                redirect_url = f"{self.base_url}/pg/StartPay/{authority}"
                return authority, {"redirect_url": redirect_url, "authority": authority, "message": "Payment request successful"}
            else:
                # Handle other non-100 success codes (which might indicate issues)
                code = data.get("data", {}).get("code", "N/A")
                message = data.get("data", {}).get("message", "Unknown error")
                self.logger.error(f"ZARINPAL_CREATE_PAYMENT_UNEXPECTED_SUCCESS_CODE: Code={code}, Message={message}")
                return None, {"error": f"Zarinpal API returned unexpected code: {message} (Code: {code})"}

        except httpx.HTTPStatusError as e:
            self.logger.error(f"HTTP_ERROR_OCCURRED: {e}")
            return None, {"error": f"HTTP Error: {e.response.status_code} - {e.response.text}"}
        except httpx.RequestError as e:
            self.logger.error(f"AN_ERROR_OCCURRED_WHILE_REQUESTING {e.request.url!r}: {e}")
            return None, {"error": "Network error occurred while contacting Zarinpal."}
        except Exception as e:
            self.logger.error(f"AN_UNEXPECTED_ERROR_OCCURRED: {e}")
            return None, {"error": f"An unexpected error occurred: {str(e)}"}




    async def verify_payment(
        self, authority: str, amount: Decimal, transaction_id: Optional[str] = None
    ) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Verifies the status of a payment with Zarinpal using the authority.

        Args:
            authority: The payment authority token received from create_payment.
            amount: The amount of the payment (in Rial for Zarinpal API). This must match the original amount.
            transaction_id: Not typically used directly in Zarinpal verification, but kept for interface consistency.

        Returns:
            A tuple containing:
            - bool: True if the payment is verified successfully, False otherwise.
            - dict: Additional data from the verification response, including 'ref_id' if successful.
        """
        # Zarinpal API expects amount in Rial.
        amount_in_rial = int(amount * 100)

        url = f"{self.base_url}/pg/v4/payment/verify.json"
        
        payload = {
            "merchant_id": self.merchant_id,
            "amount": amount_in_rial,
            "authority": authority,
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()

            if data.get("errors"):
                # Handle Zarinpal specific errors during verification
                error_code = data["errors"].get("code")
                error_message = data["errors"].get("message")
                self.logger.error(f"ZARINPAL_VERIFY_PAYMENT_ERROR: Code={error_code}, Message={error_message}")
                return False, {"error": f"Zarinpal API Error: {error_message} (Code: {error_code})", "code": error_code}

            # Zarinpal success code for verification is 100
            if data.get("data") and data["data"].get("code") == 100:
                # Success!
                ref_id = data["data"].get("ref_id") # This is the gateway's reference ID
                return True, {"ref_id": ref_id, "message": "Payment verified successfully"}
            else:
                # Handle other non-100 codes
                code = data.get("data", {}).get("code", "N/A")
                message = data.get("data", {}).get("message", "Verification failed")
                print(f"ZARINPAL_VERIFICATION_FAILED: Code={code}, Message={message}")
                return False, {"error": message, "code": code}

        except httpx.HTTPStatusError as e:
            self.logger.error(f"HTTP_ERROR_OCCURRED_DURING_VERIFICATION: {e}")
            return False, {"error": f"HTTP Error: {e.response.status_code} - {e.response.text}"}
        except httpx.RequestError as e:
            self.logger.error(f"AN_ERROR_OCCURRED_WHILE_REQUESTING_VERIFICATION_TO  {e.request.url!r}: {e}")
            return False, {"error": "Network error occurred during Zarinpal verification."}
        except Exception as e:
            self.logger.error(f"AN_UNEXPECTED_ERROR_OCCURRED_DURING_VERIFICATION: {e}")
            return False, {"error": f"An unexpected error occurred: {str(e)}"}

    # Optional: Implement refund if needed
    # async def refund_payment(self, transaction_id: str, amount: Decimal) -> bool:
    #     # This is a simplified example, actual refund API might require more parameters
    #     # and has different success codes.
    #     amount_in_rial = int(amount * 100)
    #     url = f"{self.base_url}/pg/v4/payment/refund.json"
    #     payload = {
    #         "merchant_id": self.merchant_id,
    #         "authority": transaction_id, # In Zarinpal, authority is used for refund too
    #         "amount": amount_in_rial,
    #     }
    #     try:
    #         async with httpx.AsyncClient() as client:
    #             response = await client.post(url, json=payload)
    #             response.raise_for_status()
    #             data = response.json()
            
    #         if data.get("errors"):
    #             print(f"Zarinpal refund error: {data['errors']}")
    #             return False
    #         # Zarinpal refund success code is usually 100 or 101
    #         if data.get("data") and data["data"].get("code") in [100, 101]:
    #             print(f"Zarinpal refund successful. Ref ID: {data['data'].get('ref_id')}")
    #             return True
    #         else:
    #             print(f"Zarinpal refund failed: {data.get('data', {})}")
    #             return False
    #     except Exception as e:
    #         print(f"Error during Zarinpal refund: {e}")
    #         return False
