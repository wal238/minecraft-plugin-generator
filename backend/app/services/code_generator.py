"""Generates Java source code from block configuration.

This module is a thin orchestrator that delegates to sub-modules in the
``codegen`` package. The ``CodeGeneratorService`` class is the public API
used by routes and the plugin generator.
"""

from typing import Any, Dict

from app.models.block import BlockType
from app.models.plugin_config import PluginConfig

from .codegen.class_generators import (
    generate_commands,
    generate_listeners,
    generate_main_plugin,
)
from .codegen.template_generators import (
    generate_cooldown_manager,
    generate_plugin_yml,
    generate_pom_xml,
)


class CodeGeneratorService:
    """Generates all Java source files for a Minecraft plugin."""

    def generate_all(self, config: PluginConfig) -> Dict[str, Any]:
        """Generate all files needed for the plugin."""
        result = {
            "main_java": self.generate_main_plugin(config),
            "listeners": self.generate_listeners(config),
            "commands": self.generate_commands(config),
            "plugin_yml": self.generate_plugin_yml(config),
            "pom_xml": self.generate_pom_xml(config),
            "utilities": {},
        }

        # Generate shared CooldownManager if any block uses cooldowns
        all_action_names = {
            b.name for b in config.blocks if b.type == BlockType.ACTION
        }
        if all_action_names & {"SetCooldown", "CheckCooldown"}:
            result["utilities"]["CooldownManager.java"] = (
                self._generate_cooldown_manager(config.main_package)
            )

        return result

    # -- Delegation to sub-modules ------------------------------------------

    def generate_main_plugin(self, config: PluginConfig) -> str:
        return generate_main_plugin(config)

    def generate_listeners(self, config: PluginConfig) -> Dict[str, str]:
        return generate_listeners(config)

    def generate_commands(self, config: PluginConfig) -> Dict[str, str]:
        return generate_commands(config)

    def generate_plugin_yml(self, config: PluginConfig) -> str:
        return generate_plugin_yml(config)

    def generate_pom_xml(self, config: PluginConfig) -> str:
        return generate_pom_xml(config)

    def _generate_cooldown_manager(self, package: str) -> str:
        return generate_cooldown_manager(package)
