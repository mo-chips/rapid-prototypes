from fastapi import Header, HTTPException, status
from typing import Optional
from config import settings

async def verify_api_key(x_chips_api_key: Optional[str] = Header(None, alias="X-Chips-API-Key")):
    """Dependency to check the custom X-Chips-API-Key header, returning a 401 if missing or invalid."""
    if not x_chips_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key header 'X-Chips-API-Key' is missing."
        )
    if x_chips_api_key != settings.chips_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key."
        )
    return x_chips_api_key
