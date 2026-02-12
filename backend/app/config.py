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

    # Database
    DATABASE_URL: str = "postgresql://mcplugin:mcplugin@localhost:5432/mcplugin"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Directories
    TEMP_DIR: Path = Path("/tmp")
    DOWNLOADS_DIR: Path = Path("./downloads")

    # Build
    MAX_BUILD_TIME: int = 120
    MAVEN_PATH: str = "mvn"
    MAX_CONCURRENT_BUILDS: int = 3
    BUILD_JOB_TIMEOUT_MINUTES: int = 10
    ARTIFACT_EXPIRY_HOURS: int = 24

    # Auth / Environment
    REQUIRE_AUTH: bool = False
    ENVIRONMENT: str = "development"

    # Logging
    LOG_LEVEL: str = "INFO"

    # Frontend
    FRONTEND_URLS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    class Config:
        # Load backend/.env regardless of process working directory.
        env_file = str(Path(__file__).resolve().parents[1] / ".env")
        extra = "ignore"


settings = Settings()
