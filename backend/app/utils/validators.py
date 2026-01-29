"""Input validation utilities."""

import re


def validate_java_identifier(name: str) -> bool:
    """Check if a string is a valid Java identifier."""
    return bool(re.match(r"^[a-zA-Z_$][a-zA-Z0-9_$]*$", name))


def sanitize_plugin_name(name: str) -> str:
    """Sanitize plugin name for use in Java code."""
    sanitized = re.sub(r"[^a-zA-Z0-9 _-]", "", name)
    return sanitized.strip()


def sanitize_java_string(value: str) -> str:
    """Escape a string for safe use in Java source code."""
    return (
        value.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t")
    )
