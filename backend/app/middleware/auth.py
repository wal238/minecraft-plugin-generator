"""Authentication middleware for FastAPI routes."""

from fastapi import Request

from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Local dev user returned when auth is not required
LOCAL_DEV_USER = {"id": "local-dev-user", "email": "dev@localhost"}


async def require_auth(request: Request) -> dict:
    """Dependency that requires authentication.

    When REQUIRE_AUTH is False (local dev), returns a stub user.
    When REQUIRE_AUTH is True, validates the Authorization header
    against Supabase and returns the authenticated user dict.
    """
    if not settings.REQUIRE_AUTH:
        return LOCAL_DEV_USER

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.replace("Bearer ", "")

    try:
        from app.services.supabase_client import get_supabase_admin
        supabase = get_supabase_admin()
        if not supabase:
            raise RuntimeError("Supabase not configured")
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        user_id = str(user.id)
        user_dict = {"id": user_id, "email": user.email}

        # Fetch subscription tier from profiles table
        try:
            profile = supabase.table("profiles").select(
                "subscription_tier"
            ).eq("id", user_id).single().execute()
            if profile.data and profile.data.get("subscription_tier"):
                user_dict["subscription_tier"] = profile.data["subscription_tier"]
        except Exception as profile_err:
            logger.warning("Failed to fetch profile for tier info: %s", profile_err)

        return user_dict
    except Exception as e:
        logger.warning("Auth failed: %s", e)
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def optional_auth(request: Request) -> dict | None:
    """Dependency that optionally authenticates.

    Returns user dict if authenticated, None otherwise.
    """
    try:
        return await require_auth(request)
    except Exception:
        return None
