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


class EntitlementsLimits(BaseModel):
    """Tier limits returned by entitlement endpoint."""

    max_events: int
    max_actions: int
    builds_per_period: int
    max_projects: int
    watermark: bool


class EntitlementsResponse(BaseModel):
    """Response for resolved tier entitlements."""

    status: str
    tier: str
    subscription_status: str | None
    cancel_at_period_end: bool
    current_period_end: str | None
    limits: EntitlementsLimits
    allowed_block_ids: List[str]
    locked_block_ids: List[str]
    lock_reasons: Dict[str, str]
