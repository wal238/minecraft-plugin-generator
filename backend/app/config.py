"""Application configuration using pydantic-settings."""

from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    # Directories
    TEMP_DIR: Path = Path("/tmp")
    DOWNLOADS_DIR: Path = Path("./downloads")

    # Build
    MAX_BUILD_TIME: int = 120
    MAVEN_PATH: str = "mvn"

    # Frontend
    FRONTEND_URLS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    class Config:
        env_file = ".env"


settings = Settings()
