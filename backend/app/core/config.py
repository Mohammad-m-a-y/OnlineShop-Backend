from pydantic_settings import BaseSettings , SettingsConfigDict
from functools import lru_cache








class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )

    # app
    APP_NAME: str 
    ENV: str 
    DEBUG: bool

    # database
    DATABASE_URL: str 

    # security
    SECRET_KEY: str 
    ALGORITHM: str 
    ACCESS_TOKEN_EXPIRE_MINUTES: int 
    REFRESH_TOKEN_EXPIRE_DAYS: int 

    ZARINPAL_MERCHANT_ID: str
    ZARINPAL_SANDBOX: bool 

    PAYMENT_CALLBACK_URL: str

    #sms service
    SMS_API_KEY: str
    SMS_SENDER_NUMBER: str
    OTP_EXPIRATION_MINUTES: int 
    OTP_MAX_ATTEMPTS:int 

    FRONTEND_URL:str 






@lru_cache
def get_settings() -> Settings:
    return Settings()