"""Plugin configuration model."""

import re
from typing import ClassVar, List, Set

from pydantic import BaseModel, field_validator

from .block import Block

COMMAND_NAME_PATTERN = re.compile(r"^[a-z][a-z0-9_-]{0,31}$")


class PluginConfig(BaseModel):
    """Configuration for generating a Minecraft plugin."""
    name: str
    version: str
    main_package: str
    description: str
    author: str
    blocks: List[Block]
    paper_version: str = "1.21.1"

    SUPPORTED_PAPER_VERSIONS: ClassVar[Set[str]] = {"1.20.1", "1.20.4", "1.20.6", "1.21.1", "1.21.4"}

    @field_validator("paper_version")
    @classmethod
    def validate_paper_version(cls, v: str) -> str:
        if v not in cls.SUPPORTED_PAPER_VERSIONS:
            raise ValueError(f"Unsupported Paper version: {v}. Supported: {', '.join(sorted(cls.SUPPORTED_PAPER_VERSIONS))}")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Validate plugin name."""
        if not v or not v.strip():
            raise ValueError("Plugin name is required")
        if len(v) > 100:
            raise ValueError("Plugin name must be <= 100 characters")
        if not re.match(r"^[a-zA-Z0-9 _-]+$", v.strip()):
            raise ValueError("Plugin name contains invalid characters")
        return v.strip()

    @field_validator("blocks")
    @classmethod
    def validate_blocks(cls, v: List[Block]) -> List[Block]:
        """Ensure at least one block is provided."""
        if not v or len(v) == 0:
            raise ValueError("At least one block is required")

        command_names: set[str] = set()
        for block in v:
            if block.type.value != "event" or block.name != "CommandEvent":
                continue

            raw_name = str((block.properties or {}).get("commandName", "")).strip()
            if not raw_name:
                raise ValueError("CommandEvent commandName is required")
            if not COMMAND_NAME_PATTERN.match(raw_name):
                raise ValueError(
                    "CommandEvent commandName must start with a lowercase letter and use only lowercase letters, numbers, underscores, or hyphens"
                )

            if raw_name in command_names:
                raise ValueError(f"Duplicate commandName '{raw_name}'")
            command_names.add(raw_name)

            aliases_raw = str((block.properties or {}).get("commandAliases", "")).strip()
            if aliases_raw:
                aliases = [alias.strip() for alias in aliases_raw.split(",") if alias.strip()]
                for alias in aliases:
                    if not COMMAND_NAME_PATTERN.match(alias):
                        raise ValueError(
                            f"Invalid command alias '{alias}'. Use lowercase letters, numbers, underscores, or hyphens"
                        )
        return v

    @property
    def main_class_name(self) -> str:
        """Convert plugin name to valid Java class name."""
        parts = re.split(r"[-_ ]+", self.name)
        return "".join(word.capitalize() for word in parts if word)

    @property
    def artifact_id(self) -> str:
        """Convert to Maven artifact ID."""
        return self.name.lower().replace(" ", "-").replace("_", "-")
