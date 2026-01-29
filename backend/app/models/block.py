"""Block and BlockType models."""

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, field_validator


class BlockType(str, Enum):
    """Supported block types."""
    EVENT = "event"
    ACTION = "action"
    CONDITIONAL = "conditional"
    CUSTOM_CONDITION = "custom-condition"
    CUSTOM_ACTION = "custom-action"


class Block(BaseModel):
    """A single block in the plugin configuration."""
    id: str
    type: BlockType
    name: str
    properties: Dict[str, Any] = {}
    children: List[str] = []
    custom_code: Optional[str] = None
    code_context: Optional[str] = None

    @field_validator("id")
    @classmethod
    def validate_id(cls, v: str) -> str:
        """Ensure ID is a non-empty string."""
        if not v or not isinstance(v, str):
            raise ValueError("ID must be non-empty string")
        return v
