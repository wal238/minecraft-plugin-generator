"""Plugin-related API endpoints."""

import os

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse

from app.config import settings
from app.middleware.auth import optional_auth, require_auth
from app.middleware.rate_limit import limiter
from app.models.plugin_config import PluginConfig
from app.models.request import BlocksResponse, GenerateResponse, PreviewResponse, WorldsResponse
from app.services.block_definitions import BlockDefinitionService
from app.services.code_generator import CodeGeneratorService
from app.services.plugin_generator import PluginGeneratorService, get_download_path
from app.services.tier_limits import TIER_LIMITS

# Use require_auth when auth is enabled, optional_auth otherwise (dev mode)
_auth_dep = require_auth if settings.REQUIRE_AUTH else optional_auth
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api")

plugin_generator = PluginGeneratorService()
block_definitions = BlockDefinitionService()
code_generator = CodeGeneratorService()


@router.post("/generate-plugin", response_model=GenerateResponse)
@limiter.limit("10/minute")
async def generate_plugin(config: PluginConfig, request: Request, user: dict = Depends(_auth_dep)) -> GenerateResponse:
    """Generate a Minecraft plugin from block configuration."""
    logger.info("Generating plugin: %s", config.name)

    # Tier limit checks when auth is enabled
    if user and settings.REQUIRE_AUTH:
        tier = user.get("subscription_tier", "free")
        limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
        event_count = sum(1 for b in config.blocks if b.type.value == "event")
        action_count = sum(1 for b in config.blocks if b.type.value != "event")
        if limits["max_events"] != -1 and event_count > limits.get("max_events", 4):
            raise HTTPException(403, f"Your plan allows {limits['max_events']} events max.")
        if limits["max_actions"] != -1 and action_count > limits.get("max_actions", 8):
            raise HTTPException(403, f"Your plan allows {limits['max_actions']} actions max.")

    # Determine watermark based on tier
    watermark = False
    if user and settings.REQUIRE_AUTH:
        tier = user.get("subscription_tier", "free")
        limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
        watermark = limits.get("watermark", False)

    download_id = await plugin_generator.generate(config, watermark=watermark)
    jar_name = f"{config.artifact_id}-{config.version}.jar"

    return GenerateResponse(
        status="success",
        download_id=download_id,
        jar_name=jar_name,
        jar_url=f"/download/{download_id}",
    )


@router.post("/preview-code", response_model=PreviewResponse)
@limiter.limit("30/minute")
async def preview_code(config: PluginConfig, request: Request, user: dict = Depends(_auth_dep)) -> PreviewResponse:
    """Preview generated Java code without building."""
    logger.info("Previewing code for plugin: %s", config.name)

    # Tier limit checks when auth is enabled
    if user and settings.REQUIRE_AUTH:
        tier = user.get("subscription_tier", "free")
        limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
        event_count = sum(1 for b in config.blocks if b.type.value == "event")
        action_count = sum(1 for b in config.blocks if b.type.value != "event")
        if limits["max_events"] != -1 and event_count > limits.get("max_events", 4):
            raise HTTPException(403, f"Your plan allows {limits['max_events']} events max.")
        if limits["max_actions"] != -1 and action_count > limits.get("max_actions", 8):
            raise HTTPException(403, f"Your plan allows {limits['max_actions']} actions max.")

    # Determine watermark based on tier
    watermark = False
    if user and settings.REQUIRE_AUTH:
        tier = user.get("subscription_tier", "free")
        limits = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
        watermark = limits.get("watermark", False)

    generated = code_generator.generate_all(config, watermark=watermark)

    # Flatten files into a single dict with descriptive filenames
    files = {}

    # Main plugin class
    main_class_path = f"src/main/java/{config.main_package.replace('.', '/')}/{config.main_class_name}.java"
    files[main_class_path] = generated["main_java"]

    # Listener classes
    for filename, content in generated["listeners"].items():
        listener_path = f"src/main/java/{config.main_package.replace('.', '/')}/listeners/{filename}"
        files[listener_path] = content

    # Command classes
    for filename, content in generated.get("commands", {}).items():
        command_path = f"src/main/java/{config.main_package.replace('.', '/')}/commands/{filename}"
        files[command_path] = content

    # Utility classes
    for filename, content in generated.get("utilities", {}).items():
        util_path = f"src/main/java/{config.main_package.replace('.', '/')}/util/{filename}"
        files[util_path] = content

    # Config files
    files["src/main/resources/plugin.yml"] = generated["plugin_yml"]
    files["pom.xml"] = generated["pom_xml"]

    # Log the generated code for debugging
    logger.info("Generated %d files for %s", len(files), config.name)
    for filepath, content in files.items():
        logger.debug("--- %s ---\n%s", filepath, content)

    return PreviewResponse(status="success", files=files)


@router.get("/blocks", response_model=BlocksResponse)
@limiter.limit("60/minute")
async def get_blocks(request: Request) -> BlocksResponse:
    """Retrieve available block definitions."""
    blocks = block_definitions.get_available_blocks()
    return BlocksResponse(status="success", **blocks)


@router.get("/worlds", response_model=WorldsResponse)
@limiter.limit("60/minute")
async def get_worlds(request: Request) -> WorldsResponse:
    """Retrieve world names for world selector dropdowns."""
    env_worlds = os.getenv("PAPER_WORLD_NAMES", "")
    if env_worlds.strip():
        worlds = [w.strip() for w in env_worlds.split(",") if w.strip()]
    else:
        worlds = ["world", "world_nether", "world_the_end"]

    return WorldsResponse(status="success", worlds=worlds)


@router.get("/download/{download_id}")
@limiter.limit("20/minute")
async def download_plugin(download_id: str, request: Request, user: dict = Depends(_auth_dep)) -> FileResponse:
    """Download a generated JAR file (sync build system)."""
    jar_path = get_download_path(download_id)

    if jar_path is None or not jar_path.exists():
        raise HTTPException(status_code=404, detail="Download not found")

    return FileResponse(
        path=str(jar_path),
        media_type="application/java-archive",
        filename=jar_path.name,
    )


@router.get("/download-artifact/{filename}")
@limiter.limit("20/minute")
async def download_artifact(filename: str, request: Request, user: dict = Depends(_auth_dep)) -> FileResponse:
    """Download a build artifact JAR file (async build system, local fallback)."""
    import re
    # Sanitize filename to prevent path traversal
    safe_name = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    jar_path = settings.DOWNLOADS_DIR / safe_name

    if not jar_path.exists():
        raise HTTPException(status_code=404, detail="Artifact not found")

    return FileResponse(
        path=str(jar_path),
        media_type="application/java-archive",
        filename=safe_name,
    )
