"""Generates Java source code from block configuration."""

from typing import Any, Dict, List

from app.models.block import Block, BlockType
from app.models.plugin_config import PluginConfig
from app.utils.validators import sanitize_java_string

# Mapping of event names to their import paths
EVENT_IMPORTS: Dict[str, str] = {
    "PlayerJoinEvent": "org.bukkit.event.player.PlayerJoinEvent",
    "PlayerQuitEvent": "org.bukkit.event.player.PlayerQuitEvent",
    "BlockBreakEvent": "org.bukkit.event.block.BlockBreakEvent",
    "BlockPlaceEvent": "org.bukkit.event.block.BlockPlaceEvent",
}

# Mapping of event names to the player accessor expression
EVENT_PLAYER_ACCESSOR: Dict[str, str] = {
    "PlayerJoinEvent": "event.getPlayer()",
    "PlayerQuitEvent": "event.getPlayer()",
    "BlockBreakEvent": "event.getPlayer()",
    "BlockPlaceEvent": "event.getPlayer()",
}


class CodeGeneratorService:
    """Generates all Java source files for a Minecraft plugin."""

    def generate_all(self, config: PluginConfig) -> Dict[str, Any]:
        """Generate all files needed for the plugin."""
        return {
            "main_java": self.generate_main_plugin(config),
            "listeners": self.generate_listeners(config),
            "plugin_yml": self.generate_plugin_yml(config),
            "pom_xml": self.generate_pom_xml(config),
        }

    def generate_main_plugin(self, config: PluginConfig) -> str:
        """Generate the main plugin class extending JavaPlugin."""
        package = config.main_package
        class_name = config.main_class_name
        version = sanitize_java_string(config.version)

        # Collect listener registrations
        event_blocks = [b for b in config.blocks if b.type == BlockType.EVENT]
        listener_registrations = ""
        for i, _ in enumerate(event_blocks):
            listener_registrations += (
                f"        getServer().getPluginManager().registerEvents("
                f"new {package}.listeners.EventListener{i}(), this);\n"
            )

        return f"""package {package};

import org.bukkit.plugin.java.JavaPlugin;

public class {class_name} extends JavaPlugin {{

    @Override
    public void onEnable() {{
        getLogger().info("{class_name} v{version} enabled!");

        // Register listeners
{listener_registrations}    }}

    @Override
    public void onDisable() {{
        getLogger().info("{class_name} disabled!");
    }}
}}
"""

    def generate_listeners(self, config: PluginConfig) -> Dict[str, str]:
        """Generate event listener classes. Returns {filename: java_code}."""
        listeners: Dict[str, str] = {}
        blocks_by_id = {b.id: b for b in config.blocks}
        event_blocks = [b for b in config.blocks if b.type == BlockType.EVENT]

        for i, event_block in enumerate(event_blocks):
            # Gather child action blocks
            child_blocks = [
                blocks_by_id[cid]
                for cid in event_block.children
                if cid in blocks_by_id
            ]
            code = self._generate_listener_class(
                config.main_package, i, event_block, child_blocks
            )
            listeners[f"EventListener{i}.java"] = code

        return listeners

    def _generate_listener_class(
        self,
        package: str,
        index: int,
        event_block: Block,
        child_blocks: List[Block],
    ) -> str:
        """Generate a single event listener class."""
        event_name = event_block.name
        event_import = EVENT_IMPORTS.get(event_name, f"org.bukkit.event.{event_name}")
        player_accessor = EVENT_PLAYER_ACCESSOR.get(event_name, "event.getPlayer()")

        # Build imports
        imports = [
            "org.bukkit.event.Listener",
            "org.bukkit.event.EventHandler",
            event_import,
            "org.bukkit.entity.Player",
        ]

        action_names = {b.name for b in child_blocks if b.type == BlockType.ACTION}
        has_custom = any(b.type in (BlockType.CUSTOM_ACTION, BlockType.CUSTOM_CONDITION) for b in child_blocks)

        needs_material = bool(action_names & {"GiveItem", "DropItem"})
        if needs_material:
            imports.append("org.bukkit.Material")
            imports.append("org.bukkit.inventory.ItemStack")
        if "BroadcastMessage" in action_names or "ConsoleLog" in action_names or has_custom:
            imports.append("org.bukkit.Bukkit")
        if "PlaySound" in action_names:
            imports.append("org.bukkit.Sound")
        if "TeleportPlayer" in action_names:
            imports.append("org.bukkit.Location")
        if "DropItem" in action_names:
            imports.append("org.bukkit.inventory.ItemStack")
        if has_custom:
            imports.append("org.bukkit.ChatColor")

        import_lines = "\n".join(f"import {imp};" for imp in sorted(set(imports)))

        # Generate action code
        action_code = self._generate_action_code(child_blocks)

        return f"""package {package}.listeners;

{import_lines}

public class EventListener{index} implements Listener {{

    @EventHandler
    public void on{event_name}({event_name} event) {{
        Player player = {player_accessor};
{action_code}    }}
}}
"""

    def _generate_action_code(self, blocks: List[Block]) -> str:
        """Generate Java code for a list of action blocks."""
        lines: List[str] = []
        for block in blocks:
            if block.type == BlockType.ACTION:
                props = block.properties
                if block.name == "SendMessage":
                    msg = sanitize_java_string(props.get("message", "Hello!"))
                    if "%player%" in msg:
                        msg = msg.replace("%player%", '" + player.getName() + "')
                    lines.append(f'        player.sendMessage("{msg}");')
                elif block.name == "BroadcastMessage":
                    msg = sanitize_java_string(props.get("message", ""))
                    if "%player%" in msg:
                        msg = msg.replace("%player%", '" + player.getName() + "')
                    lines.append(f'        Bukkit.broadcastMessage("{msg}");')
                elif block.name == "GiveItem":
                    item_type = sanitize_java_string(props.get("itemType", "DIAMOND")).upper()
                    amount = props.get("amount", "1")
                    lines.append(
                        f"        player.getInventory().addItem("
                        f"new ItemStack(Material.{item_type}, {amount}));"
                    )
                elif block.name == "SetHealth":
                    health = props.get("health", "20.0")
                    lines.append(f"        player.setHealth({health});")
                elif block.name == "SetHunger":
                    hunger = props.get("hunger", "20")
                    lines.append(f"        player.setFoodLevel({hunger});")
                elif block.name == "CancelEvent":
                    lines.append("        event.setCancelled(true);")
                elif block.name == "PlaySound":
                    sound = sanitize_java_string(props.get("sound", "ENTITY_EXPERIENCE_ORB_PICKUP"))
                    volume = props.get("volume", "1.0")
                    pitch = props.get("pitch", "1.0")
                    lines.append(
                        f"        player.playSound(player.getLocation(), "
                        f"Sound.{sound}, {volume}f, {pitch}f);"
                    )
                elif block.name == "TeleportPlayer":
                    x = props.get("x", "0")
                    y = props.get("y", "64")
                    z = props.get("z", "0")
                    lines.append(
                        f"        player.teleport(new Location("
                        f"player.getWorld(), {x}, {y}, {z}));"
                    )
                elif block.name == "AddExperience":
                    amount = props.get("amount", "10")
                    lines.append(f"        player.giveExp({amount});")
                elif block.name == "SendTitle":
                    title = sanitize_java_string(props.get("title", ""))
                    subtitle = sanitize_java_string(props.get("subtitle", ""))
                    fade_in = props.get("fadeIn", "10")
                    stay = props.get("stay", "70")
                    fade_out = props.get("fadeOut", "20")
                    lines.append(
                        f'        player.sendTitle("{title}", "{subtitle}", '
                        f"{fade_in}, {stay}, {fade_out});"
                    )
                elif block.name == "ConsoleLog":
                    msg = sanitize_java_string(props.get("message", ""))
                    if "%player%" in msg:
                        msg = msg.replace("%player%", '" + player.getName() + "')
                    lines.append(f'        Bukkit.getLogger().info("{msg}");')
                elif block.name == "DropItem":
                    item_type = sanitize_java_string(props.get("itemType", "DIAMOND")).upper()
                    amount = props.get("amount", "1")
                    lines.append(
                        f"        player.getWorld().dropItemNaturally("
                        f"player.getLocation(), new ItemStack(Material.{item_type}, {amount}));"
                    )
            elif block.type == BlockType.CUSTOM_CONDITION:
                code = block.custom_code or "true"
                lines.append(f"        if ({code}) {{")
                lines.append("            // Custom condition body")
                lines.append("        }")
            elif block.type == BlockType.CUSTOM_ACTION:
                code = block.custom_code or "// custom action"
                for line in code.split("\n"):
                    lines.append(f"        {line}")

        return "\n".join(lines) + "\n" if lines else ""

    def generate_plugin_yml(self, config: PluginConfig) -> str:
        """Generate the plugin.yml manifest file."""
        return (
            f"name: {config.main_class_name}\n"
            f"version: {config.version}\n"
            f"main: {config.main_package}.{config.main_class_name}\n"
            f"description: {config.description}\n"
            f"authors:\n"
            f"  - {config.author}\n"
        )

    def generate_pom_xml(self, config: PluginConfig) -> str:
        """Generate Maven pom.xml with Paper API dependency."""
        parts = config.main_package.split(".")
        group_id = ".".join(parts[:2]) if len(parts) >= 2 else config.main_package

        return f"""<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>{group_id}</groupId>
    <artifactId>{config.artifact_id}</artifactId>
    <version>{config.version}</version>
    <packaging>jar</packaging>
    <description>{config.description}</description>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <repositories>
        <repository>
            <id>papermc</id>
            <url>https://repo.papermc.io/repository/maven-public/</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>io.papermc.paper</groupId>
            <artifactId>paper-api</artifactId>
            <version>1.21.1-R0.1-SNAPSHOT</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
            </plugin>
        </plugins>
    </build>
</project>
"""
