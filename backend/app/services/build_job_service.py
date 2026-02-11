"""CRUD operations for build_jobs table."""

from typing import Optional
from app.services.supabase_client import get_supabase_admin
from app.utils.logger import get_logger

logger = get_logger(__name__)


class BuildJobService:
    """Manages build job records in Supabase."""

    async def enqueue_job(self, config: dict, user_id: Optional[str], plugin_name: str) -> str:
        """Insert a new build job. Returns job ID."""
        supabase = get_supabase_admin()
        if not supabase:
            raise RuntimeError("Supabase not configured")

        # Use the atomic enqueue function if available, else direct insert
        try:
            result = supabase.rpc('enqueue_build_job', {
                'p_user_id': user_id,
                'p_plugin_config': config,
                'p_plugin_name': plugin_name,
            }).execute()
            if result.data:
                return str(result.data)
        except Exception as e:
            if 'Queue limit exceeded' in str(e):
                raise
            logger.warning("enqueue_build_job RPC not available, using direct insert: %s", e)

        # Fallback: direct insert
        result = supabase.table('build_jobs').insert({
            'user_id': user_id,
            'plugin_config': config,
            'plugin_name': plugin_name,
        }).execute()
        return str(result.data[0]['id'])

    async def get_job(self, job_id: str) -> Optional[dict]:
        """Get a build job by ID."""
        supabase = get_supabase_admin()
        if not supabase:
            return None
        result = supabase.table('build_jobs').select('*').eq('id', job_id).single().execute()
        return result.data

    async def update_job(self, job_id: str, **fields):
        """Update build job fields."""
        supabase = get_supabase_admin()
        if not supabase:
            return
        from datetime import datetime
        fields['updated_at'] = datetime.utcnow().isoformat()
        supabase.table('build_jobs').update(fields).eq('id', job_id).execute()

    async def update_heartbeat(self, job_id: str):
        """Update heartbeat timestamp for a running job."""
        supabase = get_supabase_admin()
        if not supabase:
            return
        from datetime import datetime
        supabase.table('build_jobs').update({
            'heartbeat_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
        }).eq('id', job_id).execute()

    async def recover_stuck_jobs(self) -> int:
        """Recover stuck jobs via DB function."""
        supabase = get_supabase_admin()
        if not supabase:
            return 0
        try:
            from app.config import settings
            result = supabase.rpc('recover_stuck_build_jobs', {
                'p_timeout_minutes': settings.BUILD_JOB_TIMEOUT_MINUTES,
            }).execute()
            return result.data or 0
        except Exception as e:
            logger.error("recover_stuck_build_jobs failed: %s", e)
            return 0

    async def get_user_profile(self, user_id: str) -> dict:
        """Fetch user profile for tier info."""
        supabase = get_supabase_admin()
        if not supabase:
            return {"subscription_tier": "free"}
        result = supabase.table('profiles').select(
            'subscription_tier, builds_used_this_period'
        ).eq('id', user_id).single().execute()
        return result.data or {"subscription_tier": "free"}

    async def get_expired_artifacts(self) -> list:
        """Get jobs with expired artifacts."""
        supabase = get_supabase_admin()
        if not supabase:
            return []
        from datetime import datetime
        result = supabase.table('build_jobs').select(
            'id, artifact_storage_path'
        ).eq('status', 'succeeded').lt(
            'artifact_expires_at', datetime.utcnow().isoformat()
        ).not_.is_('artifact_storage_path', 'null').execute()
        return result.data or []

    async def clear_artifact(self, job_id: str):
        """Clear artifact fields after expiry cleanup."""
        supabase = get_supabase_admin()
        if not supabase:
            return
        supabase.table('build_jobs').update({
            'artifact_storage_path': None,
            'jar_filename': None,
            'artifact_size_bytes': None,
        }).eq('id', job_id).execute()


build_job_service = BuildJobService()
