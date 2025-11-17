from fastapi import APIRouter, HTTPException, status
from app.models.auth_models import SignupRequest, LoginRequest, TokenResponse
from app.services.auth_service import AuthService

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

@auth_router.post("/signup", response_model=TokenResponse)
async def signup(request: SignupRequest):
    """Register new user"""
    return AuthService.signup(request)

@auth_router.post("/login", response_model=TokenResponse)  
async def login(request: LoginRequest):
    """Login user"""
    return AuthService.login(request)
