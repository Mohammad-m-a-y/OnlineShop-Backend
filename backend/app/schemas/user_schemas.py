from pydantic import BaseModel , EmailStr , Field, computed_field
from datetime import datetime
from uuid import UUID
from app.core.status_enum import OTPCodePurpose
from app.core.config import settings


class RegisterRequest(BaseModel):
    username: str
    full_name: str
    mobile: str
    password: str = Field(... , min_length=8 , max_length=72)
    email: EmailStr | None = None


class Verify(BaseModel):
    mobile: str
    otp_code: str
    purpose: OTPCodePurpose = OTPCodePurpose.REGISTER



class LoginWithUsernameAndPassword(BaseModel):
    username: str
    password: str



class CurrentUserResponse(BaseModel):
    id: UUID
    username: str
    full_name: str
    email: EmailStr | None
    created_at: datetime
    updated_at: datetime | None
    is_active: bool
    is_admin: bool
    is_owner: bool
    image_url: str | None

    @computed_field
    @property
    def full_image_url(self) -> str | None:
        if not self.image_url:
            return None

        return f"{settings.BASE_URL}/{self.image_url}"


    class Config:
        from_attributes = True





class UsersResponse(BaseModel):
    items: list[CurrentUserResponse]
    page: int
    page_size: int
    total_pages: int
    total_count: int



