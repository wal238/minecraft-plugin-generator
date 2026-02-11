"""Supabase client singleton."""

import os
from typing import Optional

from app.utils.logger import get_logger

logger = get_logger(__name__)

_supabase_admin = None
_initialized = False


def get_supabase_admin():
    """Return the Supabase admin client, or None if not configured.

    Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.
    Returns None in local dev when these are not set, allowing the app
    to fall back to local-only behaviour.
    """
    global _supabase_admin, _initialized

    if _initialized:
        return _supabase_admin

    _initialized = True
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        logger.info("Supabase not configured — running in local-only mode")
        return None

    try:
        from supabase import create_client
        _supabase_admin = create_client(url, key)
        logger.info("Supabase admin client initialized")
    except Exception as e:
        logger.error("Failed to initialize Supabase client: %s", e)
        _supabase_admin = None

    return _supabase_admin
