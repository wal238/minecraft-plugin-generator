"""Generate Java listener and command executor classes."""

from typing import Dict, List, Tuple

from app.models.block import Block, BlockType
from app.models.plugin_config import PluginConfig
from app.utils.validators import sanitize_java_string

from .action_generators import generate_action_code
from .constants import EVENT_CLASS_NAMES, EVENT_IMPORTS, EVENT_PLAYER_ACCESSOR, EVENTS_WITHOUT_PLAYER
from .helpers import safe_java_identifier, to_bool


def generate_main_plugin(config: PluginConfig) -> str:
    """Generate the main plugin class extending JavaPlugin."""
    package = config.main_package
    class_name = config.main_class_name
    version = sanitize_java_string(config.version)

    # Collect listener registrations (exclude CommandEvent blocks)
    event_blocks = [
        b for b in config.blocks
        if b.type == BlockType.EVENT and b.name != "CommandEvent"
    ]
    listener_registrations = ""
    for i, _ in enumerate(event_blocks):
        listener_registrations += (
            f"        getServer().getPluginManager().registerEvents("
            f"new {package}.listeners.EventListener{i}(), this);\n"
        )

    # Collect command registrations
    command_blocks = [
        b for b in config.blocks
        if b.type == BlockType.EVENT and b.name == "CommandEvent"
    ]
    command_registrations = ""
    for cmd_block in command_blocks:
        cmd_name = cmd_block.properties.get("commandName", "").lower().strip()
        if not cmd_name:
            continue
        cmd_class_name = "Command" + "".join(
            part.capitalize() for part in cmd_name.replace("-", "_").split("_")
        )
        executor_var = f"{cmd_class_name[0].lower()}{cmd_class_name[1:]}Executor"
        command_registrations += (
            f'        if (getCommand("{cmd_name}") != null) {{\n'
            f"            {package}.commands.{cmd_class_name} {executor_var} = "
            f"new {package}.commands.{cmd_class_name}();\n"
            f'            getCommand("{cmd_name}").setExecutor({executor_var});\n'
            f'            getCommand("{cmd_name}").setTabCompleter({executor_var});\n'
            f"        }}\n"
        )

    return f"""package {package};

import org.bukkit.plugin.java.JavaPlugin;

public class {class_name} extends JavaPlugin {{

    @Override
    public void onEnable() {{
        getLogger().info("{class_name} v{version} enabled!");

        // Register listeners
{listener_registrations}
        // Register commands
{command_registrations}    }}

    @Override
    public void onDisable() {{
        getLogger().info("{class_name} disabled!");
    }}
}}
"""


def generate_listeners(config: PluginConfig) -> Dict[str, str]:
    """Generate event listener classes. Returns {filename: java_code}.
    CommandEvent blocks are excluded -- they produce command classes instead."""
    listeners: Dict[str, str] = {}
    blocks_by_id = {b.id: b for b in config.blocks}
    event_blocks = [
        b for b in config.blocks
        if b.type == BlockType.EVENT and b.name != "CommandEvent"
    ]

    for i, event_block in enumerate(event_blocks):
        child_blocks = [
            blocks_by_id[cid]
            for cid in event_block.children
            if cid in blocks_by_id
        ]
        code = generate_listener_class(
            config.main_package, i, event_block, child_blocks
        )
        listeners[f"EventListener{i}.java"] = code

    return listeners


