from typing import Dict, Any
from fastapi import HTTPException, status
from app.database import get_supabase
from app.auth.jwt_handler import create_access_token
from app.models.auth_models import SignupRequest, LoginRequest, TokenResponse
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    def signup(request: SignupRequest) -> TokenResponse:
        """Register new user"""
        try:
            supabase = get_supabase()
            
            # Check if user exists
            existing = supabase.table("user_profiles").select("*").eq("phone_number", request.phone_number).execute()
            
            if existing.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User with this phone number already exists"
                )
            
            # Create user profile
            user_data = {
                "full_name": request.full_name,
                "phone_number": request.phone_number,
                "password": request.password,  # Hash this in production!
                "role": request.role,
                "department": request.department,
                "status": "active"
            }
            
            new_user = supabase.table("user_profiles").insert(user_data).execute()
            
            if not new_user.data:
                raise HTTPException(status_code=500, detail="Failed to create user")
            
            user = new_user.data[0]
            
            # Create JWT token
            token_data = {
                "sub": user["id"],
                "role": user["role"],
                "phone_number": user["phone_number"],
                "full_name": user["full_name"]
            }
            
            access_token = create_access_token(token_data)
            
            return TokenResponse(
                access_token=access_token,
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                user={
                    "id": user["id"],
                    "full_name": user["full_name"],
                    "phone_number": user["phone_number"],
                    "role": user["role"],
                    "department": user.get("department")
                }
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Signup error: {str(e)}")
            raise HTTPException(status_code=500, detail="Signup failed")
    
    @staticmethod
    def login(request: LoginRequest) -> TokenResponse:
        """Login user"""
        try:
            supabase = get_supabase()
            
            # Find user
            user_response = supabase.table("user_profiles").select("*").eq("phone_number", request.phone_number).execute()
            
            if not user_response.data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid phone number or password"
                )
            
            user = user_response.data[0]
            
            # Check password (hash comparison in production!)
            if user.get("password") != request.password:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid phone number or password"
                )
            
            # Check if user is active
            if user.get("status") != "active":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Account is inactive"
                )
            
            # Create JWT token
            token_data = {
                "sub": user["id"],
                "role": user["role"],
                "phone_number": user["phone_number"],
                "full_name": user["full_name"]
            }
            
            access_token = create_access_token(token_data)
            
            return TokenResponse(
                access_token=access_token,
                expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
                user={
                    "id": user["id"],
                    "full_name": user["full_name"],
                    "phone_number": user["phone_number"],
                    "role": user["role"],
                    "department": user.get("department")
                }
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            raise HTTPException(status_code=500, detail="Login failed")
