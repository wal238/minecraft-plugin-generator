"""Orchestrates the plugin generation pipeline."""

import shutil
import uuid
from pathlib import Path
from typing import Dict

from app.config import settings
from app.models.exceptions import GenerationError
from app.models.plugin_config import PluginConfig
from app.services.code_generator import CodeGeneratorService
from app.services.file_writer import FileWriterService
from app.services.maven_builder import MavenBuilderService
from app.utils.logger import get_logger

logger = get_logger(__name__)

# In-memory mapping of download IDs to JAR file paths
_download_registry: Dict[str, Path] = {}


class PluginGeneratorService:
    """Orchestrates the entire plugin generation pipeline."""

    def __init__(self) -> None:
        self.code_generator = CodeGeneratorService()
        self.file_writer = FileWriterService()
        self.maven_builder = MavenBuilderService()

    async def generate(self, config: PluginConfig) -> str:
        """
        Generate a plugin from configuration.

        Returns:
            Download ID for retrieving the generated JAR.
        """
        build_id = uuid.uuid4().hex[:12]
        temp_dir = settings.TEMP_DIR / f"plugin-{build_id}"

        try:
            # 1. Generate source code
            logger.info("Generating code for plugin '%s'", config.name)
            files = self.code_generator.generate_all(config)

            # 2. Write files to disk
            temp_dir.mkdir(parents=True, exist_ok=True)
            self.file_writer.write_files(temp_dir, config, files)

            # 3. Run Maven build
            jar_path = self.maven_builder.build(temp_dir)

            # 4. Copy JAR to downloads directory
            download_id = uuid.uuid4().hex[:8]
            downloads_dir = settings.DOWNLOADS_DIR
            downloads_dir.mkdir(parents=True, exist_ok=True)

            jar_name = f"{config.artifact_id}-{config.version}.jar"
            dest_path = downloads_dir / f"{download_id}-{jar_name}"
            shutil.copy2(jar_path, dest_path)

            # 5. Register download
            _download_registry[download_id] = dest_path
            logger.info(
                "Plugin '%s' built successfully. Download ID: %s",
                config.name,
                download_id,
            )

            return download_id

        except Exception as e:
            logger.error("Plugin generation failed: %s", e)
            if not isinstance(e, (GenerationError,)):
                raise GenerationError(str(e)) from e
            raise
        finally:
            # 6. Clean up temp directory
            if temp_dir.exists():
                try:
                    shutil.rmtree(temp_dir)
                except OSError as cleanup_err:
                    logger.warning("Failed to clean up %s: %s", temp_dir, cleanup_err)


def get_download_path(download_id: str) -> Path | None:
    """Look up a JAR path by download ID."""
    return _download_registry.get(download_id)
