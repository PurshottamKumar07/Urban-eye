from pydantic import BaseModel, Field, validator
import re

class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    phone_number: str = Field(..., example="+911234567890")
    password: str = Field(..., min_length=4)
    role: str = Field(default="citizen", example="citizen")
    department: str = Field(None, example="Public Works")
    
    @validator('phone_number')
    def validate_phone(cls, v):
        if not re.match(r'^\+\d{10,15}$', v):
            raise ValueError('Phone must start with + and contain 10-15 digits')
        return v
    
    @validator('role')
    def validate_role(cls, v):
        if v not in ['citizen', 'employee']:
            raise ValueError('Role must be citizen or employee')
        return v

class LoginRequest(BaseModel):
    phone_number: str = Field(..., example="+911234567890")
    password: str = Field(..., min_length=4)
    
    @validator('phone_number')
    def validate_phone(cls, v):
        if not re.match(r'^\+\d{10,15}$', v):
            raise ValueError('Phone must start with + and contain 10-15 digits')
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict
