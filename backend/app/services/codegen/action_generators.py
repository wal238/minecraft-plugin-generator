"""Generate Java action code from block definitions.

This is the core action-dispatch module: ``generate_action_code`` takes a list
of ``Block`` objects and produces the Java statements that go inside an event
handler or command executor method body.
"""

from typing import List

from app.models.block import Block, BlockType
from app.utils.validators import sanitize_java_string

from .constants import WORLD_EVENT_NAMES
from .helpers import build_branch_if_expression, replace_arg_placeholders


def generate_action_code(blocks: List[Block], event_name: str = "") -> str:
    """Generate Java code for a list of action blocks."""
    lines: List[str] = []
    if_depth = 0
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
        "SetGlowing",
        "SetInvisible",
        "SetCustomName",
        "AllowFlight",
        "SetOnFire",
        "GrantPermission",
        "SetMetadata",
        "DelayAction",
        "RepeatAction",
        "SetCooldown",
        "CheckCooldown",
        "BranchIf",
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
            "SetTime",
            "SetWeather",
            "SetThunder",
            "SpawnEntity",
            "StrikeLightning",
            "StrikeWithLightning",
            "CreateExplosion",
            "SpawnParticle",
            "SpawnParticles",
            "FillRegion",
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
    needs_block = bool(
        action_names
        & {
            "SetBlockType",
            "RemoveBlock",
            "FillRegion",
            "SetTime",
            "SetWeather",
            "SetThunder",
            "SpawnEntity",
            "StrikeLightning",
            "StrikeWithLightning",
            "CreateExplosion",
            "SpawnParticle",
            "SpawnParticles",
        }
    )
    needs_plugin = bool(action_names & {"GrantPermission", "SetMetadata"})

    is_command = event_name == "CommandEvent"

    if needs_plugin:
        lines.append("        JavaPlugin plugin = JavaPlugin.getProvidingPlugin(getClass());")
    if player_required_actions and not is_command:
        lines.append("        if (player == null) return;")
    if needs_entity and not is_command:
        lines.append("        boolean hasEventEntity = event instanceof EntityEvent;")
        lines.append("        Entity targetEntity = null;")
        lines.append("        if (hasEventEntity) {")
        lines.append("            targetEntity = ((EntityEvent) event).getEntity();")
        lines.append("        } else if (player != null) {")
        lines.append("            targetEntity = player;")
        lines.append("        }")
    elif needs_entity and is_command:
        lines.append("        boolean hasEventEntity = true;")
        lines.append("        Entity targetEntity = player;")
    if needs_living and not is_command:
        lines.append(
            "        LivingEntity living = (targetEntity instanceof LivingEntity) ? (LivingEntity) targetEntity : null;"
        )
    elif needs_living and is_command:
        lines.append("        LivingEntity living = player;")
    if needs_block and not is_command:
        lines.append("        boolean hasEventBlock = event instanceof BlockEvent;")
        lines.append("        Block targetBlock = null;")
        lines.append("        if (hasEventBlock) {")
        lines.append("            targetBlock = ((BlockEvent) event).getBlock();")
        lines.append("        } else if (player != null) {")
        lines.append("            targetBlock = player.getLocation().getBlock();")
        lines.append("        }")
    elif needs_block and is_command:
        lines.append("        boolean hasEventBlock = true;")
        lines.append("        Block targetBlock = player.getLocation().getBlock();")

    for block in blocks:
        if block.type == BlockType.ACTION:
            props = block.properties
            if block.name == "SendMessage":
                _gen_send_message(lines, props, is_command)
            elif block.name == "BroadcastMessage":
                _gen_broadcast_message(lines, props, is_command)
            elif block.name == "SendConsoleMessage":
                _gen_send_console_message(lines, props, is_command)
            elif block.name == "GiveItem":
                _gen_give_item(lines, props)
            elif block.name == "RemoveItem":
                _gen_remove_item(lines, props)
            elif block.name == "SetItemInHand":
                _gen_set_item_in_hand(lines, props)
            elif block.name == "SetHealth":
                lines.append(f"        player.setHealth({props.get('health', '20.0')});")
            elif block.name == "SetHunger":
                lines.append(f"        player.setFoodLevel({props.get('hunger', '20')});")
            elif block.name == "SetSaturation":
                lines.append(f"        player.setSaturation({props.get('saturation', '5.0')});")
            elif block.name == "CancelEvent":
                if not is_command:
                    lines.append("        event.setCancelled(true);")
            elif block.name == "PlaySound":
                _gen_play_sound(lines, props)
            elif block.name == "TeleportPlayer":
                _gen_teleport_player(lines, props)
            elif block.name == "AddExperience":
                lines.append(f"        player.giveExp({props.get('amount', '10')});")
            elif block.name == "SetLevel" or block.name == "SetExperienceLevel":
                lines.append(f"        player.setLevel({props.get('level', '10')});")
            elif block.name == "SendTitle":
                _gen_send_title(lines, props)
            elif block.name == "ConsoleLog":
                _gen_console_log(lines, props, is_command)
            elif block.name == "DropItem":
                _gen_drop_item(lines, props)
            elif block.name == "SetGameMode":
                game_mode = sanitize_java_string(props.get("gameMode", "SURVIVAL")).upper()
                lines.append(f"        player.setGameMode(GameMode.{game_mode});")
            elif block.name == "AddPotionEffect" or block.name == "ApplyPotionEffect":
                _gen_add_potion_effect(lines, props)
            elif block.name == "RemovePotionEffect":
                effect_type = sanitize_java_string(props.get("effectType", "SPEED")).upper()
                lines.append(f"        player.removePotionEffect(PotionEffectType.{effect_type});")
            elif block.name == "SetVelocity":
                _gen_set_velocity(lines, props)
            elif block.name == "SendActionBar":
                _gen_send_action_bar(lines, props, is_command)
            elif block.name == "SpawnParticle" or block.name == "SpawnParticles":
                _gen_spawn_particle(lines, props, event_name, is_command)
            elif block.name == "KillPlayer":
                lines.append("        player.setHealth(0);")
            elif block.name == "DamagePlayer":
                lines.append(f"        player.damage({props.get('amount', '5.0')});")
            elif block.name == "ClearInventory":
                lines.append("        player.getInventory().clear();")
            elif block.name == "ExecuteCommand" or block.name == "ExecuteCommandAsPlayer":
                _gen_execute_command(lines, props, is_command)
            elif block.name == "ExecuteConsoleCommand":
                _gen_execute_console_command(lines, props, is_command)
            elif block.name == "KickPlayer":
                reason = sanitize_java_string(props.get("reason", "You have been kicked!"))
                lines.append(f'        player.kickPlayer("{reason}");')
            elif block.name == "SetTime":
                _gen_set_time(lines, props, event_name, is_command)
            elif block.name == "SetWeather":
                _gen_set_weather(lines, props, event_name, is_command)
            elif block.name == "SetThunder":
                _gen_set_thunder(lines, props, event_name, is_command)
            elif block.name == "SpawnEntity":
                _gen_spawn_entity(lines, props, event_name, is_command)
            elif block.name == "StrikeLightning" or block.name == "StrikeWithLightning":
                _gen_strike_lightning(lines, props, event_name, is_command)
            elif block.name == "CreateExplosion":
                _gen_create_explosion(lines, props, event_name, is_command)
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
                _gen_fill_region(lines, props, event_name, is_command)
            elif block.name == "SetGlowing":
                lines.append(f"        player.setGlowing({props.get('glowing', 'true').lower()});")
            elif block.name == "SetInvisible":
                lines.append(f"        player.setInvisible({props.get('invisible', 'true').lower()});")
            elif block.name == "SetCustomName":
                name = sanitize_java_string(props.get("name", ""))
                lines.append(f'        player.setCustomName("{name}");')
                lines.append("        player.setCustomNameVisible(true);")
            elif block.name == "AllowFlight":
                _gen_allow_flight(lines, props)
            elif block.name == "SetOnFire":
                lines.append(f"        player.setFireTicks({props.get('ticks', '100')});")
            elif block.name == "GrantPermission":
                _gen_grant_permission(lines, props)
            elif block.name == "SetMetadata":
                _gen_set_metadata(lines, props)
            elif block.name == "DamageEntity":
                _gen_damage_entity(lines, props)
            elif block.name == "SetEntityHealth":
                _gen_set_entity_health(lines, props)
            elif block.name == "TeleportEntity":
                _gen_teleport_entity(lines, props)
            elif block.name == "SetEntityVelocity":
                _gen_set_entity_velocity(lines, props)
            elif block.name == "ApplyEntityPotionEffect":
                _gen_apply_entity_potion_effect(lines, props)
            elif block.name == "SetEntityOnFire":
                _gen_set_entity_on_fire(lines, props)
            elif block.name == "SetEntityCustomName":
                _gen_set_entity_custom_name(lines, props)
            elif block.name == "SetEntityEquipment":
                _gen_set_entity_equipment(lines, props)
            elif block.name == "DelayAction":
                _gen_delay_action(lines, blocks, block, event_name)
                break  # remaining blocks are inside the runnable
            elif block.name == "RepeatAction":
                _gen_repeat_action(lines, blocks, block, event_name)
                break
            elif block.name == "SetCooldown":
                _gen_set_cooldown(lines, props)
            elif block.name == "CheckCooldown":
                _gen_check_cooldown(lines, props)
            # Condition blocks (guard clauses)
            elif block.name == "HasPermission":
                perm = sanitize_java_string(props.get("permission", ""))
                if perm:
                    lines.append(f'        if (player == null || !player.hasPermission("{perm}")) return;')
            elif block.name == "HasItem":
                item_type = sanitize_java_string(props.get("itemType", "DIAMOND")).upper()
                amount = props.get("amount", "1")
                lines.append(f'        if (player == null || !player.getInventory().contains(Material.{item_type}, {amount})) return;')
            elif block.name == "HealthAbove":
                lines.append(f'        if (player == null || player.getHealth() <= {props.get("health", "10")}) return;')
            elif block.name == "HealthBelow":
                lines.append(f'        if (player == null || player.getHealth() >= {props.get("health", "5")}) return;')
            elif block.name == "GameModeEquals":
                game_mode = sanitize_java_string(props.get("gameMode", "SURVIVAL")).upper()
                lines.append(f'        if (player == null || player.getGameMode() != org.bukkit.GameMode.{game_mode}) return;')
            elif block.name == "IsInWorld":
                world = sanitize_java_string(props.get("world", "world"))
                lines.append(f'        if (player == null || !player.getWorld().getName().equals("{world}")) return;')
            elif block.name == "IsSneaking":
                lines.append('        if (player == null || !player.isSneaking()) return;')
            elif block.name == "IsFlying":
                lines.append('        if (player == null || !player.isFlying()) return;')
            elif block.name == "IsOp":
                lines.append('        if (player == null || !player.isOp()) return;')
            elif block.name == "HungerAbove":
                lines.append(f'        if (player == null || player.getFoodLevel() <= {props.get("hunger", "10")}) return;')
            elif block.name == "HungerBelow":
                lines.append(f'        if (player == null || player.getFoodLevel() >= {props.get("hunger", "5")}) return;')
            elif block.name == "LevelAbove":
                lines.append(f'        if (player == null || player.getLevel() <= {props.get("level", "10")}) return;')
            elif block.name == "BranchIf":
                expression = build_branch_if_expression(props)
                lines.append(f"        if ({expression}) {{")
                if_depth += 1
            elif block.name == "BranchElse":
                if if_depth > 0:
                    lines.append("        } else {")
            elif block.name == "BranchEndIf":
                if if_depth > 0:
                    lines.append("        }")
                    if_depth -= 1
            elif block.name in {"StringArg", "PlayerArg", "IntegerArg"}:
                continue
        elif block.type == BlockType.CUSTOM_CONDITION:
            code = block.custom_code or "true"
            lines.append(f"        if ({code}) {{")
            lines.append("            // Custom condition body")
            lines.append("        }")
        elif block.type == BlockType.CUSTOM_ACTION:
            code = block.custom_code or "// custom action"
            for line in code.split("\n"):
                lines.append(f"        {line}")

    while if_depth > 0:
        lines.append("        }")
        if_depth -= 1
    return "\n".join(lines) + "\n" if lines else ""


# ---------------------------------------------------------------------------
# Per-action helper functions
# ---------------------------------------------------------------------------

def _gen_send_message(lines: List[str], props: dict, is_command: bool) -> None:
    msg = sanitize_java_string(props.get("message", "Hello!"))
    if "%player%" in msg:
        msg = msg.replace("%player%", '" + player.getName() + "')
    msg = replace_arg_placeholders(msg, is_command)
    lines.append(f'        player.sendMessage("{msg}");')


def _gen_broadcast_message(lines: List[str], props: dict, is_command: bool) -> None:
    msg = sanitize_java_string(props.get("message", ""))
    if "%player%" in msg:
        msg = msg.replace("%player%", '" + player.getName() + "')
    msg = replace_arg_placeholders(msg, is_command)
    lines.append(f'        Bukkit.broadcastMessage("{msg}");')


def _gen_send_console_message(lines: List[str], props: dict, is_command: bool) -> None:
    msg = sanitize_java_string(props.get("message", ""))
    if "%player%" in msg:
        msg = msg.replace("%player%", '" + player.getName() + "')
    msg = replace_arg_placeholders(msg, is_command)
    lines.append(f'        Bukkit.getConsoleSender().sendMessage("{msg}");')


def _gen_give_item(lines: List[str], props: dict) -> None:
    item_type = sanitize_java_string(props.get("itemType", "DIAMOND")).upper()
    amount = props.get("amount", "1")
    display_name = props.get("displayName", "")
    lore = props.get("lore", "")
    enchantments = props.get("enchantments", "")
    item_flags = props.get("itemFlags", "")

    has_meta = display_name or lore or enchantments or item_flags

    if has_meta:
        lines.append(f"        ItemStack customItem = new ItemStack(Material.{item_type}, {amount});")
        lines.append(f"        ItemMeta meta = customItem.getItemMeta();")
        lines.append(f"        if (meta != null) {{")

        if display_name:
            safe_name = sanitize_java_string(display_name)
            lines.append(f'            meta.setDisplayName(org.bukkit.ChatColor.translateAlternateColorCodes(\'&\', "{safe_name}"));')

        if lore:
            lore_lines = [sanitize_java_string(l.strip()) for l in lore.split("|") if l.strip()]
            if lore_lines:
                lore_java = ", ".join(
                    f'org.bukkit.ChatColor.translateAlternateColorCodes(\'&\', "{l}")'
                    for l in lore_lines
                )
                lines.append(f"            meta.setLore(java.util.Arrays.asList({lore_java}));")

        if enchantments:
            for ench_str in enchantments.split(","):
                ench_str = ench_str.strip()
                if ":" in ench_str:
                    ench_name, level = ench_str.split(":", 1)
                    ench_name = sanitize_java_string(ench_name.strip()).upper()
                    level = level.strip()
                    lines.append(f"            meta.addEnchant(org.bukkit.enchantments.Enchantment.{ench_name}, {level}, true);")

        if item_flags:
            for flag in item_flags.split(","):
                flag = sanitize_java_string(flag.strip()).upper()
                if flag:
                    lines.append(f"            meta.addItemFlags(org.bukkit.inventory.ItemFlag.{flag});")

        lines.append(f"            customItem.setItemMeta(meta);")
        lines.append(f"        }}")
        lines.append(f"        player.getInventory().addItem(customItem);")
    else:
        lines.append(
            f"        player.getInventory().addItem("
            f"new ItemStack(Material.{item_type}, {amount}));"
        )


def _gen_remove_item(lines: List[str], props: dict) -> None:
    item_type = sanitize_java_string(props.get("itemType", "DIAMOND")).upper()
    amount = props.get("amount", "1")
    lines.append(
        f"        player.getInventory().removeItem("
        f"new ItemStack(Material.{item_type}, {amount}));"
    )


def _gen_set_item_in_hand(lines: List[str], props: dict) -> None:
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


def _gen_play_sound(lines: List[str], props: dict) -> None:
    sound = sanitize_java_string(props.get("sound", "ENTITY_EXPERIENCE_ORB_PICKUP"))
    volume = props.get("volume", "1.0")
    pitch = props.get("pitch", "1.0")
    lines.append(
        f"        player.playSound(player.getLocation(), "
        f"Sound.{sound}, {volume}f, {pitch}f);"
    )


def _gen_teleport_player(lines: List[str], props: dict) -> None:
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


def _gen_send_title(lines: List[str], props: dict) -> None:
    title = sanitize_java_string(props.get("title", ""))
    subtitle = sanitize_java_string(props.get("subtitle", ""))
    fade_in = props.get("fadeIn", "10")
    stay = props.get("stay", "70")
    fade_out = props.get("fadeOut", "20")
    lines.append(
        f'        player.sendTitle("{title}", "{subtitle}", '
        f"{fade_in}, {stay}, {fade_out});"
    )


def _gen_console_log(lines: List[str], props: dict, is_command: bool) -> None:
    msg = sanitize_java_string(props.get("message", ""))
    if "%player%" in msg:
        msg = msg.replace("%player%", '" + player.getName() + "')
    msg = replace_arg_placeholders(msg, is_command)
    lines.append(f'        Bukkit.getLogger().info("{msg}");')


def _gen_drop_item(lines: List[str], props: dict) -> None:
    item_type = sanitize_java_string(props.get("itemType", "DIAMOND")).upper()
    amount = props.get("amount", "1")
    lines.append(
        f"        player.getWorld().dropItemNaturally("
        f"player.getLocation(), new ItemStack(Material.{item_type}, {amount}));"
    )


def _gen_add_potion_effect(lines: List[str], props: dict) -> None:
    effect_type = sanitize_java_string(props.get("effectType", "SPEED")).upper()
    duration = props.get("duration", "200")
    amplifier = props.get("amplifier", "1")
    lines.append(
        f"        player.addPotionEffect(new PotionEffect("
        f"PotionEffectType.{effect_type}, {duration}, {amplifier}));"
    )


def _gen_set_velocity(lines: List[str], props: dict) -> None:
    x = props.get("x", "0")
    y = props.get("y", "1")
    z = props.get("z", "0")
    lines.append(f"        player.setVelocity(new Vector({x}, {y}, {z}));")


def _gen_send_action_bar(lines: List[str], props: dict, is_command: bool) -> None:
    msg = sanitize_java_string(props.get("message", ""))
    if "%player%" in msg:
        msg = msg.replace("%player%", '" + player.getName() + "')
    msg = replace_arg_placeholders(msg, is_command)
    lines.append(f'        player.sendActionBar("{msg}");')


def _gen_spawn_particle(lines: List[str], props: dict, event_name: str, is_command: bool) -> None:
    particle = sanitize_java_string(props.get("particle", "HEART")).upper()
    count = props.get("count", "10")
    offset_x = props.get("offsetX", "0")
    offset_y = props.get("offsetY", "0")
    offset_z = props.get("offsetZ", "0")
    speed = props.get("speed", "0")
    target = sanitize_java_string(props.get("target", "auto")).lower()
    if target == "player":
        lines.append("        if (player != null) {")
        lines.append(
            f"            player.getWorld().spawnParticle(Particle.{particle}, "
            f"player.getLocation(), {count}, {offset_x}, {offset_y}, {offset_z}, {speed});"
        )
        lines.append("        }")
    elif target == "event_entity":
        lines.append("        if (hasEventEntity && targetEntity != null) {")
        lines.append(
            f"            targetEntity.getWorld().spawnParticle(Particle.{particle}, "
            f"targetEntity.getLocation(), {count}, {offset_x}, {offset_y}, {offset_z}, {speed});"
        )
        lines.append("        }")
    elif target == "event_block":
        lines.append("        if (hasEventBlock && targetBlock != null) {")
        lines.append(
            f"            targetBlock.getWorld().spawnParticle(Particle.{particle}, "
            f"targetBlock.getLocation(), {count}, {offset_x}, {offset_y}, {offset_z}, {speed});"
        )
        lines.append("        }")
    elif target == "event_world":
        if event_name in WORLD_EVENT_NAMES:
            lines.append(
                f"        event.getWorld().spawnParticle(Particle.{particle}, "
                f"event.getWorld().getSpawnLocation(), {count}, {offset_x}, {offset_y}, {offset_z}, {speed});"
            )
        else:
            lines.append("        if (hasEventBlock && targetBlock != null) {")
            lines.append(
                f"            targetBlock.getWorld().spawnParticle(Particle.{particle}, "
                f"targetBlock.getWorld().getSpawnLocation(), {count}, {offset_x}, {offset_y}, {offset_z}, {speed});"
            )
            lines.append("        } else if (hasEventEntity && targetEntity != null) {")
            lines.append(
                f"            targetEntity.getWorld().spawnParticle(Particle.{particle}, "
                f"targetEntity.getWorld().getSpawnLocation(), {count}, {offset_x}, {offset_y}, {offset_z}, {speed});"
            )
            lines.append("        } else if (player != null) {")
            lines.append(
                f"            player.getWorld().spawnParticle(Particle.{particle}, "
                f"player.getWorld().getSpawnLocation(), {count}, {offset_x}, {offset_y}, {offset_z}, {speed});"
            )
            lines.append("        }")
    else:
        lines.append("        if (hasEventEntity && targetEntity != null) {")
        lines.append(
            f"            targetEntity.getWorld().spawnParticle(Particle.{particle}, "
            f"targetEntity.getLocation(), {count}, {offset_x}, {offset_y}, {offset_z}, {speed});"
        )
        lines.append("        } else if (hasEventBlock && targetBlock != null) {")
        lines.append(
            f"            targetBlock.getWorld().spawnParticle(Particle.{particle}, "
            f"targetBlock.getLocation(), {count}, {offset_x}, {offset_y}, {offset_z}, {speed});"
        )
        lines.append("        } else if (player != null) {")
        lines.append(
            f"            player.getWorld().spawnParticle(Particle.{particle}, "
            f"player.getLocation(), {count}, {offset_x}, {offset_y}, {offset_z}, {speed});"
        )
        lines.append("        }")
        if event_name in WORLD_EVENT_NAMES:
            lines.append("        else {")
            lines.append(
                f"            event.getWorld().spawnParticle(Particle.{particle}, "
                f"event.getWorld().getSpawnLocation(), {count}, {offset_x}, {offset_y}, {offset_z}, {speed});"
            )
            lines.append("        }")


def _gen_execute_command(lines: List[str], props: dict, is_command: bool) -> None:
    command = sanitize_java_string(props.get("command", ""))
    if "%player%" in command:
        command = command.replace("%player%", '" + player.getName() + "')
    command = replace_arg_placeholders(command, is_command)
    lines.append(f'        player.performCommand("{command}");')


def _gen_execute_console_command(lines: List[str], props: dict, is_command: bool) -> None:
    command = sanitize_java_string(props.get("command", ""))
    if "%player%" in command:
        command = command.replace("%player%", '" + player.getName() + "')
    command = replace_arg_placeholders(command, is_command)
    lines.append(
        f'        Bukkit.dispatchCommand(Bukkit.getConsoleSender(), "{command}");'
    )


def _gen_set_time(lines: List[str], props: dict, event_name: str, is_command: bool) -> None:
    time = props.get("time", "6000")
    target = sanitize_java_string(props.get("target", "auto")).lower()
    if target == "player":
        lines.append("        if (player != null) {")
        lines.append(f"            player.getWorld().setTime({time});")
        lines.append("        }")
    elif target == "event_entity":
        lines.append("        if (hasEventEntity && targetEntity != null) {")
        lines.append(f"            targetEntity.getWorld().setTime({time});")
        lines.append("        }")
    elif target == "event_block":
        lines.append("        if (hasEventBlock && targetBlock != null) {")
        lines.append(f"            targetBlock.getWorld().setTime({time});")
        lines.append("        }")
    elif target == "event_world":
        if event_name in WORLD_EVENT_NAMES:
            lines.append(f"        event.getWorld().setTime({time});")
        else:
            lines.append("        if (hasEventBlock && targetBlock != null) {")
            lines.append(f"            targetBlock.getWorld().setTime({time});")
            lines.append("        } else if (hasEventEntity && targetEntity != null) {")
            lines.append(f"            targetEntity.getWorld().setTime({time});")
            lines.append("        } else if (player != null) {")
            lines.append(f"            player.getWorld().setTime({time});")
            lines.append("        }")
    else:
        if event_name in WORLD_EVENT_NAMES:
            lines.append(f"        event.getWorld().setTime({time});")
        else:
            lines.append("        if (hasEventEntity && targetEntity != null) {")
            lines.append(f"            targetEntity.getWorld().setTime({time});")
            lines.append("        } else if (hasEventBlock && targetBlock != null) {")
            lines.append(f"            targetBlock.getWorld().setTime({time});")
            lines.append("        } else if (player != null) {")
            lines.append(f"            player.getWorld().setTime({time});")
            lines.append("        }")


def _gen_set_weather(lines: List[str], props: dict, event_name: str, is_command: bool) -> None:
    storm = props.get("storm", "false").lower()
    duration = props.get("duration", "6000")
    target = sanitize_java_string(props.get("target", "auto")).lower()
    if target == "player":
        lines.append("        if (player != null) {")
        lines.append(f"            player.getWorld().setStorm({storm});")
        lines.append(f"            player.getWorld().setWeatherDuration({duration});")
        lines.append("        }")
    elif target == "event_entity":
        lines.append("        if (hasEventEntity && targetEntity != null) {")
        lines.append(f"            targetEntity.getWorld().setStorm({storm});")
        lines.append(f"            targetEntity.getWorld().setWeatherDuration({duration});")
        lines.append("        }")
    elif target == "event_block":
        lines.append("        if (hasEventBlock && targetBlock != null) {")
        lines.append(f"            targetBlock.getWorld().setStorm({storm});")
        lines.append(f"            targetBlock.getWorld().setWeatherDuration({duration});")
        lines.append("        }")
    elif target == "event_world":
        if event_name in WORLD_EVENT_NAMES:
            lines.append(f"        event.getWorld().setStorm({storm});")
            lines.append(f"        event.getWorld().setWeatherDuration({duration});")
        else:
            lines.append("        if (hasEventBlock && targetBlock != null) {")
            lines.append(f"            targetBlock.getWorld().setStorm({storm});")
            lines.append(f"            targetBlock.getWorld().setWeatherDuration({duration});")
            lines.append("        } else if (hasEventEntity && targetEntity != null) {")
            lines.append(f"            targetEntity.getWorld().setStorm({storm});")
            lines.append(f"            targetEntity.getWorld().setWeatherDuration({duration});")
            lines.append("        } else if (player != null) {")
            lines.append(f"            player.getWorld().setStorm({storm});")
            lines.append(f"            player.getWorld().setWeatherDuration({duration});")
            lines.append("        }")
    else:
        if event_name in WORLD_EVENT_NAMES:
            lines.append(f"        event.getWorld().setStorm({storm});")
            lines.append(f"        event.getWorld().setWeatherDuration({duration});")
        else:
            lines.append("        if (hasEventEntity && targetEntity != null) {")
            lines.append(f"            targetEntity.getWorld().setStorm({storm});")
            lines.append(f"            targetEntity.getWorld().setWeatherDuration({duration});")
            lines.append("        } else if (hasEventBlock && targetBlock != null) {")
            lines.append(f"            targetBlock.getWorld().setStorm({storm});")
            lines.append(f"            targetBlock.getWorld().setWeatherDuration({duration});")
            lines.append("        } else if (player != null) {")
            lines.append(f"            player.getWorld().setStorm({storm});")
            lines.append(f"            player.getWorld().setWeatherDuration({duration});")
            lines.append("        }")


def _gen_set_thunder(lines: List[str], props: dict, event_name: str, is_command: bool) -> None:
    thunder = props.get("thunder", "false").lower()
    duration = props.get("duration", "6000")
    target = sanitize_java_string(props.get("target", "auto")).lower()
    if target == "player":
        lines.append("        if (player != null) {")
        lines.append(f"            player.getWorld().setThundering({thunder});")
        lines.append(f"            player.getWorld().setThunderDuration({duration});")
        lines.append("        }")
    elif target == "event_entity":
        lines.append("        if (hasEventEntity && targetEntity != null) {")
        lines.append(f"            targetEntity.getWorld().setThundering({thunder});")
        lines.append(f"            targetEntity.getWorld().setThunderDuration({duration});")
        lines.append("        }")
    elif target == "event_block":
        lines.append("        if (hasEventBlock && targetBlock != null) {")
        lines.append(f"            targetBlock.getWorld().setThundering({thunder});")
        lines.append(f"            targetBlock.getWorld().setThunderDuration({duration});")
        lines.append("        }")
    elif target == "event_world":
        if event_name in WORLD_EVENT_NAMES:
            lines.append(f"        event.getWorld().setThundering({thunder});")
            lines.append(f"        event.getWorld().setThunderDuration({duration});")
        else:
            lines.append("        if (hasEventBlock && targetBlock != null) {")
            lines.append(f"            targetBlock.getWorld().setThundering({thunder});")
            lines.append(f"            targetBlock.getWorld().setThunderDuration({duration});")
            lines.append("        } else if (hasEventEntity && targetEntity != null) {")
            lines.append(f"            targetEntity.getWorld().setThundering({thunder});")
            lines.append(f"            targetEntity.getWorld().setThunderDuration({duration});")
            lines.append("        } else if (player != null) {")
            lines.append(f"            player.getWorld().setThundering({thunder});")
            lines.append(f"            player.getWorld().setThunderDuration({duration});")
            lines.append("        }")
    else:
        if event_name in WORLD_EVENT_NAMES:
            lines.append(f"        event.getWorld().setThundering({thunder});")
            lines.append(f"        event.getWorld().setThunderDuration({duration});")
        else:
            lines.append("        if (hasEventEntity && targetEntity != null) {")
            lines.append(f"            targetEntity.getWorld().setThundering({thunder});")
            lines.append(f"            targetEntity.getWorld().setThunderDuration({duration});")
            lines.append("        } else if (hasEventBlock && targetBlock != null) {")
            lines.append(f"            targetBlock.getWorld().setThundering({thunder});")
            lines.append(f"            targetBlock.getWorld().setThunderDuration({duration});")
            lines.append("        } else if (player != null) {")
            lines.append(f"            player.getWorld().setThundering({thunder});")
            lines.append(f"            player.getWorld().setThunderDuration({duration});")
            lines.append("        }")


