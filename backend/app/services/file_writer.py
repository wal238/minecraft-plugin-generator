"""Writes generated files to disk with proper directory structure."""

from pathlib import Path
from typing import Any, Dict

from app.models.plugin_config import PluginConfig
from app.utils.logger import get_logger

logger = get_logger(__name__)


class FileWriterService:
    """Writes generated plugin files to the filesystem."""

    def write_files(
        self,
        base_dir: Path,
        config: PluginConfig,
        files: Dict[str, Any],
    ) -> None:
        """
        Write all generated files to disk in Maven project structure.

        Creates:
            {base_dir}/pom.xml
            {base_dir}/src/main/java/{package_path}/{MainClass}.java
            {base_dir}/src/main/java/{package_path}/listeners/*.java
            {base_dir}/src/main/java/{package_path}/commands/*.java
            {base_dir}/src/main/resources/plugin.yml
        """
        package_path = config.main_package.replace(".", "/")

        # Source directories
        java_dir = base_dir / "src" / "main" / "java" / package_path
        listeners_dir = java_dir / "listeners"
        commands_dir = java_dir / "commands"
        resources_dir = base_dir / "src" / "main" / "resources"

        java_dir.mkdir(parents=True, exist_ok=True)
        listeners_dir.mkdir(parents=True, exist_ok=True)
        commands_dir.mkdir(parents=True, exist_ok=True)
        resources_dir.mkdir(parents=True, exist_ok=True)

        # Write pom.xml
        pom_path = base_dir / "pom.xml"
        pom_path.write_text(files["pom_xml"], encoding="utf-8")
        logger.info("Wrote %s", pom_path)

        # Write main plugin class
        main_path = java_dir / f"{config.main_class_name}.java"
        main_path.write_text(files["main_java"], encoding="utf-8")
        logger.info("Wrote %s", main_path)

        # Write listener classes
        for filename, code in files["listeners"].items():
            listener_path = listeners_dir / filename
            listener_path.write_text(code, encoding="utf-8")
            logger.info("Wrote %s", listener_path)

        # Write command classes
        for filename, code in files.get("commands", {}).items():
            command_path = commands_dir / filename
            command_path.write_text(code, encoding="utf-8")
            logger.info("Wrote %s", command_path)

        # Write utility classes
        if files.get("utilities"):
            util_dir = java_dir / "util"
            util_dir.mkdir(parents=True, exist_ok=True)
            for filename, code in files["utilities"].items():
                util_path = util_dir / filename
                util_path.write_text(code, encoding="utf-8")
                logger.info("Wrote %s", util_path)

        # Write plugin.yml
        yml_path = resources_dir / "plugin.yml"
        yml_path.write_text(files["plugin_yml"], encoding="utf-8")
        logger.info("Wrote %s", yml_path)
