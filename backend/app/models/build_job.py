"""Build job request/response models."""

from typing import Optional
from pydantic import BaseModel


class BuildJobResponse(BaseModel):
    """Response for build job creation."""
    job_id: str
    status: str
    created_at: Optional[str] = None


class BuildJobStatusResponse(BaseModel):
    """Response for build job status polling."""
    job_id: str
    status: str
    error_message: Optional[str] = None
    jar_filename: Optional[str] = None
    artifact_size_bytes: Optional[int] = None
    artifact_url: Optional[str] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None
