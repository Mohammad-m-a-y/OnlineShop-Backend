from pydantic import BaseModel
from app.core.status_enum import OTPCodePurpose




class TokenResponse(BaseModel):
    access_token: str | None
    refresh_token: str | None
    token_type: str = 'bearer'



class TokenRequest(BaseModel):
    refresh_token: str



class SendOtpRequest(BaseModel):
    mobile: str
    purpose: OTPCodePurpose