def _gen_spawn_entity(lines: List[str], props: dict, event_name: str, is_command: bool) -> None:
    entity_type = sanitize_java_string(props.get("entityType", "ZOMBIE")).upper()
    target = sanitize_java_string(props.get("target", "auto")).lower()
    if target == "player":
        lines.append("        if (player != null) {")
        lines.append(
            f"            player.getWorld().spawnEntity(player.getLocation(), EntityType.{entity_type});"
        )
        lines.append("        }")
    elif target == "event_entity":
        lines.append("        if (hasEventEntity && targetEntity != null) {")
        lines.append(
            f"            targetEntity.getWorld().spawnEntity(targetEntity.getLocation(), EntityType.{entity_type});"
        )
        lines.append("        }")
    elif target == "event_block":
        lines.append("        if (hasEventBlock && targetBlock != null) {")
        lines.append(
            f"            targetBlock.getWorld().spawnEntity(targetBlock.getLocation(), EntityType.{entity_type});"
        )
        lines.append("        }")
    elif target == "event_world":
        if event_name in WORLD_EVENT_NAMES:
            lines.append(
                f"        event.getWorld().spawnEntity(event.getWorld().getSpawnLocation(), EntityType.{entity_type});"
            )
        else:
            lines.append("        if (hasEventBlock && targetBlock != null) {")
            lines.append(
                f"            targetBlock.getWorld().spawnEntity(targetBlock.getWorld().getSpawnLocation(), EntityType.{entity_type});"
            )
            lines.append("        } else if (hasEventEntity && targetEntity != null) {")
            lines.append(
                f"            targetEntity.getWorld().spawnEntity(targetEntity.getWorld().getSpawnLocation(), EntityType.{entity_type});"
            )
            lines.append("        } else if (player != null) {")
            lines.append(
                f"            player.getWorld().spawnEntity(player.getWorld().getSpawnLocation(), EntityType.{entity_type});"
            )
            lines.append("        }")
    else:
        lines.append("        if (hasEventEntity && targetEntity != null) {")
        lines.append(
            f"            targetEntity.getWorld().spawnEntity(targetEntity.getLocation(), EntityType.{entity_type});"
        )
        lines.append("        } else if (hasEventBlock && targetBlock != null) {")
        lines.append(
            f"            targetBlock.getWorld().spawnEntity(targetBlock.getLocation(), EntityType.{entity_type});"
        )
        lines.append("        } else if (player != null) {")
        lines.append(
            f"            player.getWorld().spawnEntity(player.getLocation(), EntityType.{entity_type});"
        )
        lines.append("        }")
        if event_name in WORLD_EVENT_NAMES:
            lines.append("        else {")
            lines.append(
                f"            event.getWorld().spawnEntity(event.getWorld().getSpawnLocation(), EntityType.{entity_type});"
            )
            lines.append("        }")


def _gen_strike_lightning(lines: List[str], props: dict, event_name: str, is_command: bool) -> None:
    damage = props.get("damage", "true").lower()
    target = sanitize_java_string(props.get("target", "auto")).lower()
    lightning_call = "strikeLightning" if damage == "true" else "strikeLightningEffect"
    if target == "player":
        lines.append("        if (player != null) {")
        lines.append(f"            player.getWorld().{lightning_call}(player.getLocation());")
        lines.append("        }")
    elif target == "event_entity":
        lines.append("        if (hasEventEntity && targetEntity != null) {")
        lines.append(f"            targetEntity.getWorld().{lightning_call}(targetEntity.getLocation());")
        lines.append("        }")
    elif target == "event_block":
        lines.append("        if (hasEventBlock && targetBlock != null) {")
        lines.append(f"            targetBlock.getWorld().{lightning_call}(targetBlock.getLocation());")
        lines.append("        }")
    elif target == "event_world":
        if event_name in WORLD_EVENT_NAMES:
            lines.append(f"        event.getWorld().{lightning_call}(event.getWorld().getSpawnLocation());")
        else:
            lines.append("        if (hasEventBlock && targetBlock != null) {")
            lines.append(
                f"            targetBlock.getWorld().{lightning_call}(targetBlock.getWorld().getSpawnLocation());"
            )
            lines.append("        } else if (hasEventEntity && targetEntity != null) {")
            lines.append(
                f"            targetEntity.getWorld().{lightning_call}(targetEntity.getWorld().getSpawnLocation());"
            )
            lines.append("        } else if (player != null) {")
            lines.append(
                f"            player.getWorld().{lightning_call}(player.getWorld().getSpawnLocation());"
            )
            lines.append("        }")
    else:
        lines.append("        if (hasEventEntity && targetEntity != null) {")
        lines.append(f"            targetEntity.getWorld().{lightning_call}(targetEntity.getLocation());")
        lines.append("        } else if (hasEventBlock && targetBlock != null) {")
        lines.append(f"            targetBlock.getWorld().{lightning_call}(targetBlock.getLocation());")
        lines.append("        } else if (player != null) {")
        lines.append(f"            player.getWorld().{lightning_call}(player.getLocation());")
        lines.append("        }")
        if event_name in WORLD_EVENT_NAMES:
            lines.append("        else {")
            lines.append(f"            event.getWorld().{lightning_call}(event.getWorld().getSpawnLocation());")
            lines.append("        }")


