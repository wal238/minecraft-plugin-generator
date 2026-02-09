"""Generate config/template files: plugin.yml, pom.xml, CooldownManager."""

from app.models.block import Block, BlockType
from app.models.plugin_config import PluginConfig
from app.utils.validators import sanitize_java_string


def generate_plugin_yml(config: PluginConfig) -> str:
    """Generate the plugin.yml manifest file."""
    yml = (
        f"name: {config.main_class_name}\n"
        f"version: {config.version}\n"
        f"main: {config.main_package}.{config.main_class_name}\n"
        f"description: {config.description}\n"
        f"authors:\n"
        f"  - {config.author}\n"
    )

    command_blocks = [
        b for b in config.blocks
        if b.type == BlockType.EVENT and b.name == "CommandEvent"
        and b.properties.get("commandName", "").strip()
    ]
    if command_blocks:
        yml += "commands:\n"
        for cmd_block in command_blocks:
            props = cmd_block.properties
            cmd_name = props.get("commandName", "").lower().strip()
            description = props.get("commandDescription", "")
            usage = props.get("commandUsage", f"/{cmd_name}")
            permission = props.get("commandPermission", "")
            aliases_str = props.get("commandAliases", "")

            yml += f"  {cmd_name}:\n"
            if description:
                yml += f"    description: {description}\n"
            if usage:
                yml += f"    usage: {usage}\n"
            if permission:
                yml += f"    permission: {permission}\n"
            if aliases_str:
                aliases = [a.strip() for a in aliases_str.split(",") if a.strip()]
                if aliases:
                    yml += f"    aliases: [{', '.join(aliases)}]\n"

    return yml


def generate_pom_xml(config: PluginConfig) -> str:
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


def generate_cooldown_manager(package: str) -> str:
    """Generate a shared CooldownManager utility class.

    Uses ConcurrentHashMap for thread safety (AsyncPlayerChatEvent etc.
    run off the main thread).
    """
    return f"""package {package}.util;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public final class CooldownManager {{

    private static final ConcurrentHashMap<String, ConcurrentHashMap<UUID, Long>> cooldowns = new ConcurrentHashMap<>();

    private CooldownManager() {{}}

    public static void setCooldown(String name, UUID playerId, long durationMs) {{
        cooldowns.computeIfAbsent(name, k -> new ConcurrentHashMap<>())
                 .put(playerId, System.currentTimeMillis() + durationMs);
    }}

    public static boolean isOnCooldown(String name, UUID playerId) {{
        ConcurrentHashMap<UUID, Long> map = cooldowns.get(name);
        if (map == null) return false;
        Long expiry = map.get(playerId);
        if (expiry == null) return false;
        if (System.currentTimeMillis() < expiry) return true;
        map.remove(playerId);
        return false;
    }}

    public static long getRemainingSeconds(String name, UUID playerId) {{
        ConcurrentHashMap<UUID, Long> map = cooldowns.get(name);
        if (map == null) return 0;
        Long expiry = map.get(playerId);
        if (expiry == null) return 0;
        long remaining = (expiry - System.currentTimeMillis()) / 1000;
        return Math.max(remaining, 0);
    }}
}}
"""
