from pydantic import BaseModel , EmailStr , Field
from datetime import datetime
from uuid import UUID
from fastapi import  UploadFile, File, Form
from typing import Optional
from app.core.status_enum import OTPCodePurpose



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

    class Config:
        from_attributes = True





class UsersResponse(BaseModel):
    items: list[CurrentUserResponse]
    page: int
    page_size: int
    total_pages: int
    total_count: int




class UpdateUser(BaseModel):
    username: Optional[str] = Form(None)
    full_name: Optional[str] = Form(None)
    email: Optional[EmailStr] = Form(None)
    remove_image: bool = Form(False)
    image: Optional[UploadFile] = File(None)