def generate_listener_class(
    package: str,
    index: int,
    event_block: Block,
    child_blocks: List[Block],
) -> str:
    """Generate a single event listener class."""
    event_name = event_block.name
    event_java_name = EVENT_CLASS_NAMES.get(event_name, event_name)
    event_import = EVENT_IMPORTS.get(event_name, f"org.bukkit.event.{event_java_name}")
    player_accessor = EVENT_PLAYER_ACCESSOR.get(event_name, "event.getPlayer()")
    has_no_player = event_name in EVENTS_WITHOUT_PLAYER

    # Build imports
    imports = [
        "org.bukkit.event.Listener",
        "org.bukkit.event.EventHandler",
        event_import,
    ]

    imports.append("org.bukkit.entity.Player")

    action_names = {b.name for b in child_blocks if b.type == BlockType.ACTION}
    has_custom = any(b.type in (BlockType.CUSTOM_ACTION, BlockType.CUSTOM_CONDITION) for b in child_blocks)

    needs_material = bool(action_names & {"GiveItem", "DropItem", "RemoveItem", "SetItemInHand", "SetBlockType", "FillRegion", "SetEntityEquipment", "HasItem"})
    if needs_material:
        imports.append("org.bukkit.Material")
        imports.append("org.bukkit.inventory.ItemStack")
    give_item_blocks = [b for b in child_blocks if b.name == "GiveItem"]
    needs_item_meta = any(
        b.properties.get("displayName") or b.properties.get("lore") or
        b.properties.get("enchantments") or b.properties.get("itemFlags")
        for b in give_item_blocks
    )
    if needs_item_meta:
        imports.append("org.bukkit.inventory.meta.ItemMeta")
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
    if "SetGameMode" in action_names or "GameModeEquals" in action_names:
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
    needs_scheduler = bool(action_names & {"DelayAction", "RepeatAction"})
    if needs_scheduler:
        imports.append("org.bukkit.scheduler.BukkitRunnable")
        imports.append("org.bukkit.plugin.java.JavaPlugin")
    if action_names & {"SetCooldown", "CheckCooldown", "BranchIf"}:
        imports.append(f"{package}.util.CooldownManager")
    if action_names & {"CreateGUI", "AddGUIItem", "OpenGUI"}:
        imports.append("org.bukkit.Bukkit")
        imports.append("org.bukkit.inventory.Inventory")
    if "AddGUIItem" in action_names:
        imports.append("org.bukkit.inventory.meta.ItemMeta")
        imports.append("org.bukkit.Material")
        imports.append("org.bukkit.inventory.ItemStack")
    if action_names & {"CreateBossBar", "RemoveBossBar"}:
        imports.append("org.bukkit.Bukkit")
        imports.append("org.bukkit.NamespacedKey")
        imports.append("org.bukkit.boss.KeyedBossBar")
        imports.append("org.bukkit.boss.BarColor")
        imports.append("org.bukkit.boss.BarStyle")
    if action_names & {"SetScoreboard", "RemoveScoreboard"}:
        imports.append("org.bukkit.Bukkit")
        imports.append("org.bukkit.scoreboard.Scoreboard")
        imports.append("org.bukkit.scoreboard.Objective")
        imports.append("org.bukkit.scoreboard.DisplaySlot")
    if action_names & {"SaveConfig", "SendConfigValue"}:
        imports.append("org.bukkit.plugin.java.JavaPlugin")
    if "AddShapelessRecipe" in action_names:
        imports.append("org.bukkit.Bukkit")
        imports.append("org.bukkit.NamespacedKey")
        imports.append("org.bukkit.inventory.ShapelessRecipe")
        imports.append("org.bukkit.Material")
        imports.append("org.bukkit.inventory.ItemStack")
        imports.append("org.bukkit.plugin.java.JavaPlugin")

    import_lines = "\n".join(f"import {imp};" for imp in sorted(set(imports)))

    # Generate action code
    action_code = generate_action_code(child_blocks, event_name)
    event_prelude = _generate_event_prelude(event_block)

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
    public void on{event_name}({event_java_name} event) {{
{player_line}{event_prelude}{action_code}    }}
}}
"""


def _generate_event_prelude(event_block: Block) -> str:
    """Generate event-specific guard/prelude code before actions."""
    if event_block.name != "OnGUIClick":
        return ""

    props = event_block.properties or {}
    lines: List[str] = [
        "        if (event.getClickedInventory() == null) return;",
        "        if (event.getClickedInventory() != event.getView().getTopInventory()) return;",
    ]

    gui_title = sanitize_java_string(str(props.get("guiTitle", "")).strip())
    if gui_title:
        lines.append(f'        if (!event.getView().getTitle().equals("{gui_title}")) return;')

    slot_raw = str(props.get("slot", "")).strip()
    try:
        slot = int(slot_raw) if slot_raw else -1
    except ValueError:
        slot = -1
    if slot >= 0:
        lines.append(f"        if (event.getRawSlot() != {slot}) return;")

    if to_bool(props.get("cancelEvent", True), True):
        lines.append("        event.setCancelled(true);")

    return "\n".join(lines) + "\n"


def generate_commands(config: PluginConfig) -> Dict[str, str]:
    """Generate command executor classes. Returns {filename: java_code}."""
    commands: Dict[str, str] = {}
    blocks_by_id = {b.id: b for b in config.blocks}
    command_blocks = [
        b for b in config.blocks
        if b.type == BlockType.EVENT and b.name == "CommandEvent"
    ]

    for i, cmd_block in enumerate(command_blocks):
        cmd_name_raw = cmd_block.properties.get("commandName", "").strip()
        if not cmd_name_raw:
            continue
        child_blocks = [
            blocks_by_id[cid]
            for cid in cmd_block.children
            if cid in blocks_by_id
        ]
        code, class_name, cmd_name = generate_command_class(
            config.main_package, cmd_block, child_blocks, i
        )
        commands[f"{class_name}.java"] = code

    return commands


def generate_command_class(
    package: str,
    cmd_block: Block,
    child_blocks: List[Block],
    index: int,
) -> tuple:
    """Generate a single command executor class.

    Returns:
        (java_code, class_name, command_name)
    """
    props = cmd_block.properties
    cmd_name = props.get("commandName", "").lower().strip() or "mycommand"

    class_name = "Command" + "".join(
        part.capitalize() for part in cmd_name.replace("-", "_").split("_")
    )

    arg_blocks, runtime_blocks = split_command_blocks(child_blocks)
    arg_prelude = generate_command_arg_prelude(arg_blocks)
    action_code = generate_action_code(runtime_blocks, "CommandEvent")

    # Build imports
    tab_completions_raw = props.get("commandTabCompletions", "")
    tab_completions = [
        sanitize_java_string(option.strip())
        for option in str(tab_completions_raw).split(",")
        if option.strip()
    ]

    imports = [
        "org.bukkit.command.Command",
        "org.bukkit.command.CommandExecutor",
        "org.bukkit.command.CommandSender",
        "org.bukkit.command.TabCompleter",
        "org.bukkit.entity.Player",
        "java.util.Collections",
        "java.util.List",
    ]
    if tab_completions:
        imports.append("java.util.ArrayList")
        imports.append("java.util.Arrays")

    action_names = {b.name for b in runtime_blocks if b.type == BlockType.ACTION}
    has_custom = any(
        b.type in (BlockType.CUSTOM_ACTION, BlockType.CUSTOM_CONDITION)
        for b in runtime_blocks
    )

    needs_material = bool(
        action_names
        & {
            "GiveItem", "DropItem", "RemoveItem", "SetItemInHand",
            "SetBlockType", "FillRegion", "SetEntityEquipment", "HasItem",
        }
    )
    if needs_material:
        imports.append("org.bukkit.Material")
        imports.append("org.bukkit.inventory.ItemStack")
    give_item_blocks = [b for b in runtime_blocks if b.name == "GiveItem"]
    needs_item_meta = any(
        b.properties.get("displayName") or b.properties.get("lore") or
        b.properties.get("enchantments") or b.properties.get("itemFlags")
        for b in give_item_blocks
    )
    if needs_item_meta:
        imports.append("org.bukkit.inventory.meta.ItemMeta")
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
    if any(b.name == "PlayerArg" for b in arg_blocks):
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
    if "SetGameMode" in action_names or "GameModeEquals" in action_names:
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
    if "GrantPermission" in action_names or "SetMetadata" in action_names:
        imports.append("org.bukkit.plugin.java.JavaPlugin")
        imports.append("org.bukkit.metadata.FixedMetadataValue")
    needs_scheduler = bool(action_names & {"DelayAction", "RepeatAction"})
    if needs_scheduler:
        imports.append("org.bukkit.scheduler.BukkitRunnable")
        imports.append("org.bukkit.plugin.java.JavaPlugin")
    needs_entity = bool(action_names & {
        "DamageEntity", "SetEntityHealth", "TeleportEntity", "SetEntityVelocity",
        "ApplyEntityPotionEffect", "SetEntityOnFire", "SetEntityCustomName",
        "SetEntityEquipment", "SetTime", "SetWeather", "SetThunder",
        "SpawnEntity", "StrikeLightning", "StrikeWithLightning",
        "CreateExplosion", "SpawnParticle", "SpawnParticles", "FillRegion",
    })
    needs_living = bool(action_names & {
        "SetEntityHealth", "ApplyEntityPotionEffect", "SetEntityOnFire",
        "SetEntityCustomName", "SetEntityEquipment",
    })
    needs_block = bool(action_names & {
        "SetBlockType", "RemoveBlock", "FillRegion", "SetTime", "SetWeather",
        "SetThunder", "SpawnEntity", "StrikeLightning", "StrikeWithLightning",
        "CreateExplosion", "SpawnParticle", "SpawnParticles",
    })
    if needs_entity:
        imports.append("org.bukkit.entity.Entity")
    if needs_living:
        imports.append("org.bukkit.entity.LivingEntity")
    if needs_block:
        imports.append("org.bukkit.block.Block")
    if action_names & {"SetCooldown", "CheckCooldown", "BranchIf"}:
        imports.append(f"{package}.util.CooldownManager")
    if action_names & {"CreateGUI", "AddGUIItem", "OpenGUI"}:
        imports.append("org.bukkit.Bukkit")
        imports.append("org.bukkit.inventory.Inventory")
    if "AddGUIItem" in action_names:
        imports.append("org.bukkit.inventory.meta.ItemMeta")
        imports.append("org.bukkit.Material")
        imports.append("org.bukkit.inventory.ItemStack")
    if action_names & {"CreateBossBar", "RemoveBossBar"}:
        imports.append("org.bukkit.Bukkit")
        imports.append("org.bukkit.NamespacedKey")
        imports.append("org.bukkit.boss.KeyedBossBar")
        imports.append("org.bukkit.boss.BarColor")
        imports.append("org.bukkit.boss.BarStyle")
    if action_names & {"SetScoreboard", "RemoveScoreboard"}:
        imports.append("org.bukkit.Bukkit")
        imports.append("org.bukkit.scoreboard.Scoreboard")
        imports.append("org.bukkit.scoreboard.Objective")
        imports.append("org.bukkit.scoreboard.DisplaySlot")
    if action_names & {"SaveConfig", "SendConfigValue"}:
        imports.append("org.bukkit.plugin.java.JavaPlugin")
    if "AddShapelessRecipe" in action_names:
        imports.append("org.bukkit.Bukkit")
        imports.append("org.bukkit.NamespacedKey")
        imports.append("org.bukkit.inventory.ShapelessRecipe")
        imports.append("org.bukkit.Material")
        imports.append("org.bukkit.inventory.ItemStack")
        imports.append("org.bukkit.plugin.java.JavaPlugin")

    import_lines = "\n".join(f"import {imp};" for imp in sorted(set(imports)))

    tab_completions_code = ""
    if tab_completions:
        values = ", ".join(f'"{value}"' for value in tab_completions)
        tab_completions_code = f"""

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {{
        if (args.length > 1) {{
            return Collections.emptyList();
        }}
        List<String> suggestions = Arrays.asList({values});
        String input = args.length == 0 ? "" : args[0].toLowerCase();
        List<String> matches = new ArrayList<>();
        for (String option : suggestions) {{
            if (option.toLowerCase().startsWith(input)) {{
                matches.add(option);
            }}
        }}
        return matches;
    }}
