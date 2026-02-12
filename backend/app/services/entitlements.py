"""Tier entitlement resolution and block access checks."""

from __future__ import annotations

import re
from typing import Dict, Iterable, List, Optional, Tuple

from app.services.block_catalog import get_block_descriptors_for_ids
from app.services.entitlement_policy import TIER_RANK, get_required_tier, normalize_tier
from app.services.tier_limits import TIER_LIMITS

def get_limits_for_tier(tier: Optional[str]) -> Dict[str, int | bool]:
    return TIER_LIMITS.get(normalize_tier(tier), TIER_LIMITS["free"])


_SEMVER_RE = re.compile(r"^\s*(\d+)\.(\d+)(?:\.(\d+))?\s*$")


def _parse_version(version: str) -> Optional[Tuple[int, int, int]]:
    match = _SEMVER_RE.match(str(version))
    if not match:
        return None
    major = int(match.group(1))
    minor = int(match.group(2))
    patch = int(match.group(3) or "0")
    return major, minor, patch


def _is_version_in_range(
    paper_version: str,
    min_paper_version: Optional[str] = None,
    max_paper_version: Optional[str] = None,
) -> bool:
    cur = _parse_version(paper_version)
    if cur is None:
        return False
    if min_paper_version:
        min_ver = _parse_version(min_paper_version)
        if min_ver and cur < min_ver:
            return False
    if max_paper_version:
        max_ver = _parse_version(max_paper_version)
        if max_ver and cur > max_ver:
            return False
    return True


def get_block_violation(
    block_id: str,
    tier: str,
    paper_version: str,
    min_paper_version: Optional[str] = None,
    max_paper_version: Optional[str] = None,
) -> Optional[dict]:
    required_tier = get_required_tier(block_id)
    if TIER_RANK[tier] < TIER_RANK[required_tier]:
        return {
            "block_id": block_id,
            "reason": "LOCK_TIER",
            "required_tier": required_tier,
        }
    if not _is_version_in_range(paper_version, min_paper_version, max_paper_version):
        return {
            "block_id": block_id,
            "reason": "LOCK_VERSION",
            "required_tier": required_tier,
            "min_paper_version": min_paper_version,
            "max_paper_version": max_paper_version,
        }
    return None


def evaluate_blocks(
    blocks: Iterable[dict],
    tier: str,
    paper_version: str,
) -> List[dict]:
    violations: List[dict] = []
    normalized_tier = normalize_tier(tier)
    for block in blocks:
        violation = get_block_violation(
            block_id=str(block.get("id", "")),
            tier=normalized_tier,
            paper_version=paper_version,
            min_paper_version=block.get("min_paper_version"),
            max_paper_version=block.get("max_paper_version"),
        )
        if violation:
            violations.append(violation)
    return violations


def evaluate_block_ids(
    block_ids: List[str],
    tier: str,
    paper_version: str,
) -> Tuple[List[dict], List[str]]:
    descriptors, unknown_block_ids = get_block_descriptors_for_ids(block_ids)
    violations = evaluate_blocks(descriptors, tier=tier, paper_version=paper_version)
    return violations, unknown_block_ids


def resolve_entitlements(
    tier: Optional[str],
    subscription_status: Optional[str],
    cancel_at_period_end: bool,
    current_period_end: Optional[str],
    paper_version: str,
    all_blocks: Iterable[dict],
) -> dict:
    normalized_tier = normalize_tier(tier)
    limits = get_limits_for_tier(normalized_tier)
    allowed: List[str] = []
    locked: List[str] = []
    lock_reasons: Dict[str, str] = {}

    for block in all_blocks:
        block_id = str(block.get("id", ""))
        violation = get_block_violation(
            block_id=block_id,
            tier=normalized_tier,
            paper_version=paper_version,
            min_paper_version=block.get("min_paper_version"),
            max_paper_version=block.get("max_paper_version"),
        )
        if violation:
            locked.append(block_id)
            lock_reasons[block_id] = violation["reason"]
        else:
            allowed.append(block_id)

    return {
        "tier": normalized_tier,
        "subscription_status": subscription_status,
        "cancel_at_period_end": cancel_at_period_end,
        "current_period_end": current_period_end,
        "limits": {
            "max_events": limits["max_events"],
            "max_actions": limits["max_actions"],
            "builds_per_period": limits["builds_per_period"],
            "max_projects": 1 if normalized_tier == "free" else -1,
            "watermark": limits["watermark"],
        },
        "allowed_block_ids": allowed,
        "locked_block_ids": locked,
        "lock_reasons": lock_reasons,
    }
