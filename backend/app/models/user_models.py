from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class UserBase(BaseModel):
    full_name: Optional[str] = None
    phone_number: str

class UserCreate(UserBase):
    pass  # You can add password or other signup fields here

class UserResponse(UserBase):
    id: str
    role: str = "citizen"
    department: Optional[str] = None

    class Config:
        from_attributes = True
