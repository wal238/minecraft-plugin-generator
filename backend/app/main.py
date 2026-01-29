"""FastAPI application entry point."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.models.exceptions import BuildError, GenerationError, ValidationError
from app.models.request import HealthResponse
from app.routes.plugin import router as plugin_router
from app.utils.logger import get_logger

logger = get_logger(__name__)

app = FastAPI(
    title="Minecraft Plugin Builder API",
    version="1.0.0",
    description="Generate Minecraft plugins from visual block configurations",
)

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
