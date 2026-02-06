"""Generates Java source code from block configuration."""

from typing import Any, Dict, List

from app.models.block import Block, BlockType
from app.models.plugin_config import PluginConfig
from app.utils.validators import sanitize_java_string

# Mapping of event names to their import paths
EVENT_IMPORTS: Dict[str, str] = {
    # Player Events
    "PlayerJoinEvent": "org.bukkit.event.player.PlayerJoinEvent",
    "PlayerQuitEvent": "org.bukkit.event.player.PlayerQuitEvent",
    "PlayerMoveEvent": "org.bukkit.event.player.PlayerMoveEvent",
    "AsyncPlayerChatEvent": "org.bukkit.event.player.AsyncPlayerChatEvent",
    "PlayerDeathEvent": "org.bukkit.event.entity.PlayerDeathEvent",
    "PlayerRespawnEvent": "org.bukkit.event.player.PlayerRespawnEvent",
    "PlayerInteractEvent": "org.bukkit.event.player.PlayerInteractEvent",
    "PlayerInteractEntityEvent": "org.bukkit.event.player.PlayerInteractEntityEvent",
    "PlayerToggleSneakEvent": "org.bukkit.event.player.PlayerToggleSneakEvent",
    "PlayerToggleSprintEvent": "org.bukkit.event.player.PlayerToggleSprintEvent",
    "PlayerDropItemEvent": "org.bukkit.event.player.PlayerDropItemEvent",
    "EntityPickupItemEvent": "org.bukkit.event.entity.EntityPickupItemEvent",
    # Block Events
    "BlockBreakEvent": "org.bukkit.event.block.BlockBreakEvent",
    "BlockPlaceEvent": "org.bukkit.event.block.BlockPlaceEvent",
    "BlockBurnEvent": "org.bukkit.event.block.BlockBurnEvent",
    "BlockIgniteEvent": "org.bukkit.event.block.BlockIgniteEvent",
    "BlockGrowEvent": "org.bukkit.event.block.BlockGrowEvent",
    # Entity Events
    "EntityDamageEvent": "org.bukkit.event.entity.EntityDamageEvent",
    "EntityDamageByEntityEvent": "org.bukkit.event.entity.EntityDamageByEntityEvent",
    "EntityDeathEvent": "org.bukkit.event.entity.EntityDeathEvent",
    "CreatureSpawnEvent": "org.bukkit.event.entity.CreatureSpawnEvent",
    "EntitySpawnEvent": "org.bukkit.event.entity.EntitySpawnEvent",
    # World Events
    "WeatherChangeEvent": "org.bukkit.event.weather.WeatherChangeEvent",
    "ThunderChangeEvent": "org.bukkit.event.weather.ThunderChangeEvent",
    "ServerListPingEvent": "org.bukkit.event.server.ServerListPingEvent",
}

# Mapping of event names to the player accessor expression
EVENT_PLAYER_ACCESSOR: Dict[str, str] = {
    # Player events - direct player access
    "PlayerJoinEvent": "event.getPlayer()",
    "PlayerQuitEvent": "event.getPlayer()",
    "PlayerMoveEvent": "event.getPlayer()",
    "AsyncPlayerChatEvent": "event.getPlayer()",
    "PlayerDeathEvent": "event.getEntity()",
    "PlayerRespawnEvent": "event.getPlayer()",
    "PlayerInteractEvent": "event.getPlayer()",
    "PlayerInteractEntityEvent": "event.getPlayer()",
    "PlayerToggleSneakEvent": "event.getPlayer()",
    "PlayerToggleSprintEvent": "event.getPlayer()",
    "PlayerDropItemEvent": "event.getPlayer()",
    "EntityPickupItemEvent": "(Player) event.getEntity()",
    # Block events
    "BlockBreakEvent": "event.getPlayer()",
    "BlockPlaceEvent": "event.getPlayer()",
    "BlockBurnEvent": "null",  # No player involved
    "BlockIgniteEvent": "event.getPlayer()",  # May be null
    "BlockGrowEvent": "null",
    # Entity events - may or may not have player
    "EntityDamageEvent": "(event.getEntity() instanceof Player ? (Player) event.getEntity() : null)",
    "EntityDamageByEntityEvent": "(event.getEntity() instanceof Player ? (Player) event.getEntity() : null)",
    "EntityDeathEvent": "(event.getEntity() instanceof Player ? (Player) event.getEntity() : null)",
    "CreatureSpawnEvent": "null",  # No player involved
    "EntitySpawnEvent": "null",
    # World events
    "WeatherChangeEvent": "null",  # No player involved
    "ThunderChangeEvent": "null",
    "ServerListPingEvent": "null",
}

