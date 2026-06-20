from enum import Enum




class CartStatus(str, Enum):
    ACTIVE = "active"
    CONVERTED = "converted"
    ABANDONED = "abandoned"
    MERGED = "merged"
    CANCELED = "canceled"




class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELED = "canceled"
    FAILED = "failed"
    RETURNED = "returned"




class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"




class OTPCodePurpose(str, Enum):
    REGISTER = "register"
    LOGIN = "login"
