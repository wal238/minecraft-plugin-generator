"""Uvicorn startup script for the Minecraft Plugin Builder API."""

import uvicorn
from app.config import settings


def main() -> None:
    """Start the Uvicorn server with configured settings."""
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )


if __name__ == "__main__":
    main()
