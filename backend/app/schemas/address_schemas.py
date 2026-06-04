from pydantic import BaseModel
from uuid import UUID
from datetime import datetime







class CreateAddress(BaseModel):
    province: str
    city: str
    full_address: str
    postal_code: str
    receiver_name: str
    receiver_mobile: str


class UpdateAddress(BaseModel):
    province: str | None = None
    city: str | None = None
    full_address: str | None = None
    postal_code: str | None = None
    receiver_name: str | None = None
    receiver_mobile: str | None = None



class AddressResponse(BaseModel):
    id: UUID
    user_id: UUID
    province: str
    city: str
    full_address: str
    postal_code: str
    receiver_name: str
    receiver_mobile: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True




class UserAddressesResponse(BaseModel):
    items: list[AddressResponse] 