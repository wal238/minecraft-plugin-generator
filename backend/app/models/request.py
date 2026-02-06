"""Request and response DTOs."""

from typing import Any, Dict, List

from pydantic import BaseModel


class GenerateResponse(BaseModel):
    """Response for plugin generation."""
    status: str
    download_id: str
    jar_name: str
    jar_url: str


class BlocksResponse(BaseModel):
    """Response for available blocks."""
    status: str
    events: List[Dict[str, Any]]
    actions: List[Dict[str, Any]]
    custom_options: List[Dict[str, Any]]


class HealthResponse(BaseModel):
    """Response for health check."""
    status: str
    message: str


class PreviewResponse(BaseModel):
    """Response for code preview."""
    status: str
    files: Dict[str, str]  # filename -> content


class WorldsResponse(BaseModel):
    """Response for available world names."""
    status: str
    worlds: List[str]
