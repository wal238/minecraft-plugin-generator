"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.middleware.rate_limit import limiter
from app.models.exceptions import BuildError, GenerationError, ValidationError
from app.models.request import HealthResponse
from app.routes.build_jobs import router as build_jobs_router
from app.routes.plugin import router as plugin_router
from app.services.build_worker import build_worker, cleanup_orphaned_build_dirs
from app.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app):
    """Application lifespan — start/stop build worker."""
    if settings.ENVIRONMENT == "production" and not settings.REQUIRE_AUTH:
        raise RuntimeError(
            "FATAL: REQUIRE_AUTH=false is not allowed in production. "
            "Set REQUIRE_AUTH=true or ENVIRONMENT=development."
        )
    cleanup_orphaned_build_dirs()
    await build_worker.start()
    yield
    await build_worker.stop()


app = FastAPI(
    title="Minecraft Plugin Builder API",
    version="1.0.0",
    description="Generate Minecraft plugins from visual block configurations",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(plugin_router)
app.include_router(build_jobs_router)


# Exception handlers
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """Handle validation errors with 400 status."""
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(GenerationError)
async def generation_exception_handler(request: Request, exc: GenerationError) -> JSONResponse:
    """Handle generation errors with 500 status."""
    logger.error("Generation error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.exception_handler(BuildError)
async def build_exception_handler(request: Request, exc: BuildError) -> JSONResponse:
    """Handle build errors with 500 status."""
    logger.error("Build error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": f"Build failed: {str(exc)}"})


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(status="healthy", message="API is running")
