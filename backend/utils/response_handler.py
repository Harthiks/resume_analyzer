"""
Standardized API response helpers.
"""
from fastapi.responses import JSONResponse
from typing import Any, Optional

def success_response(data: Any = None, message: str = "Success", status_code: int = 200):
    """Return a standardized success response."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data,
        }
    )

def error_response(message: str, status_code: int = 400, details: Optional[Any] = None):
    """Return a standardized error response."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "details": details,
        }
    )

def paginated_response(data: list, total: int, page: int, limit: int, message: str = "Success"):
    """Return a paginated response."""
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": message,
            "data": data,
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "pages": (total + limit - 1) // limit,
            }
        }
    )
