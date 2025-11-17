from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from .jwt_handler import verify_token

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current authenticated user from JWT"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = credentials.credentials
    payload = verify_token(token)
    
    return {
        "user_id": payload.get("sub"),
        "role": payload.get("role", "citizen"),
        "phone_number": payload.get("phone_number"),
        "full_name": payload.get("full_name")
    }

def require_employee(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Require employee role"""
    if current_user.get("role") != "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee access required"
        )
    return current_user

def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get user if authenticated, None if not"""
    try:
        if credentials:
            return get_current_user(credentials)
    except:
        pass
    return None
