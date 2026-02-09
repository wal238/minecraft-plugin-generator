"""Small utility / helper functions used across the code-generation package."""

import re
from typing import Any, Dict

from app.utils.validators import sanitize_java_string

from .constants import ARG_PLACEHOLDER_RE


def replace_arg_placeholders(java_str: str, is_command: bool = False) -> str:
    """Replace %arg0%, %arg1%, ... with Java args[] array access.

    Only performs replacement when is_command is True (i.e. inside a CommandEvent
    context where the ``args`` variable exists). In listener context, %argN%
    text is left as a harmless literal.

    The input string is expected to be placed inside a Java string literal,
    so the replacement breaks out of the string with concatenation, e.g.:
        ``%arg0%`` -> ``" + (args.length > 0 ? args[0] : "") + "``
    This mirrors how %player% is handled, with bounds safety added.
    """
    if not is_command:
        return java_str
    return ARG_PLACEHOLDER_RE.sub(
        lambda m: f'" + (args.length > {m.group(1)} ? args[{m.group(1)}] : "") + "',
        java_str,
    )


def to_bool(value: Any, default: bool = False) -> bool:
    """Parse loose boolean-like values from block properties."""
    if isinstance(value, bool):
        return value
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def safe_java_identifier(raw: str, fallback: str) -> str:
    """Convert free-form input to a valid Java identifier."""
    base = re.sub(r"[^A-Za-z0-9_]", "_", (raw or "").strip())
    if not base:
        return fallback
    if re.match(r"^\d", base):
        base = f"arg_{base}"
    return base


def build_branch_if_expression(props: Dict[str, Any]) -> str:
    """Build a Java boolean expression for BranchIf from one or two conditions."""
    primary = build_branch_condition(
        props,
        prefix="first",
        default_type="HasPermission",
    )
    secondary = build_branch_condition(
        props,
        prefix="second",
        default_type="None",
    )
    combinator = sanitize_java_string(str(props.get("combinator", "AND"))).upper()
    if combinator not in {"AND", "OR"}:
        combinator = "AND"

    if not secondary:
        return primary
    op = "&&" if combinator == "AND" else "||"
    return f"({primary}) {op} ({secondary})"


def build_branch_condition(
    props: Dict[str, Any],
    prefix: str,
    default_type: str,
) -> str:
    """Convert a single BranchIf condition slot into Java code."""
    cond_type = sanitize_java_string(str(props.get(f"{prefix}Type", default_type))).strip()
    if cond_type == "None":
        return ""
    if cond_type == "HasPermission":
        perm = sanitize_java_string(str(props.get(f"{prefix}Permission", "")))
        return f'(player != null && player.hasPermission("{perm}"))'
    if cond_type == "HasItem":
        item_type = sanitize_java_string(str(props.get(f"{prefix}ItemType", "DIAMOND"))).upper()
        amount = props.get(f"{prefix}Amount", "1")
        return (
            f"(player != null && player.getInventory().contains(org.bukkit.Material.{item_type}, {amount}))"
        )
    if cond_type == "IsInWorld":
        world = sanitize_java_string(str(props.get(f"{prefix}World", "world")))
        return f'(player != null && player.getWorld().getName().equals("{world}"))'
    if cond_type == "HealthBelow":
        health = props.get(f"{prefix}Health", "5")
        return f"(player != null && player.getHealth() < {health})"
    if cond_type == "HealthAbove":
        health = props.get(f"{prefix}Health", "10")
        return f"(player != null && player.getHealth() > {health})"
    if cond_type == "GameModeEquals":
        mode = sanitize_java_string(str(props.get(f"{prefix}GameMode", "SURVIVAL"))).upper()
        return f"(player != null && player.getGameMode() == org.bukkit.GameMode.{mode})"
    if cond_type == "IsSneaking":
        return "(player != null && player.isSneaking())"
    if cond_type == "IsFlying":
        return "(player != null && player.isFlying())"
    if cond_type == "IsOp":
        return "(player != null && player.isOp())"
    if cond_type == "CheckCooldown":
        cooldown = sanitize_java_string(str(props.get(f"{prefix}CooldownName", "default")))
        return (
            f'(player != null && !CooldownManager.isOnCooldown("{cooldown}", player.getUniqueId()))'
            if cooldown
            else "true"
        )
    return "true"
