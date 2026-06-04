from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Tuple
from decimal import Decimal



class PaymentGatewayBase(ABC):
    """
    Abstract base class for payment gateway integrations.
    All specific gateway implementations must inherit from this class
    and implement its abstract methods.
    """

    def __init__(self, merchant_id: str, sandbox: bool = True, api_key: Optional[str] = None):
        self.merchant_id = merchant_id
        self.sandbox = sandbox
        self.api_key = api_key
        self.base_url = self._get_base_url()

    @abstractmethod
    def _get_base_url(self) -> str:
        """
        Returns the base URL for the payment gateway API.
        Subclasses must implement this.
        """
        pass

    @abstractmethod
    async def create_payment(
        self, amount: Decimal, callback_url: str, description: str, order_id: str  
    ) -> Tuple[Optional[str], Optional[Dict[str, Any]]]:
        """
        Initiates a payment request with the gateway.

        Args:
            amount: The amount to be paid (as Decimal).
            callback_url: The URL the gateway should redirect to after payment.
            description: A short description for the payment.
            order_id: The internal order ID for reference.

        Returns:
            A tuple containing:
            - str: The payment authority token or redirect URL.
            - dict: Additional data returned by the gateway (e.g., gateway's transaction ID).
            If an error occurs, returns (None, None) or raises an exception.
        """
        pass

    @abstractmethod
    async def verify_payment(
        self, authority: str, amount: Decimal, transaction_id: Optional[str] = None 
    ) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Verifies the status of a payment with the gateway.

        Args:
            authority: The payment authority token received from create_payment.
            amount: The amount of the payment, must match the original amount.
            transaction_id: Optional transaction ID if available.

        Returns:
            A tuple containing:
            - bool: True if the payment is verified successfully, False otherwise.
            - dict: Additional data from the verification response (e.g., gateway's reference ID).
        """
        pass

    # You can add other common methods here, like refund, etc.
    # @abstractmethod
    # async def refund_payment(self, transaction_id: str, amount: Decimal) -> bool:
    #     pass
