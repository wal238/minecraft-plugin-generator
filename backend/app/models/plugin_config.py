"""Plugin configuration model."""

import re
from typing import List

from pydantic import BaseModel, field_validator

from .block import Block


class PluginConfig(BaseModel):
    """Configuration for generating a Minecraft plugin."""
    name: str
    version: str
    main_package: str
    description: str
    author: str
    blocks: List[Block]

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