def _gen_create_explosion(lines: List[str], props: dict, event_name: str, is_command: bool) -> None:
    power = props.get("power", "4.0")
    fire = props.get("fire", "false").lower()
    break_blocks = props.get("breakBlocks", "false").lower()
    target = sanitize_java_string(props.get("target", "auto")).lower()
    if target == "player":
        lines.append("        if (player != null) {")
        lines.append(
            f"            player.getWorld().createExplosion(player.getLocation(), {power}f, {fire}, {break_blocks});"
        )
        lines.append("        }")
    elif target == "event_entity":
        lines.append("        if (hasEventEntity && targetEntity != null) {")
        lines.append(
            f"            targetEntity.getWorld().createExplosion(targetEntity.getLocation(), {power}f, {fire}, {break_blocks});"
        )
        lines.append("        }")
    elif target == "event_block":
        lines.append("        if (hasEventBlock && targetBlock != null) {")
        lines.append(
            f"            targetBlock.getWorld().createExplosion(targetBlock.getLocation(), {power}f, {fire}, {break_blocks});"
        )
        lines.append("        }")
    elif target == "event_world":
        if event_name in WORLD_EVENT_NAMES:
            lines.append(
                f"        event.getWorld().createExplosion(event.getWorld().getSpawnLocation(), {power}f, {fire}, {break_blocks});"
            )
        else:
            lines.append("        if (hasEventBlock && targetBlock != null) {")
            lines.append(
                f"            targetBlock.getWorld().createExplosion(targetBlock.getWorld().getSpawnLocation(), {power}f, {fire}, {break_blocks});"
            )
            lines.append("        } else if (hasEventEntity && targetEntity != null) {")
            lines.append(
                f"            targetEntity.getWorld().createExplosion(targetEntity.getWorld().getSpawnLocation(), {power}f, {fire}, {break_blocks});"
            )
            lines.append("        } else if (player != null) {")
            lines.append(
                f"            player.getWorld().createExplosion(player.getWorld().getSpawnLocation(), {power}f, {fire}, {break_blocks});"
            )
            lines.append("        }")
    else:
        lines.append("        if (hasEventEntity && targetEntity != null) {")
        lines.append(
            f"            targetEntity.getWorld().createExplosion(targetEntity.getLocation(), {power}f, {fire}, {break_blocks});"
        )
        lines.append("        } else if (hasEventBlock && targetBlock != null) {")
        lines.append(
            f"            targetBlock.getWorld().createExplosion(targetBlock.getLocation(), {power}f, {fire}, {break_blocks});"
        )
        lines.append("        } else if (player != null) {")
        lines.append(
            f"            player.getWorld().createExplosion(player.getLocation(), {power}f, {fire}, {break_blocks});"
        )
        lines.append("        }")
        if event_name in WORLD_EVENT_NAMES:
            lines.append("        else {")
            lines.append(
                f"            event.getWorld().createExplosion(event.getWorld().getSpawnLocation(), {power}f, {fire}, {break_blocks});"
            )
            lines.append("        }")


def _gen_fill_region(lines: List[str], props: dict, event_name: str, is_command: bool) -> None:
    x1 = props.get("x1", "0")
    y1 = props.get("y1", "64")
    z1 = props.get("z1", "0")
    x2 = props.get("x2", "10")
    y2 = props.get("y2", "70")
    z2 = props.get("z2", "10")
    block_type = sanitize_java_string(props.get("blockType", "STONE")).upper()
    target = sanitize_java_string(props.get("target", "auto")).lower()
    world_expr = "null"
    world_guard = ""
    if target == "player":
        world_expr = "player.getWorld()"
        world_guard = "player != null"
    elif target == "event_entity":
        world_expr = "targetEntity.getWorld()"
        world_guard = "hasEventEntity && targetEntity != null"
    elif target == "event_block":
        world_expr = "targetBlock.getWorld()"
        world_guard = "hasEventBlock && targetBlock != null"
    elif target == "event_world":
        if event_name in WORLD_EVENT_NAMES:
            world_expr = "event.getWorld()"
            world_guard = "true"
        else:
            world_expr = "(hasEventBlock && targetBlock != null) ? targetBlock.getWorld() : (hasEventEntity && targetEntity != null) ? targetEntity.getWorld() : (player != null ? player.getWorld() : null)"
            world_guard = f"({world_expr}) != null"
    else:
        if event_name in WORLD_EVENT_NAMES:
            world_expr = "event.getWorld()"
            world_guard = "true"
        else:
            world_expr = "(hasEventEntity && targetEntity != null) ? targetEntity.getWorld() : (hasEventBlock && targetBlock != null) ? targetBlock.getWorld() : (player != null ? player.getWorld() : null)"
            world_guard = f"({world_expr}) != null"

    lines.append(f"        if ({world_guard}) {{")
    lines.append(f"            for (int x = {x1}; x <= {x2}; x++) {{")
    lines.append(f"                for (int y = {y1}; y <= {y2}; y++) {{")
    lines.append(f"                    for (int z = {z1}; z <= {z2}; z++) {{")
    lines.append(
        f"                        {world_expr}.getBlockAt(x, y, z).setType(Material.{block_type});"
    )
    lines.append("                    }")
    lines.append("                }")
    lines.append("            }")
    lines.append("        }")


