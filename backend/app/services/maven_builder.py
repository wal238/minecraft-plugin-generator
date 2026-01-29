"""Runs Maven build process to compile plugins into JAR files."""

import subprocess
from pathlib import Path
from typing import List

from app.config import settings
from app.models.exceptions import BuildError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class MavenBuilderService:
    """Builds Minecraft plugins using Maven."""

    def build(self, project_dir: Path, timeout: int | None = None) -> Path:
        """
        Build the plugin with Maven.

        Executes: mvn clean package -DskipTests

        Returns:
            Path to the generated JAR file.

        Raises:
            BuildError: If the build fails or times out.
        """
        if timeout is None:
            timeout = settings.MAX_BUILD_TIME

        cmd: List[str] = [
            settings.MAVEN_PATH,
            "clean",
            "package",
            "-DskipTests",
            "-q",
        ]

        logger.info("Running Maven build in %s", project_dir)

        try:
            result = subprocess.run(
                cmd,
                cwd=str(project_dir),
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        except subprocess.TimeoutExpired:
            raise BuildError(
                f"Maven build timed out after {timeout} seconds"
            )
        except FileNotFoundError:
            raise BuildError(
                f"Maven not found at '{settings.MAVEN_PATH}'. "
                "Ensure Maven is installed and on PATH."
            )

        if result.returncode != 0:
            error_output = result.stderr or result.stdout
            logger.error("Maven build failed:\n%s", error_output)
            raise BuildError(f"Maven build failed: {error_output[:500]}")

        # Find the generated JAR
        target_dir = project_dir / "target"
        jars = list(target_dir.glob("*.jar"))
        if not jars:
            raise BuildError("Build succeeded but no JAR file found in target/")

        jar_path = jars[0]
        logger.info("Build successful: %s", jar_path)
        return jar_path
