"""Artifact storage abstraction — Supabase Storage in production, local in dev."""

import shutil
from pathlib import Path
from typing import Optional

from app.config import settings
from app.services.supabase_client import get_supabase_admin
from app.utils.logger import get_logger

logger = get_logger(__name__)

BUCKET_NAME = "build-artifacts"


class ArtifactStorageService:
    """Abstracts artifact storage."""

    async def upload(self, job_id: str, jar_path: Path, filename: str) -> str:
        """Upload a JAR file. Returns storage path."""
        storage_path = f"builds/{job_id}/{filename}"
        supabase = get_supabase_admin()

        if supabase:
            try:
                with open(jar_path, 'rb') as f:
                    supabase.storage.from_(BUCKET_NAME).upload(
                        storage_path, f.read(),
                        file_options={"content-type": "application/java-archive"}
                    )
                logger.info("Uploaded artifact to Supabase Storage: %s", storage_path)
                return storage_path
            except Exception as e:
                logger.warning("Supabase Storage upload failed, falling back to local: %s", e)

        # Local fallback
        dest = settings.DOWNLOADS_DIR / f"{job_id}-{filename}"
        settings.DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copy2(jar_path, dest)
        logger.info("Saved artifact locally: %s", dest)
        return str(dest)

    async def get_download_url(self, storage_path: str) -> str:
        """Generate a fresh signed download URL."""
        supabase = get_supabase_admin()

        if supabase and not storage_path.startswith('/') and not storage_path.startswith('./'):
            try:
                result = supabase.storage.from_(BUCKET_NAME).create_signed_url(
                    storage_path, 3600  # 1 hour TTL
                )
                if result.get('signedURL'):
                    return result['signedURL']
            except Exception as e:
                logger.warning("Failed to create signed URL: %s", e)

        # Local fallback — return direct download path via the existing artifact route
        return f"/api/download-artifact/{Path(storage_path).name}"

    async def delete(self, storage_path: str) -> None:
        """Delete an artifact from storage."""
        supabase = get_supabase_admin()

        if supabase and not storage_path.startswith('/') and not storage_path.startswith('./'):
            try:
                supabase.storage.from_(BUCKET_NAME).remove([storage_path])
                logger.info("Deleted artifact from Supabase Storage: %s", storage_path)
                return
            except Exception as e:
                logger.warning("Failed to delete from Supabase Storage: %s", e)

        # Local fallback
        local_path = Path(storage_path)
        if local_path.exists():
            local_path.unlink()
            logger.info("Deleted local artifact: %s", local_path)

    async def cleanup_expired(self):
        """Delete artifacts past their expiry."""
        from app.services.build_job_service import build_job_service
        expired = await build_job_service.get_expired_artifacts()
        for job in expired:
            try:
                await self.delete(job["artifact_storage_path"])
                await build_job_service.clear_artifact(job["id"])
                logger.info("Cleaned up expired artifact for job %s", job["id"])
            except Exception as e:
                logger.error("Failed to cleanup artifact for job %s: %s", job["id"], e)


artifact_storage = ArtifactStorageService()
