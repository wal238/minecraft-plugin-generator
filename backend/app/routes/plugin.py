"""Plugin-related API endpoints."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.models.plugin_config import PluginConfig
from app.models.request import BlocksResponse, GenerateResponse
from app.services.block_definitions import BlockDefinitionService
from app.services.plugin_generator import PluginGeneratorService, get_download_path
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api")

plugin_generator = PluginGeneratorService()
block_definitions = BlockDefinitionService()


@router.post("/generate-plugin", response_model=GenerateResponse)
async def generate_plugin(config: PluginConfig) -> GenerateResponse:
    """Generate a Minecraft plugin from block configuration."""
    logger.info("Generating plugin: %s", config.name)

    download_id = await plugin_generator.generate(config)
    jar_name = f"{config.artifact_id}-{config.version}.jar"

    return GenerateResponse(
        status="success",
        download_id=download_id,
        jar_name=jar_name,
        jar_url=f"/download/{download_id}",
    )


@router.get("/blocks", response_model=BlocksResponse)
async def get_blocks() -> BlocksResponse:
    """Retrieve available block definitions."""
    blocks = block_definitions.get_available_blocks()
    return BlocksResponse(status="success", **blocks)


@router.get("/download/{download_id}")
async def download_plugin(download_id: str) -> FileResponse:
    """Download a generated JAR file."""
    jar_path = get_download_path(download_id)

    if jar_path is None or not jar_path.exists():
        raise HTTPException(status_code=404, detail="Download not found")

    return FileResponse(
        path=str(jar_path),
        media_type="application/java-archive",
        filename=jar_path.name,
    )
