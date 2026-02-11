"""Async build worker — processes build jobs from the queue."""

import asyncio
import re
import shutil
import uuid
from datetime import datetime, timedelta
from pathlib import Path

from app.config import settings
from app.models.plugin_config import PluginConfig
from app.services.build_job_service import build_job_service
from app.services.artifact_storage import artifact_storage
from app.services.code_generator import CodeGeneratorService
from app.services.file_writer import FileWriterService
from app.services.supabase_client import get_supabase_admin
from app.models.exceptions import BuildError
from app.utils.logger import get_logger

logger = get_logger(__name__)

code_generator = CodeGeneratorService()
file_writer = FileWriterService()


def cleanup_orphaned_build_dirs():
    """Delete any leftover /tmp/builds/* dirs from previous crashes."""
    builds_dir = Path("/tmp/builds")
    if builds_dir.exists():
        for d in builds_dir.iterdir():
            if d.is_dir():
                shutil.rmtree(d, ignore_errors=True)
                logger.info("Cleaned orphaned build dir: %s", d)


class BuildWorker:
    """Async build worker with semaphore-controlled concurrency."""

    def __init__(self):
        self._semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_BUILDS)
        self._wake_event = asyncio.Event()
        self._worker_id = f"worker-{uuid.uuid4().hex[:8]}"
        self._shutdown = False
        self._loop_task = None
        self._recovery_task = None
        self._cleanup_task = None

    async def start(self):
        """Called from FastAPI lifespan startup."""
        self._loop_task = asyncio.create_task(self._run_loop())
        self._recovery_task = asyncio.create_task(self._recovery_loop())
        self._cleanup_task = asyncio.create_task(self._artifact_cleanup_loop())
        logger.info("Build worker started: %s", self._worker_id)

    async def stop(self):
        """Called from FastAPI lifespan shutdown."""
        self._shutdown = True
        self._wake_event.set()
        if self._loop_task:
            await self._loop_task
        for task in [self._recovery_task, self._cleanup_task]:
            if task and not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
        logger.info("Build worker stopped: %s", self._worker_id)

    def notify(self):
        """Wake the worker when a new job is created."""
        self._wake_event.set()

    async def _run_loop(self):
        while not self._shutdown:
            try:
                await asyncio.wait_for(self._wake_event.wait(), timeout=10.0)
            except asyncio.TimeoutError:
                pass
            self._wake_event.clear()

            while not self._shutdown:
                await self._semaphore.acquire()
                job_id = await self._claim_job()
                if not job_id:
                    self._semaphore.release()
                    break
                asyncio.create_task(self._process_and_release(job_id))

    async def _claim_job(self) -> str | None:
        """Claim the next queued job via DB function."""
        supabase = get_supabase_admin()
        if not supabase:
            return None
        try:
            result = supabase.rpc('claim_next_build_job', {
                'p_worker_id': self._worker_id,
            }).execute()
            return str(result.data) if result.data else None
        except Exception as e:
            logger.error("Failed to claim job: %s", e)
            return None

    async def _process_and_release(self, job_id: str):
        try:
            await self._process_job(job_id)
        finally:
            self._semaphore.release()
            self.notify()

    async def _process_job(self, job_id: str):
        """Process a single build job."""
        build_dir = Path(f"/tmp/builds/{job_id}")
        heartbeat_task = None
        job = None
        try:
            build_dir.mkdir(parents=True, exist_ok=True)
            await build_job_service.update_job(job_id, build_dir=str(build_dir))

            heartbeat_task = asyncio.create_task(self._heartbeat_loop(job_id))

            # 1. Load config
            job = await build_job_service.get_job(job_id)
            config = PluginConfig(**job["plugin_config"])

            # 2. Determine watermark from user tier
            watermark = False
            user_id = job.get("user_id")
            if user_id:
                from app.services.tier_limits import TIER_LIMITS
                profile = await build_job_service.get_user_profile(user_id)
                tier = profile.get("subscription_tier", "free") if profile else "free"
                watermark = TIER_LIMITS.get(tier, TIER_LIMITS["free"]).get("watermark", False)

            # 3. Generate code
            loop = asyncio.get_event_loop()
            files = await loop.run_in_executor(
                None, lambda: code_generator.generate_all(config, watermark=watermark)
            )

            # 3. Write files
            await loop.run_in_executor(None, file_writer.write_files, build_dir, config, files)

            # 4. Maven build (non-blocking)
            jar_path = await self._async_maven_build(build_dir)

            # 5. Upload artifact
            safe_name = self._sanitize_filename(jar_path.name)
            storage_path = await artifact_storage.upload(job_id, jar_path, safe_name)

            # 6. Mark succeeded
            await build_job_service.update_job(job_id,
                status="succeeded",
                artifact_storage_path=storage_path,
                jar_filename=safe_name,
                artifact_size_bytes=jar_path.stat().st_size,
                artifact_expires_at=(datetime.utcnow() + timedelta(hours=settings.ARTIFACT_EXPIRY_HOURS)).isoformat(),
                completed_at=datetime.utcnow().isoformat(),
            )
            logger.info("Build job %s succeeded", job_id)

        except Exception as e:
            logger.error("Build job %s failed: %s", job_id, e)
            await build_job_service.update_job(job_id,
                status="failed",
                error_message=str(e)[:1000],
                completed_at=datetime.utcnow().isoformat(),
            )
            # Refund quota on failure
            user_id = job.get("user_id") if job else None
            if not user_id:
                try:
                    failed_job = await build_job_service.get_job(job_id)
                    user_id = failed_job.get("user_id") if failed_job else None
                except Exception:
                    pass
            if user_id:
                try:
                    supabase = get_supabase_admin()
                    if supabase:
                        supabase.rpc("decrement_build_count", {"p_user_id": user_id}).execute()
                        logger.info("Refunded build quota for user %s (job %s failed)", user_id, job_id)
                except Exception as refund_err:
                    logger.error("Failed to refund quota for user %s: %s", user_id, refund_err)
        finally:
            if heartbeat_task:
                heartbeat_task.cancel()
            if build_dir.exists():
                shutil.rmtree(build_dir, ignore_errors=True)

    async def _async_maven_build(self, project_dir: Path) -> Path:
        """Non-blocking Maven build."""
        proc = await asyncio.create_subprocess_exec(
            settings.MAVEN_PATH, "clean", "package", "-DskipTests", "-q",
            cwd=str(project_dir),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            stdout, stderr = await asyncio.wait_for(
                proc.communicate(), timeout=settings.MAX_BUILD_TIME,
            )
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
            raise BuildError(f"Maven build timed out after {settings.MAX_BUILD_TIME}s")

        if proc.returncode != 0:
            raise BuildError(f"Maven build failed: {(stderr or stdout or b'').decode()[:500]}")

        jars = list((project_dir / "target").glob("*.jar"))
        if not jars:
            raise BuildError("Build succeeded but no JAR found in target/")
        return jars[0]

    @staticmethod
    def _sanitize_filename(name: str) -> str:
        """Strip path traversal and non-safe characters from filenames."""
        name = Path(name).name
        name = re.sub(r'[^a-zA-Z0-9._-]', '_', name)
        name = name.lstrip('.')
        return name or 'plugin.jar'

    async def _heartbeat_loop(self, job_id: str):
        """Update heartbeat every 30s while job is running."""
        while True:
            await asyncio.sleep(30)
            await build_job_service.update_heartbeat(job_id)

    async def _recovery_loop(self):
        """Recover stuck jobs every 60s."""
        while not self._shutdown:
            await asyncio.sleep(60)
            try:
                recovered = await build_job_service.recover_stuck_jobs()
                if recovered > 0:
                    logger.warning("Recovered %d stuck build jobs", recovered)
            except Exception as e:
                logger.error("Stuck job recovery failed: %s", e)

    async def _artifact_cleanup_loop(self):
        """Delete expired artifacts every hour."""
        while not self._shutdown:
            await asyncio.sleep(3600)
            try:
                await artifact_storage.cleanup_expired()
            except Exception as e:
                logger.error("Artifact cleanup failed: %s", e)


build_worker = BuildWorker()
