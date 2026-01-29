"""Custom exceptions for the plugin builder."""


class PluginBuilderException(Exception):
    """Base exception for plugin builder."""
    pass


class ValidationError(PluginBuilderException):
    """Input validation failed."""
    pass


class GenerationError(PluginBuilderException):
    """Plugin generation failed."""
    pass


class BuildError(PluginBuilderException):
    """Maven build failed."""
    pass