# Events that need special handling (no guaranteed player)
EVENTS_WITHOUT_PLAYER: set = {
    "BlockBurnEvent",
    "BlockGrowEvent",
    "EntityDamageEvent",
    "EntityDamageByEntityEvent",
    "EntityDeathEvent",
    "CreatureSpawnEvent",
    "EntitySpawnEvent",
    "WeatherChangeEvent",
    "ThunderChangeEvent",
    "ServerListPingEvent",
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
        has_no_player = event_name in EVENTS_WITHOUT_PLAYER

        # Build imports
        imports = [
            "org.bukkit.event.Listener",
            "org.bukkit.event.EventHandler",
            event_import,
        ]

        # Only import Player if we actually have access to one
        if not has_no_player or player_accessor != "null":
            imports.append("org.bukkit.entity.Player")

        action_names = {b.name for b in child_blocks if b.type == BlockType.ACTION}
        has_custom = any(b.type in (BlockType.CUSTOM_ACTION, BlockType.CUSTOM_CONDITION) for b in child_blocks)

        needs_material = bool(action_names & {"GiveItem", "DropItem", "RemoveItem", "SetItemInHand", "SetBlockType", "FillRegion", "SetEntityEquipment"})
        if needs_material:
            imports.append("org.bukkit.Material")
            imports.append("org.bukkit.inventory.ItemStack")
        if (
            "BroadcastMessage" in action_names
            or "ConsoleLog" in action_names
            or "SendConsoleMessage" in action_names
            or "TeleportPlayer" in action_names
            or "TeleportEntity" in action_names
            or "ExecuteCommand" in action_names
            or "ExecuteConsoleCommand" in action_names
            or "ExecuteCommandAsPlayer" in action_names
            or has_custom
        ):
            imports.append("org.bukkit.Bukkit")
        if "PlaySound" in action_names:
            imports.append("org.bukkit.Sound")
        if "TeleportPlayer" in action_names or "SetVelocity" in action_names or "TeleportEntity" in action_names:
            imports.append("org.bukkit.Location")
        if "SetVelocity" in action_names or "SetEntityVelocity" in action_names:
            imports.append("org.bukkit.util.Vector")
        if "DropItem" in action_names:
            imports.append("org.bukkit.inventory.ItemStack")
        if has_custom:
            imports.append("org.bukkit.ChatColor")
        if "SetGameMode" in action_names:
            imports.append("org.bukkit.GameMode")
        if (
            "AddPotionEffect" in action_names
            or "ApplyPotionEffect" in action_names
            or "RemovePotionEffect" in action_names
            or "ApplyEntityPotionEffect" in action_names
        ):
            imports.append("org.bukkit.potion.PotionEffect")
            imports.append("org.bukkit.potion.PotionEffectType")
        if "SpawnParticle" in action_names or "SpawnParticles" in action_names:
            imports.append("org.bukkit.Particle")
        if "SpawnEntity" in action_names:
            imports.append("org.bukkit.entity.EntityType")
        if "SetEntityHealth" in action_names or "ApplyEntityPotionEffect" in action_names or "SetEntityOnFire" in action_names or "SetEntityCustomName" in action_names or "SetEntityEquipment" in action_names:
            imports.append("org.bukkit.entity.LivingEntity")
        if "DamageEntity" in action_names or "TeleportEntity" in action_names or "SetEntityVelocity" in action_names:
            imports.append("org.bukkit.entity.Entity")
        if "DamageEntity" in action_names or "TeleportEntity" in action_names or "SetEntityVelocity" in action_names or "SetEntityHealth" in action_names or "ApplyEntityPotionEffect" in action_names or "SetEntityOnFire" in action_names or "SetEntityCustomName" in action_names or "SetEntityEquipment" in action_names:
            imports.append("org.bukkit.event.entity.EntityEvent")
        if "SetBlockType" in action_names or "RemoveBlock" in action_names or "FillRegion" in action_names:
            imports.append("org.bukkit.event.block.BlockEvent")
            imports.append("org.bukkit.block.Block")
        if "GrantPermission" in action_names or "SetMetadata" in action_names:
            imports.append("org.bukkit.plugin.java.JavaPlugin")
            imports.append("org.bukkit.metadata.FixedMetadataValue")

        import_lines = "\n".join(f"import {imp};" for imp in sorted(set(imports)))

        # Generate action code
        action_code = self._generate_action_code(child_blocks, event_name)

        # Generate player variable line (or null check for entity events)
        if has_no_player:
            if "instanceof Player" in player_accessor:
                player_line = f"        Player player = {player_accessor};\n        if (player == null) return;\n"
            else:
                player_line = "        Player player = null;\n"
        else:
            player_line = f"        Player player = {player_accessor};\n"

        return f"""package {package}.listeners;

{import_lines}

public class EventListener{index} implements Listener {{

    @EventHandler
    public void on{event_name}({event_name} event) {{
{player_line}{action_code}    }}
}}
"""

    def _generate_action_code(self, blocks: List[Block], event_name: str = "") -> str:
        """Generate Java code for a list of action blocks."""
        lines: List[str] = []
        action_names = {b.name for b in blocks if b.type == BlockType.ACTION}
        player_required_actions = action_names & {
            "SendMessage",
            "BroadcastMessage",
            "SendConsoleMessage",
            "GiveItem",
            "RemoveItem",
            "SetItemInHand",
            "SetHealth",
            "SetHunger",
            "SetSaturation",
            "PlaySound",
            "TeleportPlayer",
            "AddExperience",
            "SetLevel",
            "SetExperienceLevel",
            "SendTitle",
            "ConsoleLog",
            "DropItem",
            "SetGameMode",
            "AddPotionEffect",
            "ApplyPotionEffect",
            "RemovePotionEffect",
            "SetVelocity",
            "SendActionBar",
            "SpawnParticle",
            "SpawnParticles",
            "KillPlayer",
            "DamagePlayer",
            "ClearInventory",
            "ExecuteCommand",
            "ExecuteCommandAsPlayer",
            "ExecuteConsoleCommand",
            "KickPlayer",
            "SetTime",
            "SetWeather",
            "SetThunder",
            "SpawnEntity",
            "StrikeLightning",
            "StrikeWithLightning",
            "CreateExplosion",
            "SetGlowing",
            "SetInvisible",
            "SetCustomName",
            "AllowFlight",
            "SetOnFire",
            "GrantPermission",
            "SetMetadata",
            "FillRegion",
        }

        needs_entity = bool(
            action_names
            & {
                "DamageEntity",
                "SetEntityHealth",
                "TeleportEntity",
                "SetEntityVelocity",
                "ApplyEntityPotionEffect",
                "SetEntityOnFire",
                "SetEntityCustomName",
                "SetEntityEquipment",
            }
        )
        needs_living = bool(
            action_names
            & {
                "SetEntityHealth",
                "ApplyEntityPotionEffect",
                "SetEntityOnFire",
                "SetEntityCustomName",
                "SetEntityEquipment",
            }
        )
        needs_block = bool(action_names & {"SetBlockType", "RemoveBlock", "FillRegion"})
        needs_plugin = bool(action_names & {"GrantPermission", "SetMetadata"})

        if needs_plugin:
            lines.append("        JavaPlugin plugin = JavaPlugin.getProvidingPlugin(getClass());")
        if player_required_actions:
            lines.append("        if (player == null) return;")
        if needs_entity:
            lines.append("        Entity targetEntity = null;")
            lines.append("        if (event instanceof EntityEvent) {")
            lines.append("            targetEntity = ((EntityEvent) event).getEntity();")
            lines.append("        } else if (player != null) {")
            lines.append("            targetEntity = player;")
            lines.append("        }")
        if needs_living:
            lines.append(
                "        LivingEntity living = (targetEntity instanceof LivingEntity) ? (LivingEntity) targetEntity : null;"
            )
        if needs_block:
            lines.append("        Block targetBlock = null;")
            lines.append("        if (event instanceof BlockEvent) {")
            lines.append("            targetBlock = ((BlockEvent) event).getBlock();")
            lines.append("        } else if (player != null) {")
            lines.append("            targetBlock = player.getLocation().getBlock();")
            lines.append("        }")

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
                elif block.name == "SendConsoleMessage":
                    msg = sanitize_java_string(props.get("message", ""))
                    if "%player%" in msg:
                        msg = msg.replace("%player%", '" + player.getName() + "')
                    lines.append(f'        Bukkit.getConsoleSender().sendMessage("{msg}");')
                elif block.name == "GiveItem":
                    item_type = sanitize_java_string(props.get("itemType", "DIAMOND")).upper()
                    amount = props.get("amount", "1")
                    lines.append(
                        f"        player.getInventory().addItem("
                        f"new ItemStack(Material.{item_type}, {amount}));"
                    )
                elif block.name == "RemoveItem":
                    item_type = sanitize_java_string(props.get("itemType", "DIAMOND")).upper()
                    amount = props.get("amount", "1")
                    lines.append(
                        f"        player.getInventory().removeItem("
                        f"new ItemStack(Material.{item_type}, {amount}));"
                    )
                elif block.name == "SetItemInHand":
                    item_type = sanitize_java_string(props.get("itemType", "DIAMOND")).upper()
                    hand = sanitize_java_string(props.get("hand", "MAIN_HAND")).upper()
                    if hand == "OFF_HAND":
                        lines.append(
                            f"        player.getInventory().setItemInOffHand("
                            f"new ItemStack(Material.{item_type}, 1));"
                        )
                    else:
                        lines.append(
                            f"        player.getInventory().setItemInMainHand("
                            f"new ItemStack(Material.{item_type}, 1));"
                        )
                elif block.name == "SetHealth":
                    health = props.get("health", "20.0")
                    lines.append(f"        player.setHealth({health});")
                elif block.name == "SetHunger":
                    hunger = props.get("hunger", "20")
                    lines.append(f"        player.setFoodLevel({hunger});")
                elif block.name == "SetSaturation":
                    saturation = props.get("saturation", "5.0")
                    lines.append(f"        player.setSaturation({saturation});")
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
                    world_name = sanitize_java_string(props.get("world", ""))
                    yaw = props.get("yaw", "0")
                    pitch = props.get("pitch", "0")
                    if world_name:
                        lines.append(
                            f'        if (Bukkit.getWorld("{world_name}") != null) {{'
                            f" player.teleport(new Location(Bukkit.getWorld(\"{world_name}\"), {x}, {y}, {z}, {yaw}f, {pitch}f)); }}"
                        )
                    else:
                        lines.append(
                            f"        player.teleport(new Location("
                            f"player.getWorld(), {x}, {y}, {z}, {yaw}f, {pitch}f));"
                        )
                elif block.name == "AddExperience":
                    amount = props.get("amount", "10")
                    lines.append(f"        player.giveExp({amount});")
                elif block.name == "SetLevel" or block.name == "SetExperienceLevel":
                    level = props.get("level", "10")
                    lines.append(f"        player.setLevel({level});")
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
                elif block.name == "SetGameMode":
                    game_mode = sanitize_java_string(props.get("gameMode", "SURVIVAL")).upper()
                    lines.append(f"        player.setGameMode(GameMode.{game_mode});")
                elif block.name == "AddPotionEffect" or block.name == "ApplyPotionEffect":
                    effect_type = sanitize_java_string(props.get("effectType", "SPEED")).upper()
                    duration = props.get("duration", "200")
                    amplifier = props.get("amplifier", "1")
                    lines.append(
                        f"        player.addPotionEffect(new PotionEffect("
                        f"PotionEffectType.{effect_type}, {duration}, {amplifier}));"
                    )
                elif block.name == "RemovePotionEffect":
                    effect_type = sanitize_java_string(props.get("effectType", "SPEED")).upper()
                    lines.append(f"        player.removePotionEffect(PotionEffectType.{effect_type});")
                elif block.name == "SetVelocity":
                    x = props.get("x", "0")
                    y = props.get("y", "1")
                    z = props.get("z", "0")
                    lines.append(f"        player.setVelocity(new Vector({x}, {y}, {z}));")
                elif block.name == "SendActionBar":
                    msg = sanitize_java_string(props.get("message", ""))
                    if "%player%" in msg:
                        msg = msg.replace("%player%", '" + player.getName() + "')
                    lines.append(f'        player.sendActionBar("{msg}");')
                elif block.name == "SpawnParticle" or block.name == "SpawnParticles":
                    particle = sanitize_java_string(props.get("particle", "HEART")).upper()
                    count = props.get("count", "10")
                    offset_x = props.get("offsetX", "0")
                    offset_y = props.get("offsetY", "0")
                    offset_z = props.get("offsetZ", "0")
                    speed = props.get("speed", "0")
                    lines.append(
                        f"        player.getWorld().spawnParticle(Particle.{particle}, "
                        f"player.getLocation(), {count}, {offset_x}, {offset_y}, {offset_z}, {speed});"
                    )
                elif block.name == "KillPlayer":
                    lines.append("        player.setHealth(0);")
                elif block.name == "DamagePlayer":
                    amount = props.get("amount", "5.0")
                    lines.append(f"        player.damage({amount});")
                elif block.name == "ClearInventory":
                    lines.append("        player.getInventory().clear();")
                elif block.name == "ExecuteCommand" or block.name == "ExecuteCommandAsPlayer":
                    command = sanitize_java_string(props.get("command", ""))
                    if "%player%" in command:
                        command = command.replace("%player%", '" + player.getName() + "')
                    lines.append(f'        player.performCommand("{command}");')
                elif block.name == "ExecuteConsoleCommand":
                    command = sanitize_java_string(props.get("command", ""))
                    if "%player%" in command:
                        command = command.replace("%player%", '" + player.getName() + "')
                    lines.append(
                        f'        Bukkit.dispatchCommand(Bukkit.getConsoleSender(), "{command}");'
                    )
                elif block.name == "KickPlayer":
                    reason = sanitize_java_string(props.get("reason", "You have been kicked!"))
                    lines.append(f'        player.kickPlayer("{reason}");')
                elif block.name == "SetTime":
                    time = props.get("time", "6000")
                    lines.append(f"        player.getWorld().setTime({time});")
                elif block.name == "SetWeather":
                    storm = props.get("storm", "false").lower()
                    duration = props.get("duration", "6000")
                    lines.append(f"        player.getWorld().setStorm({storm});")
                    lines.append(f"        player.getWorld().setWeatherDuration({duration});")
                elif block.name == "SetThunder":
                    thunder = props.get("thunder", "false").lower()
                    duration = props.get("duration", "6000")
                    lines.append(f"        player.getWorld().setThundering({thunder});")
                    lines.append(f"        player.getWorld().setThunderDuration({duration});")
                elif block.name == "SpawnEntity":
                    entity_type = sanitize_java_string(props.get("entityType", "ZOMBIE")).upper()
                    lines.append(
                        f"        player.getWorld().spawnEntity("
                        f"player.getLocation(), EntityType.{entity_type});"
                    )
                elif block.name == "StrikeLightning" or block.name == "StrikeWithLightning":
                    damage = props.get("damage", "true").lower()
                    if damage == "true":
                        lines.append("        player.getWorld().strikeLightning(player.getLocation());")
                    else:
                        lines.append("        player.getWorld().strikeLightningEffect(player.getLocation());")
                elif block.name == "CreateExplosion":
                    power = props.get("power", "4.0")
                    fire = props.get("fire", "false").lower()
                    break_blocks = props.get("breakBlocks", "false").lower()
                    lines.append(
                        f"        player.getWorld().createExplosion("
                        f"player.getLocation(), {power}f, {fire}, {break_blocks});"
                    )
                elif block.name == "SetBlockType":
                    block_type = sanitize_java_string(props.get("blockType", "STONE")).upper()
                    lines.append("        if (targetBlock != null) {")
                    lines.append(f"            targetBlock.setType(Material.{block_type});")
                    lines.append("        }")
                elif block.name == "RemoveBlock":
                    lines.append("        if (targetBlock != null) {")
                    lines.append("            targetBlock.breakNaturally();")
                    lines.append("        }")
                elif block.name == "FillRegion":
                    x1 = props.get("x1", "0")
                    y1 = props.get("y1", "64")
                    z1 = props.get("z1", "0")
                    x2 = props.get("x2", "10")
                    y2 = props.get("y2", "70")
                    z2 = props.get("z2", "10")
                    block_type = sanitize_java_string(props.get("blockType", "STONE")).upper()
                    lines.append(f"        for (int x = {x1}; x <= {x2}; x++) {{")
                    lines.append(f"            for (int y = {y1}; y <= {y2}; y++) {{")
                    lines.append(f"                for (int z = {z1}; z <= {z2}; z++) {{")
                    lines.append(
                        f"                    (targetBlock != null ? targetBlock.getWorld() : player.getWorld()).getBlockAt(x, y, z).setType(Material.{block_type});"
                    )
                    lines.append("                }")
                    lines.append("            }")
                    lines.append("        }")
                elif block.name == "SetGlowing":
                    glowing = props.get("glowing", "true").lower()
                    lines.append(f"        player.setGlowing({glowing});")
                elif block.name == "SetInvisible":
                    invisible = props.get("invisible", "true").lower()
                    lines.append(f"        player.setInvisible({invisible});")
                elif block.name == "SetCustomName":
                    name = sanitize_java_string(props.get("name", ""))
                    lines.append(f'        player.setCustomName("{name}");')
                    lines.append("        player.setCustomNameVisible(true);")
                elif block.name == "AllowFlight":
                    allow = props.get("allow", "true").lower()
                    start_flying = props.get("startFlying", "false").lower()
                    speed = props.get("speed", "0.2")
                    lines.append(f"        player.setAllowFlight({allow});")
                    lines.append(f"        player.setFlySpeed({speed}f);")
                    if start_flying == "true":
                        lines.append("        player.setFlying(true);")
                elif block.name == "SetOnFire":
                    ticks = props.get("ticks", "100")
                    lines.append(f"        player.setFireTicks({ticks});")
                elif block.name == "GrantPermission":
                    permission = sanitize_java_string(props.get("permission", ""))
                    value = props.get("value", "true").lower()
                    lines.append(f'        player.addAttachment(plugin, "{permission}", {value});')
                elif block.name == "SetMetadata":
                    key = sanitize_java_string(props.get("key", "key"))
                    value = sanitize_java_string(props.get("value", "value"))
                    lines.append(
                        f'        player.setMetadata("{key}", new FixedMetadataValue(plugin, "{value}"));'
                    )
                elif block.name == "DamageEntity":
                    amount = props.get("amount", "5.0")
                    lines.append("        if (targetEntity != null) {")
                    lines.append(f"            targetEntity.damage({amount});")
                    lines.append("        }")
                elif block.name == "SetEntityHealth":
                    health = props.get("health", "20.0")
                    lines.append("        if (living != null) {")
                    lines.append(f"            living.setHealth({health});")
                    lines.append("        }")
                elif block.name == "TeleportEntity":
                    x = props.get("x", "0")
                    y = props.get("y", "64")
                    z = props.get("z", "0")
                    world_name = sanitize_java_string(props.get("world", ""))
                    lines.append("        if (targetEntity != null) {")
                    if world_name:
                        lines.append(
                            f'            if (Bukkit.getWorld("{world_name}") != null) {{'
                            f" targetEntity.teleport(new Location(Bukkit.getWorld(\"{world_name}\"), {x}, {y}, {z})); }}"
                        )
                    else:
                        lines.append(
                            f"            targetEntity.teleport(new Location(targetEntity.getWorld(), {x}, {y}, {z}));"
                        )
                    lines.append("        }")
                elif block.name == "SetEntityVelocity":
                    x = props.get("x", "0")
                    y = props.get("y", "1")
                    z = props.get("z", "0")
                    lines.append("        if (targetEntity != null) {")
                    lines.append(f"            targetEntity.setVelocity(new Vector({x}, {y}, {z}));")
                    lines.append("        }")
                elif block.name == "ApplyEntityPotionEffect":
                    effect_type = sanitize_java_string(props.get("effectType", "SPEED")).upper()
                    duration = props.get("duration", "200")
                    amplifier = props.get("amplifier", "1")
                    lines.append("        if (living != null) {")
                    lines.append(
                        f"            living.addPotionEffect(new PotionEffect(PotionEffectType.{effect_type}, {duration}, {amplifier}));"
                    )
                    lines.append("        }")
                elif block.name == "SetEntityOnFire":
                    ticks = props.get("ticks", "100")
                    lines.append("        if (targetEntity != null) {")
                    lines.append(f"            targetEntity.setFireTicks({ticks});")
                    lines.append("        }")
                elif block.name == "SetEntityCustomName":
                    name = sanitize_java_string(props.get("name", ""))
                    lines.append("        if (living != null) {")
                    lines.append(f'            living.setCustomName("{name}");')
                    lines.append("            living.setCustomNameVisible(true);")
                    lines.append("        }")
                elif block.name == "SetEntityEquipment":
                    helmet = sanitize_java_string(props.get("helmet", "")).upper()
                    chestplate = sanitize_java_string(props.get("chestplate", "")).upper()
                    leggings = sanitize_java_string(props.get("leggings", "")).upper()
                    boots = sanitize_java_string(props.get("boots", "")).upper()
                    main_hand = sanitize_java_string(props.get("mainHand", "")).upper()
                    off_hand = sanitize_java_string(props.get("offHand", "")).upper()
                    lines.append("        if (living != null && living.getEquipment() != null) {")
                    if helmet:
                        lines.append(f"            living.getEquipment().setHelmet(new ItemStack(Material.{helmet}, 1));")
                    if chestplate:
                        lines.append(
                            f"            living.getEquipment().setChestplate(new ItemStack(Material.{chestplate}, 1));"
                        )
                    if leggings:
                        lines.append(
                            f"            living.getEquipment().setLeggings(new ItemStack(Material.{leggings}, 1));"
                        )
                    if boots:
                        lines.append(f"            living.getEquipment().setBoots(new ItemStack(Material.{boots}, 1));")
                    if main_hand:
                        lines.append(
                            f"            living.getEquipment().setItemInMainHand(new ItemStack(Material.{main_hand}, 1));"
                        )
                    if off_hand:
                        lines.append(
                            f"            living.getEquipment().setItemInOffHand(new ItemStack(Material.{off_hand}, 1));"
                        )
                    lines.append("        }")
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