"""
    else:
        tab_completions_code = """

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        return Collections.emptyList();
    }
"""

    code = f"""package {package}.commands;

{import_lines}

public class {class_name} implements CommandExecutor, TabCompleter {{

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {{
        if (!(sender instanceof Player)) {{
            sender.sendMessage("This command can only be used by players.");
            return true;
        }}
        Player player = (Player) sender;

{arg_prelude}{action_code}
        return true;
    }}
{tab_completions_code}
}}
"""
    return code, class_name, cmd_name


def split_command_blocks(blocks: List[Block]) -> Tuple[List[Block], List[Block]]:
    """Split command child blocks into arg declarations and runtime actions."""
    arg_names = {"StringArg", "PlayerArg", "IntegerArg"}
    arg_blocks: List[Block] = []
    runtime_blocks: List[Block] = []
    for block in blocks:
        if block.type == BlockType.ACTION and block.name in arg_names:
            arg_blocks.append(block)
        else:
            runtime_blocks.append(block)
    return arg_blocks, runtime_blocks


def generate_command_arg_prelude(arg_blocks: List[Block]) -> str:
    """Generate Java argument parsing/validation code for typed command args."""
    if not arg_blocks:
        return ""

    lines: List[str] = []
    for index, block in enumerate(arg_blocks):
        props = block.properties
        arg_name = safe_java_identifier(
            sanitize_java_string(str(props.get("argName", f"arg{index}"))),
            f"arg{index}",
        )
        required = to_bool(props.get("required", True), True)
        required_literal = "required" if required else "optional"

        if block.name == "StringArg":
            default_value = sanitize_java_string(str(props.get("defaultValue", "")))
            lines.append(f"        // {required_literal} string argument {index}: {arg_name}")
            if required:
                lines.append(f"        if (args.length <= {index}) {{")
                lines.append(f'            player.sendMessage("Missing required argument: {arg_name}");')
                lines.append("            return true;")
                lines.append("        }")
                lines.append(f"        String {arg_name} = args[{index}];")
            else:
                lines.append(
                    f'        String {arg_name} = args.length > {index} ? args[{index}] : "{default_value}";'
                )
        elif block.name == "IntegerArg":
            default_raw = str(props.get("defaultValue", "0")).strip() or "0"
            min_raw = str(props.get("min", "")).strip()
            max_raw = str(props.get("max", "")).strip()

            lines.append(f"        // {required_literal} integer argument {index}: {arg_name}")
            if required:
                lines.append(f"        if (args.length <= {index}) {{")
                lines.append(f'            player.sendMessage("Missing required integer argument: {arg_name}");')
                lines.append("            return true;")
                lines.append("        }")
                lines.append(f"        int {arg_name};")
                lines.append("        try {")
                lines.append(f"            {arg_name} = Integer.parseInt(args[{index}]);")
                lines.append("        } catch (NumberFormatException ex) {")
                lines.append(f'            player.sendMessage("Argument {arg_name} must be an integer.");')
                lines.append("            return true;")
                lines.append("        }")
            else:
                lines.append(f"        int {arg_name} = {default_raw};")
                lines.append(f"        if (args.length > {index}) {{")
                lines.append("            try {")
                lines.append(f"                {arg_name} = Integer.parseInt(args[{index}]);")
                lines.append("            } catch (NumberFormatException ex) {")
                lines.append(f'                player.sendMessage("Argument {arg_name} must be an integer.");')
                lines.append("                return true;")
                lines.append("            }")
                lines.append("        }")

            if min_raw:
                lines.append(f"        if ({arg_name} < {min_raw}) {{")
                lines.append(f'            player.sendMessage("Argument {arg_name} must be >= {min_raw}.");')
                lines.append("            return true;")
                lines.append("        }")
            if max_raw:
                lines.append(f"        if ({arg_name} > {max_raw}) {{")
                lines.append(f'            player.sendMessage("Argument {arg_name} must be <= {max_raw}.");')
                lines.append("            return true;")
                lines.append("        }")
        elif block.name == "PlayerArg":
            lines.append(f"        // {required_literal} player argument {index}: {arg_name}")
            lines.append(f"        Player {arg_name} = null;")
            if required:
                lines.append(f"        if (args.length <= {index}) {{")
                lines.append(f'            player.sendMessage("Missing required player argument: {arg_name}");')
                lines.append("            return true;")
                lines.append("        }")
                lines.append(f"        {arg_name} = Bukkit.getPlayerExact(args[{index}]);")
                lines.append(f"        if ({arg_name} == null) {{")
                lines.append(f'            player.sendMessage("Player not found: " + args[{index}]);')
                lines.append("            return true;")
                lines.append("        }")
            else:
                lines.append(f"        if (args.length > {index}) {{")
                lines.append(f"            {arg_name} = Bukkit.getPlayerExact(args[{index}]);")
                lines.append(f"            if ({arg_name} == null) {{")
                lines.append(f'                player.sendMessage("Player not found: " + args[{index}]);')
                lines.append("                return true;")
                lines.append("            }")
                lines.append("        }")

    return "\n".join(lines) + "\n\n"