def _gen_allow_flight(lines: List[str], props: dict) -> None:
    allow = props.get("allow", "true").lower()
    start_flying = props.get("startFlying", "false").lower()
    speed = props.get("speed", "0.2")
    lines.append(f"        player.setAllowFlight({allow});")
    lines.append(f"        player.setFlySpeed({speed}f);")
    if start_flying == "true":
        lines.append("        player.setFlying(true);")


def _gen_grant_permission(lines: List[str], props: dict) -> None:
    permission = sanitize_java_string(props.get("permission", ""))
    value = props.get("value", "true").lower()
    lines.append(f'        player.addAttachment(plugin, "{permission}", {value});')


def _gen_set_metadata(lines: List[str], props: dict) -> None:
    key = sanitize_java_string(props.get("key", "key"))
    value = sanitize_java_string(props.get("value", "value"))
    lines.append(
        f'        player.setMetadata("{key}", new FixedMetadataValue(plugin, "{value}"));'
    )


def _gen_damage_entity(lines: List[str], props: dict) -> None:
    amount = props.get("amount", "5.0")
    lines.append("        if (targetEntity != null) {")
    lines.append(f"            targetEntity.damage({amount});")
    lines.append("        }")


def _gen_set_entity_health(lines: List[str], props: dict) -> None:
    health = props.get("health", "20.0")
    lines.append("        if (living != null) {")
    lines.append(f"            living.setHealth({health});")
    lines.append("        }")


def _gen_teleport_entity(lines: List[str], props: dict) -> None:
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


def _gen_set_entity_velocity(lines: List[str], props: dict) -> None:
    x = props.get("x", "0")
    y = props.get("y", "1")
    z = props.get("z", "0")
    lines.append("        if (targetEntity != null) {")
    lines.append(f"            targetEntity.setVelocity(new Vector({x}, {y}, {z}));")
    lines.append("        }")


def _gen_apply_entity_potion_effect(lines: List[str], props: dict) -> None:
    effect_type = sanitize_java_string(props.get("effectType", "SPEED")).upper()
    duration = props.get("duration", "200")
    amplifier = props.get("amplifier", "1")
    lines.append("        if (living != null) {")
    lines.append(
        f"            living.addPotionEffect(new PotionEffect(PotionEffectType.{effect_type}, {duration}, {amplifier}));"
    )
    lines.append("        }")


def _gen_set_entity_on_fire(lines: List[str], props: dict) -> None:
    ticks = props.get("ticks", "100")
    lines.append("        if (targetEntity != null) {")
    lines.append(f"            targetEntity.setFireTicks({ticks});")
    lines.append("        }")


def _gen_set_entity_custom_name(lines: List[str], props: dict) -> None:
    name = sanitize_java_string(props.get("name", ""))
    lines.append("        if (living != null) {")
    lines.append(f'            living.setCustomName("{name}");')
    lines.append("            living.setCustomNameVisible(true);")
    lines.append("        }")


def _gen_set_entity_equipment(lines: List[str], props: dict) -> None:
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


def _gen_delay_action(lines: List[str], blocks: List[Block], block: Block, event_name: str) -> None:
    delay_ticks = block.properties.get("delayTicks", "20")
    remaining_idx = blocks.index(block) + 1
    remaining_blocks = blocks[remaining_idx:]
    if remaining_blocks:
        inner_code = generate_action_code(remaining_blocks, event_name)
        indented = "\n".join(
            "    " + line if line.strip() else line
            for line in inner_code.rstrip("\n").split("\n")
        )
        lines.append("        new BukkitRunnable() {")
        lines.append("            @Override")
        lines.append("            public void run() {")
        lines.append(indented)
        lines.append("            }")
        lines.append(f"        }}.runTaskLater(JavaPlugin.getProvidingPlugin(this.getClass()), {delay_ticks});")


def _gen_repeat_action(lines: List[str], blocks: List[Block], block: Block, event_name: str) -> None:
    interval_ticks = block.properties.get("intervalTicks", "20")
    repeat_count = block.properties.get("repeatCount", "0")
    remaining_idx = blocks.index(block) + 1
    remaining_blocks = blocks[remaining_idx:]
    if remaining_blocks:
        inner_code = generate_action_code(remaining_blocks, event_name)
        indented = "\n".join(
            "    " + line if line.strip() else line
            for line in inner_code.rstrip("\n").split("\n")
        )
        lines.append("        new BukkitRunnable() {")
        use_count = repeat_count and repeat_count != "0"
        if use_count:
            lines.append(f"            int count = 0;")
        lines.append("            @Override")
        lines.append("            public void run() {")
        if use_count:
            lines.append(f"                if (count >= {repeat_count}) {{ this.cancel(); return; }}")
            lines.append("                count++;")
        lines.append(indented)
        lines.append("            }")
        lines.append(f"        }}.runTaskTimer(JavaPlugin.getProvidingPlugin(this.getClass()), 0, {interval_ticks});")


def _gen_set_cooldown(lines: List[str], props: dict) -> None:
    cd_name = sanitize_java_string(props.get("cooldownName", "default"))
    duration = props.get("duration", "5")
    lines.append(f'        CooldownManager.setCooldown("{cd_name}", player.getUniqueId(), {duration} * 1000L);')


def _gen_check_cooldown(lines: List[str], props: dict) -> None:
    cd_name = sanitize_java_string(props.get("cooldownName", "default"))
    cd_message = props.get("cooldownMessage", "")
    lines.append(f'        if (CooldownManager.isOnCooldown("{cd_name}", player.getUniqueId())) {{')
    if cd_message:
        safe_msg = sanitize_java_string(cd_message)
        if "%remaining%" in safe_msg:
            safe_msg = safe_msg.replace("%remaining%", '" + CooldownManager.getRemainingSeconds("' + cd_name + '", player.getUniqueId()) + "')
        lines.append(f'            player.sendMessage("{safe_msg}");')
    lines.append(f'            return;')
    lines.append(f'        }}')
