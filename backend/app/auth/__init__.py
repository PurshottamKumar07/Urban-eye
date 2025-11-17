"""
Authentication module for JWT token handling and user authentication
"""

from .jwt_handler import create_access_token, verify_token
from .auth_middleware import (
    get_current_user,
    get_optional_user,
    require_employee
)

__all__ = [
    "create_access_token",
    "verify_token", 
    "get_current_user",
    "get_optional_user",
    "require_employee"
]
