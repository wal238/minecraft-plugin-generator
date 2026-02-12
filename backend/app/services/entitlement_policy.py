"""Static tier/block policy used by both catalog and entitlement resolvers."""

from typing import Optional

TIERS = ("free", "premium", "pro")
TIER_RANK = {"free": 0, "premium": 1, "pro": 2}

# Premium and Pro share the same unlocked block set.
PREMIUM_ONLY_BLOCK_IDS = {
    "on-gui-click",
    "create-gui",
    "add-gui-item",
    "open-gui",
    "create-boss-bar",
    "remove-boss-bar",
    "set-scoreboard",
    "remove-scoreboard",
    "save-config",
    "send-config-value",
}


def normalize_tier(tier: Optional[str]) -> str:
    if tier in TIERS:
        return tier
    return "free"


def get_required_tier(block_id: str) -> str:
    return "premium" if block_id in PREMIUM_ONLY_BLOCK_IDS else "free"
