"""Build job API routes — async job submission and polling."""

from fastapi import APIRouter, Depends, HTTPException, Request

from app.config import settings
from app.middleware.auth import require_auth, optional_auth
from app.middleware.rate_limit import limiter
from app.models.build_job import BuildJobResponse, BuildJobStatusResponse
from app.models.plugin_config import PluginConfig
from app.services.build_job_service import build_job_service
from app.services.build_worker import build_worker
from app.services.artifact_storage import artifact_storage
from app.services.tier_limits import TIER_LIMITS
from app.services.supabase_client import get_supabase_admin
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api")


@router.post("/build-jobs", response_model=BuildJobResponse)
@limiter.limit("5/minute")
async def create_build_job(config: PluginConfig, request: Request, user: dict = Depends(require_auth)):
    """Submit a new build job. Returns immediately with job ID."""
    user_id = user.get("id") if user else None
    logger.info("Build job submitted by user %s: %s", user_id, config.name)

    # 1. Reserve build quota
    if user_id and settings.REQUIRE_AUTH:
        profile = await build_job_service.get_user_profile(user_id)
        tier = profile.get("subscription_tier", "free")
        max_builds = TIER_LIMITS.get(tier, TIER_LIMITS["free"])["builds_per_period"]

        supabase = get_supabase_admin()
        if supabase and max_builds != -1:
            quota_ok = supabase.rpc(
                "increment_build_count", {"p_user_id": user_id, "p_max_builds": max_builds}
            ).execute()
            if not quota_ok.data:
                raise HTTPException(403, "Monthly build limit reached. Upgrade your plan for more builds.")

    # 2. Enqueue job
    try:
        job_id = await build_job_service.enqueue_job(
            config=config.model_dump(),
            user_id=user_id if user_id != "local-dev-user" else None,
            plugin_name=config.name,
        )
    except Exception as e:
        # Refund quota if enqueue fails
        if user_id and settings.REQUIRE_AUTH:
            try:
                supabase = get_supabase_admin()
                if supabase:
                    supabase.rpc("decrement_build_count", {"p_user_id": user_id}).execute()
            except Exception:
                pass
        if "Queue limit exceeded" in str(e):
            raise HTTPException(429, "You have too many builds in progress. Wait for completion.")
        raise HTTPException(500, f"Failed to enqueue build: {str(e)}")

    # 3. Wake the worker
    build_worker.notify()

    job = await build_job_service.get_job(job_id)
    return BuildJobResponse(
        job_id=str(job["id"]) if job else job_id,
        status="queued",
        created_at=str(job["created_at"]) if job else None,
    )


@router.get("/build-jobs/{job_id}", response_model=BuildJobStatusResponse)
async def get_build_job(job_id: str, request: Request, user: dict = Depends(require_auth)):
    """Poll build job status. Returns fresh signed URL for succeeded jobs."""
    user_id = user.get("id") if user else None
    job = await build_job_service.get_job(job_id)

    if not job:
        raise HTTPException(404, "Build job not found")

    # Ownership check (skip in dev mode)
    if user_id and user_id != "local-dev-user" and job.get("user_id") and job["user_id"] != user_id:
        raise HTTPException(404, "Build job not found")

    result = BuildJobStatusResponse(
        job_id=str(job["id"]),
        status=job["status"],
        error_message=job.get("error_message"),
        jar_filename=job.get("jar_filename"),
        artifact_size_bytes=job.get("artifact_size_bytes"),
        created_at=str(job.get("created_at")),
        completed_at=str(job.get("completed_at")) if job.get("completed_at") else None,
    )

    # Generate fresh signed URL for succeeded jobs
    if job["status"] == "succeeded" and job.get("artifact_storage_path"):
        result.artifact_url = await artifact_storage.get_download_url(
            job["artifact_storage_path"]
        )

    return result
