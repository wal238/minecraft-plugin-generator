"""Configuration for supported Paper API versions and their build properties."""

PAPER_VERSIONS = {
    "1.20.1": {"maven_version": "1.20.1-R0.1-SNAPSHOT", "api_version": "1.20", "java_version": "17"},
    "1.20.4": {"maven_version": "1.20.4-R0.1-SNAPSHOT", "api_version": "1.20", "java_version": "17"},
    "1.20.6": {"maven_version": "1.20.6-R0.1-SNAPSHOT", "api_version": "1.20", "java_version": "17"},
    "1.21.1": {"maven_version": "1.21.1-R0.1-SNAPSHOT", "api_version": "1.21", "java_version": "21"},
    "1.21.4": {"maven_version": "1.21.4-R0.1-SNAPSHOT", "api_version": "1.21", "java_version": "21"},
}

SUPPORTED_VERSIONS = sorted(PAPER_VERSIONS.keys())

DEFAULT_VERSION = "1.21.1"


def get_version_config(version_str: str) -> dict:
    """Return the config for a given version, falling back to DEFAULT_VERSION if not found."""
    return PAPER_VERSIONS.get(version_str, PAPER_VERSIONS[DEFAULT_VERSION])
