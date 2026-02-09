"""Tests for the code generator service."""

import pytest
from app.models.block import Block, BlockType
from app.models.plugin_config import PluginConfig
from app.services.code_generator import CodeGeneratorService


@pytest.fixture
def generator():
    """Create a CodeGeneratorService instance."""
    return CodeGeneratorService()


@pytest.fixture
def base_config():
    """Create a base plugin config for testing."""
    return {
        "name": "TestPlugin",
        "version": "1.0.0",
        "main_package": "com.example.testplugin",
        "description": "A test plugin",
        "author": "TestAuthor",
    }


class TestSendMessageAction:
    """Test SendMessage action code generation."""

    def test_basic_send_message(self, generator, base_config):
        """Test basic SendMessage generates correct Java code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="SendMessage",
                    properties={"message": "Hello World!"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert 'player.sendMessage("Hello World!");' in listener_code

    def test_send_message_with_player_placeholder(self, generator, base_config):
        """Test SendMessage with %player% placeholder."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="SendMessage",
                    properties={"message": "Welcome %player%!"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert 'player.sendMessage("Welcome " + player.getName() + "!");' in listener_code

    def test_send_message_escapes_quotes(self, generator, base_config):
        """Test SendMessage properly escapes double quotes."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="SendMessage",
                    properties={"message": 'Say "Hello"'},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert r'player.sendMessage("Say \"Hello\"");' in listener_code


class TestBroadcastMessageAction:
    """Test BroadcastMessage action code generation."""

    def test_basic_broadcast(self, generator, base_config):
        """Test basic BroadcastMessage generates correct Java code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="BroadcastMessage",
                    properties={"message": "Server announcement!"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert 'Bukkit.broadcastMessage("Server announcement!");' in listener_code
        assert "import org.bukkit.Bukkit;" in listener_code

    def test_broadcast_with_player_placeholder(self, generator, base_config):
        """Test BroadcastMessage with %player% placeholder."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="BroadcastMessage",
                    properties={"message": "%player% joined the game!"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert 'Bukkit.broadcastMessage("" + player.getName() + " joined the game!");' in listener_code


class TestGiveItemAction:
    """Test GiveItem action code generation."""

    def test_basic_give_item(self, generator, base_config):
        """Test basic GiveItem generates correct Java code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="GiveItem",
                    properties={"itemType": "DIAMOND", "amount": "5"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "player.getInventory().addItem(new ItemStack(Material.DIAMOND, 5));" in listener_code
        assert "import org.bukkit.Material;" in listener_code
        assert "import org.bukkit.inventory.ItemStack;" in listener_code

    def test_give_item_default_amount(self, generator, base_config):
        """Test GiveItem uses default amount of 1 when not specified."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="GiveItem",
                    properties={"itemType": "IRON_SWORD"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "player.getInventory().addItem(new ItemStack(Material.IRON_SWORD, 1));" in listener_code

    def test_give_item_lowercase_converts_to_uppercase(self, generator, base_config):
        """Test GiveItem converts item type to uppercase."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="GiveItem",
                    properties={"itemType": "diamond_pickaxe", "amount": "1"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "Material.DIAMOND_PICKAXE" in listener_code


class TestSetHealthAction:
    """Test SetHealth action code generation."""

    def test_set_health(self, generator, base_config):
        """Test SetHealth generates correct Java code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="SetHealth",
                    properties={"health": "20.0"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "player.setHealth(20.0);" in listener_code


class TestSetHungerAction:
    """Test SetHunger action code generation."""

    def test_set_hunger(self, generator, base_config):
        """Test SetHunger generates correct Java code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="SetHunger",
                    properties={"hunger": "15"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "player.setFoodLevel(15);" in listener_code


class TestCancelEventAction:
    """Test CancelEvent action code generation."""

    def test_cancel_event(self, generator, base_config):
        """Test CancelEvent generates correct Java code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="BlockBreakEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="CancelEvent",
                    properties={},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "event.setCancelled(true);" in listener_code


class TestPlaySoundAction:
    """Test PlaySound action code generation."""

    def test_play_sound_with_all_params(self, generator, base_config):
        """Test PlaySound generates correct Java code with all parameters."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="PlaySound",
                    properties={"sound": "ENTITY_PLAYER_LEVELUP", "volume": "0.5", "pitch": "1.2"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "player.playSound(player.getLocation(), Sound.ENTITY_PLAYER_LEVELUP, 0.5f, 1.2f);" in listener_code
        assert "import org.bukkit.Sound;" in listener_code

    def test_play_sound_default_params(self, generator, base_config):
        """Test PlaySound uses default volume and pitch."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="PlaySound",
                    properties={"sound": "BLOCK_NOTE_BLOCK_PLING"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "Sound.BLOCK_NOTE_BLOCK_PLING, 1.0f, 1.0f" in listener_code


class TestTeleportPlayerAction:
    """Test TeleportPlayer action code generation."""

    def test_teleport_player(self, generator, base_config):
        """Test TeleportPlayer generates correct Java code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="TeleportPlayer",
                    properties={"x": "100", "y": "64", "z": "-50"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "player.teleport(new Location(player.getWorld(), 100, 64, -50, 0f, 0f));" in listener_code
        assert "import org.bukkit.Location;" in listener_code


class TestAddExperienceAction:
    """Test AddExperience action code generation."""

    def test_add_experience(self, generator, base_config):
        """Test AddExperience generates correct Java code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="AddExperience",
                    properties={"amount": "100"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "player.giveExp(100);" in listener_code


class TestSendTitleAction:
    """Test SendTitle action code generation."""

    def test_send_title_with_all_params(self, generator, base_config):
        """Test SendTitle generates correct Java code with all parameters."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="SendTitle",
                    properties={
                        "title": "Welcome!",
                        "subtitle": "Have fun!",
                        "fadeIn": "20",
                        "stay": "60",
                        "fadeOut": "10",
                    },
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert 'player.sendTitle("Welcome!", "Have fun!", 20, 60, 10);' in listener_code


class TestConsoleLogAction:
    """Test ConsoleLog action code generation."""

    def test_console_log(self, generator, base_config):
        """Test ConsoleLog generates correct Java code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="ConsoleLog",
                    properties={"message": "Player joined"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert 'Bukkit.getLogger().info("Player joined");' in listener_code
        assert "import org.bukkit.Bukkit;" in listener_code

    def test_console_log_with_player_placeholder(self, generator, base_config):
        """Test ConsoleLog with %player% placeholder."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="ConsoleLog",
                    properties={"message": "Player %player% connected"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert 'Bukkit.getLogger().info("Player " + player.getName() + " connected");' in listener_code


class TestDropItemAction:
    """Test DropItem action code generation."""

    def test_drop_item(self, generator, base_config):
        """Test DropItem generates correct Java code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="BlockBreakEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="DropItem",
                    properties={"itemType": "EMERALD", "amount": "3"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "player.getWorld().dropItemNaturally(player.getLocation(), new ItemStack(Material.EMERALD, 3));" in listener_code


class TestCustomAction:
    """Test custom action code generation."""

    def test_custom_action(self, generator, base_config):
        """Test custom action embeds Java code correctly."""
        custom_code = 'if (player.hasPermission("vip")) {\n    player.sendMessage("VIP!");\n}'
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.CUSTOM_ACTION,
                    name="Custom Action",
                    properties={},
                    children=[],
                    custom_code=custom_code,
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert 'if (player.hasPermission("vip"))' in listener_code
        assert 'player.sendMessage("VIP!");' in listener_code
        assert "import org.bukkit.Bukkit;" in listener_code
        assert "import org.bukkit.ChatColor;" in listener_code


class TestMultipleActions:
    """Test multiple actions in sequence."""

    def test_multiple_actions_order(self, generator, base_config):
        """Test multiple actions are generated in correct order."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1", "action-2", "action-3"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="SendMessage",
                    properties={"message": "First"},
                    children=[],
                ),
                Block(
                    id="action-2",
                    type=BlockType.ACTION,
                    name="GiveItem",
                    properties={"itemType": "DIAMOND", "amount": "1"},
                    children=[],
                ),
                Block(
                    id="action-3",
                    type=BlockType.ACTION,
                    name="PlaySound",
                    properties={"sound": "ENTITY_PLAYER_LEVELUP", "volume": "1.0", "pitch": "1.0"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        # Check all actions are present
        assert 'player.sendMessage("First");' in listener_code
        assert "new ItemStack(Material.DIAMOND, 1)" in listener_code
        assert "Sound.ENTITY_PLAYER_LEVELUP" in listener_code

        # Check order (SendMessage should come before GiveItem)
        send_pos = listener_code.find('player.sendMessage("First")')
        give_pos = listener_code.find("new ItemStack(Material.DIAMOND")
        sound_pos = listener_code.find("Sound.ENTITY_PLAYER_LEVELUP")

        assert send_pos < give_pos < sound_pos


class TestMultipleEvents:
    """Test multiple events generating separate listeners."""

    def test_multiple_events(self, generator, base_config):
        """Test multiple events create separate listener classes."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="SendMessage",
                    properties={"message": "Join message"},
                    children=[],
                ),
                Block(
                    id="event-2",
                    type=BlockType.EVENT,
                    name="PlayerQuitEvent",
                    properties={},
                    children=["action-2"],
                ),
                Block(
                    id="action-2",
                    type=BlockType.ACTION,
                    name="BroadcastMessage",
                    properties={"message": "Quit message"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)

        assert len(result["listeners"]) == 2
        assert "EventListener0.java" in result["listeners"]
        assert "EventListener1.java" in result["listeners"]

        join_listener = result["listeners"]["EventListener0.java"]
        quit_listener = result["listeners"]["EventListener1.java"]

        assert "PlayerJoinEvent" in join_listener
        assert "Join message" in join_listener

        assert "PlayerQuitEvent" in quit_listener
        assert "Quit message" in quit_listener


class TestPluginYml:
    """Test plugin.yml generation."""

    def test_plugin_yml(self, generator, base_config):
        """Test plugin.yml is generated correctly."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        plugin_yml = result["plugin_yml"]

        # Note: main_class_name property converts to title case (Testplugin)
        assert "name: Testplugin" in plugin_yml
        assert "version: 1.0.0" in plugin_yml
        assert "main: com.example.testplugin.Testplugin" in plugin_yml
        assert "description: A test plugin" in plugin_yml
        assert "- TestAuthor" in plugin_yml


class TestMainPluginClass:
    """Test main plugin class generation."""

    def test_main_class(self, generator, base_config):
        """Test main plugin class is generated correctly."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        main_java = result["main_java"]

        # Note: main_class_name property converts to title case (Testplugin)
        assert "package com.example.testplugin;" in main_java
        assert "public class Testplugin extends JavaPlugin" in main_java
        assert 'getLogger().info("Testplugin v1.0.0 enabled!");' in main_java
        assert "new com.example.testplugin.listeners.EventListener0()" in main_java


class TestWorldEventActionGeneration:
    """Regression tests for world actions in non-player events."""

    def test_weather_change_spawn_entity_does_not_require_player(self, generator, base_config):
        """Weather/Thunder events should generate world-based spawn code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="WeatherChangeEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="SpawnEntity",
                    properties={"entityType": "AXOLOTL"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "if (player == null) return;" not in listener_code
        assert "event.getWorld().spawnEntity(event.getWorld().getSpawnLocation(), EntityType.AXOLOTL);" in listener_code

    def test_weather_change_spawn_entity_player_target_is_guarded(self, generator, base_config):
        """Explicit player target should be guarded in world events."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="WeatherChangeEvent",
                    properties={},
                    children=["action-1"],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="SpawnEntity",
                    properties={"entityType": "AXOLOTL", "target": "player"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]

        assert "if (player == null) return;" not in listener_code
        assert "if (player != null) {" in listener_code
        assert "player.getWorld().spawnEntity(player.getLocation(), EntityType.AXOLOTL);" in listener_code


class TestConditionBlocks:
    """Test condition block code generation (guard clauses)."""

    def test_has_permission_guard(self, generator, base_config):
        """Test HasPermission generates guard clause."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["cond-1", "action-1"]),
                Block(id="cond-1", type=BlockType.ACTION, name="HasPermission",
                      properties={"permission": "myplugin.vip"}, children=[]),
                Block(id="action-1", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "VIP!"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]
        assert 'if (player == null || !player.hasPermission("myplugin.vip")) return;' in code
        assert 'player.sendMessage("VIP!");' in code

    def test_has_item_guard(self, generator, base_config):
        """Test HasItem generates guard clause with material check."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["cond-1"]),
                Block(id="cond-1", type=BlockType.ACTION, name="HasItem",
                      properties={"itemType": "DIAMOND_SWORD"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]
        assert "Material.DIAMOND_SWORD" in code
        assert "!player.getInventory().contains" in code

    def test_health_above_guard(self, generator, base_config):
        """Test HealthAbove generates guard clause."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["cond-1"]),
                Block(id="cond-1", type=BlockType.ACTION, name="HealthAbove",
                      properties={"health": "10.0"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]
        assert "player.getHealth() <= 10.0" in code

    def test_health_below_guard(self, generator, base_config):
        """Test HealthBelow generates guard clause."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["cond-1"]),
                Block(id="cond-1", type=BlockType.ACTION, name="HealthBelow",
                      properties={"health": "5.0"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]
        assert "player.getHealth() >= 5.0" in code

    def test_gamemode_equals_guard(self, generator, base_config):
        """Test GameModeEquals generates guard clause and adds import."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["cond-1"]),
                Block(id="cond-1", type=BlockType.ACTION, name="GameModeEquals",
                      properties={"gameMode": "CREATIVE"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]
        assert "GameMode.CREATIVE" in code
        assert "import org.bukkit.GameMode;" in code

    def test_is_sneaking_guard(self, generator, base_config):
        """Test IsSneaking generates guard clause."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["cond-1"]),
                Block(id="cond-1", type=BlockType.ACTION, name="IsSneaking",
                      properties={}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]
        assert "!player.isSneaking()" in code

    def test_is_op_guard(self, generator, base_config):
        """Test IsOp generates guard clause."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["cond-1"]),
                Block(id="cond-1", type=BlockType.ACTION, name="IsOp",
                      properties={}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]
        assert "!player.isOp()" in code

    def test_condition_before_action_order(self, generator, base_config):
        """Test condition guard appears before the action code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["cond-1", "action-1"]),
                Block(id="cond-1", type=BlockType.ACTION, name="HasPermission",
                      properties={"permission": "test.perm"}, children=[]),
                Block(id="action-1", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "Hello"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]
        guard_pos = code.find("hasPermission")
        msg_pos = code.find("sendMessage")
        assert guard_pos < msg_pos


class TestCommandEvent:
    """Test CommandEvent code generation."""

    def test_basic_command_class(self, generator, base_config):
        """Test CommandEvent generates a command executor class."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                      properties={"commandName": "heal"}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "You have been healed!"}, children=[]),
            ],
        )
        result = generator.generate_all(config)

        # Should generate a command class, not a listener
        assert len(result["listeners"]) == 0
        assert len(result["commands"]) == 1
        assert "CommandHeal.java" in result["commands"]

        code = result["commands"]["CommandHeal.java"]
        assert "implements CommandExecutor, TabCompleter" in code
        assert "onCommand(CommandSender sender, Command command, String label, String[] args)" in code
        assert "sender instanceof Player" in code
        assert "Player player = (Player) sender;" in code
        assert 'player.sendMessage("You have been healed!");' in code
        assert "onTabComplete(CommandSender sender, Command command, String alias, String[] args)" in code

    def test_command_registered_in_main_class(self, generator, base_config):
        """Test command is registered in main plugin class with null safety."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                      properties={"commandName": "heal"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        main = result["main_java"]

        assert 'getCommand("heal") != null' in main
        assert 'getCommand("heal").setExecutor' in main
        assert 'getCommand("heal").setTabCompleter' in main
        assert "CommandHeal()" in main

    def test_command_in_plugin_yml(self, generator, base_config):
        """Test command is declared in plugin.yml."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                      properties={
                          "commandName": "heal",
                          "commandDescription": "Heals the player",
                          "commandUsage": "/heal",
                          "commandPermission": "myplugin.heal",
                          "commandAliases": "h,hp",
                      }, children=[]),
            ],
        )
        result = generator.generate_all(config)
        yml = result["plugin_yml"]

        assert "commands:" in yml
        assert "  heal:" in yml
        assert "description: Heals the player" in yml
        assert "usage: /heal" in yml
        assert "permission: myplugin.heal" in yml
        assert "aliases: [h, hp]" in yml

    def test_command_not_in_listeners(self, generator, base_config):
        """Test CommandEvent blocks are excluded from listener generation."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "Hello"}, children=[]),
                Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                      properties={"commandName": "test"}, children=["action-2"]),
                Block(id="action-2", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "Test command"}, children=[]),
            ],
        )
        result = generator.generate_all(config)

        # Only the PlayerJoinEvent should be a listener
        assert len(result["listeners"]) == 1
        assert "CommandEvent" not in list(result["listeners"].values())[0]
        # Command should be separate
        assert len(result["commands"]) == 1

    def test_command_arg_placeholder_replaced(self, generator, base_config):
        """Test %argN% placeholders are replaced with bounds-safe args access."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                      properties={"commandName": "greet"}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "Hello %arg0%!"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = result["commands"]["CommandGreet.java"]

        # Should contain bounds-safe access
        assert "args.length > 0 ? args[0]" in code
        assert 'Hello " + (args.length > 0 ? args[0] : "")' in code

    def test_arg_placeholder_ignored_in_listener(self, generator, base_config):
        """Test %argN% placeholders are left as-is in listener context (no args variable)."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "Value: %arg0%"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        # %arg0% should remain as literal text, not be replaced
        assert "%arg0%" in code
        assert "args[" not in code

    def test_cancel_event_skipped_in_command(self, generator, base_config):
        """Test CancelEvent action is silently skipped in command context."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                      properties={"commandName": "test"}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="CancelEvent",
                      properties={}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = result["commands"]["CommandTest.java"]

        assert "setCancelled" not in code

    def test_empty_command_name_skipped(self, generator, base_config):
        """Test CommandEvent with empty name fails validation."""
        with pytest.raises(Exception):
            PluginConfig(
                **base_config,
                blocks=[
                    Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                          properties={"commandName": ""}, children=["action-1"]),
                    Block(id="action-1", type=BlockType.ACTION, name="SendMessage",
                          properties={"message": "test"}, children=[]),
                ],
            )

    def test_command_with_entity_actions(self, generator, base_config):
        """Test CommandEvent with entity-targeting actions produces compilable code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                      properties={"commandName": "smite"}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="DamageEntity",
                      properties={"amount": "10.0"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = result["commands"]["CommandSmite.java"]

        # Should declare entity variables (player-based in command context)
        assert "Entity targetEntity = player;" in code
        assert "import org.bukkit.entity.Entity;" in code
        # Should NOT reference event variable
        assert "event instanceof" not in code

    def test_command_with_block_actions(self, generator, base_config):
        """Test CommandEvent with block-targeting actions produces compilable code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                      properties={"commandName": "setblock"}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="SetBlockType",
                      properties={"blockType": "DIAMOND_BLOCK"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = result["commands"]["CommandSetblock.java"]

        # Should declare block variable (player-based in command context)
        assert "Block targetBlock = player.getLocation().getBlock();" in code
        assert "import org.bukkit.block.Block;" in code
        # Should NOT reference event variable
        assert "event instanceof" not in code

    def test_command_tab_completions_generated(self, generator, base_config):
        """Test CommandEvent tab-completion suggestions generate a TabCompleter body."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="cmd-1",
                    type=BlockType.EVENT,
                    name="CommandEvent",
                    properties={
                        "commandName": "tools",
                        "commandTabCompletions": "reload,status,help",
                    },
                    children=[],
                ),
            ],
        )
        result = generator.generate_all(config)
        code = result["commands"]["CommandTools.java"]

        assert "Arrays.asList(\"reload\", \"status\", \"help\")" in code
        assert "option.toLowerCase().startsWith(input)" in code
        assert "return matches;" in code


class TestPomXml:
    """Test pom.xml generation."""

    def test_pom_xml(self, generator, base_config):
        """Test pom.xml is generated correctly."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        pom_xml = result["pom_xml"]

        assert "<groupId>com.example</groupId>" in pom_xml
        assert "<artifactId>testplugin</artifactId>" in pom_xml
        assert "<version>1.0.0</version>" in pom_xml
        assert "io.papermc.paper" in pom_xml
        assert "paper-api" in pom_xml
        assert "1.21.1-R0.1-SNAPSHOT" in pom_xml


class TestDelayAction:
    """Test DelayAction code generation."""

    def test_delay_wraps_remaining_actions(self, generator, base_config):
        """Test DelayAction wraps all subsequent actions in a BukkitRunnable."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1", "action-2", "action-3"]),
                Block(id="action-1", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "Before delay"}, children=[]),
                Block(id="action-2", type=BlockType.ACTION, name="DelayAction",
                      properties={"delayTicks": "40"}, children=[]),
                Block(id="action-3", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "After delay"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert 'player.sendMessage("Before delay");' in code
        assert "new BukkitRunnable()" in code
        assert "runTaskLater" in code
        assert "40" in code
        assert 'player.sendMessage("After delay");' in code
        assert "import org.bukkit.scheduler.BukkitRunnable;" in code

    def test_delay_in_command_context(self, generator, base_config):
        """Test DelayAction works in command context."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                      properties={"commandName": "delayed"}, children=["action-1", "action-2"]),
                Block(id="action-1", type=BlockType.ACTION, name="DelayAction",
                      properties={"delayTicks": "60"}, children=[]),
                Block(id="action-2", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "Delayed message"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = result["commands"]["CommandDelayed.java"]

        assert "new BukkitRunnable()" in code
        assert "runTaskLater" in code
        assert "60" in code
        assert 'player.sendMessage("Delayed message");' in code


class TestRepeatAction:
    """Test RepeatAction code generation."""

    def test_repeat_wraps_remaining_actions(self, generator, base_config):
        """Test RepeatAction wraps subsequent actions in a repeating BukkitRunnable."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1", "action-2"]),
                Block(id="action-1", type=BlockType.ACTION, name="RepeatAction",
                      properties={"intervalTicks": "20", "repeatCount": "5"}, children=[]),
                Block(id="action-2", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "Repeating!"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert "new BukkitRunnable()" in code
        assert "runTaskTimer" in code
        assert "20" in code
        assert "count >= 5" in code
        assert "this.cancel()" in code
        assert 'player.sendMessage("Repeating!");' in code

    def test_repeat_infinite(self, generator, base_config):
        """Test RepeatAction with no count limit (infinite)."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1", "action-2"]),
                Block(id="action-1", type=BlockType.ACTION, name="RepeatAction",
                      properties={"intervalTicks": "40"}, children=[]),
                Block(id="action-2", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "Forever!"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert "runTaskTimer" in code
        assert "count" not in code  # No counter for infinite


class TestGiveItemMeta:
    """Test GiveItem with ItemMeta properties."""

    def test_give_item_with_display_name(self, generator, base_config):
        """Test GiveItem generates ItemMeta code when displayName is set."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="GiveItem",
                      properties={"itemType": "DIAMOND_SWORD", "amount": "1",
                                  "displayName": "&6Legendary Sword"},
                      children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert "ItemMeta meta = customItem.getItemMeta();" in code
        assert "meta.setDisplayName" in code
        assert "translateAlternateColorCodes" in code
        assert "Legendary Sword" in code
        assert "customItem.setItemMeta(meta);" in code
        assert "player.getInventory().addItem(customItem);" in code

    def test_give_item_with_lore(self, generator, base_config):
        """Test GiveItem generates lore lines from pipe-separated string."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="GiveItem",
                      properties={"itemType": "DIAMOND", "amount": "1",
                                  "lore": "Line 1|Line 2"},
                      children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert "meta.setLore" in code
        assert "Arrays.asList" in code
        assert "Line 1" in code
        assert "Line 2" in code

    def test_give_item_with_enchantments(self, generator, base_config):
        """Test GiveItem generates enchantment code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="GiveItem",
                      properties={"itemType": "DIAMOND_SWORD", "amount": "1",
                                  "enchantments": "SHARPNESS:5,UNBREAKING:3"},
                      children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert "meta.addEnchant" in code
        assert "Enchantment.SHARPNESS, 5" in code
        assert "Enchantment.UNBREAKING, 3" in code

    def test_give_item_with_item_flags(self, generator, base_config):
        """Test GiveItem generates item flag code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="GiveItem",
                      properties={"itemType": "DIAMOND_SWORD", "amount": "1",
                                  "itemFlags": "HIDE_ENCHANTS,HIDE_ATTRIBUTES"},
                      children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert "meta.addItemFlags" in code
        assert "ItemFlag.HIDE_ENCHANTS" in code
        assert "ItemFlag.HIDE_ATTRIBUTES" in code

    def test_give_item_without_meta_unchanged(self, generator, base_config):
        """Test GiveItem without meta properties still generates simple code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="GiveItem",
                      properties={"itemType": "DIAMOND", "amount": "5"},
                      children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert "player.getInventory().addItem(new ItemStack(Material.DIAMOND, 5));" in code
        assert "ItemMeta" not in code

    def test_give_item_meta_in_command_context(self, generator, base_config):
        """Test GiveItem with ItemMeta works in command context."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                      properties={"commandName": "sword"}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="GiveItem",
                      properties={"itemType": "DIAMOND_SWORD", "amount": "1",
                                  "displayName": "&cFire Sword",
                                  "enchantments": "FIRE_ASPECT:2"},
                      children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = result["commands"]["CommandSword.java"]

        assert "ItemMeta meta = customItem.getItemMeta();" in code
        assert "Fire Sword" in code
        assert "Enchantment.FIRE_ASPECT, 2" in code
        assert "import org.bukkit.inventory.meta.ItemMeta;" in code


class TestCooldownSystem:
    """Test SetCooldown and CheckCooldown code generation with shared CooldownManager."""

    def test_set_cooldown(self, generator, base_config):
        """Test SetCooldown generates CooldownManager.setCooldown call."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="SetCooldown",
                      properties={"cooldownName": "join_cd", "duration": "10"},
                      children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert "CooldownManager.setCooldown" in code
        assert "join_cd" in code
        assert "10 * 1000L" in code
        assert "getUniqueId()" in code
        assert "import" in code and "CooldownManager" in code

    def test_check_cooldown_with_message(self, generator, base_config):
        """Test CheckCooldown generates guard clause with CooldownManager."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1", "action-2"]),
                Block(id="action-1", type=BlockType.ACTION, name="CheckCooldown",
                      properties={"cooldownName": "my_cd",
                                  "cooldownMessage": "Wait %remaining% seconds!"},
                      children=[]),
                Block(id="action-2", type=BlockType.ACTION, name="SendMessage",
                      properties={"message": "You passed the cooldown check!"}, children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert "CooldownManager.isOnCooldown" in code
        assert "my_cd" in code
        assert "player.sendMessage" in code
        assert "CooldownManager.getRemainingSeconds" in code
        assert "return;" in code

    def test_cooldown_manager_utility_generated(self, generator, base_config):
        """Test that shared CooldownManager utility class is generated."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="SetCooldown",
                      properties={"cooldownName": "test", "duration": "5"},
                      children=[]),
            ],
        )
        result = generator.generate_all(config)

        assert "utilities" in result
        assert "CooldownManager.java" in result["utilities"]
        util_code = result["utilities"]["CooldownManager.java"]
        assert "ConcurrentHashMap" in util_code
        assert "public static void setCooldown" in util_code
        assert "public static boolean isOnCooldown" in util_code
        assert "public static long getRemainingSeconds" in util_code

    def test_no_per_class_cooldown_field(self, generator, base_config):
        """Test that listener/command classes do NOT have per-class cooldown fields."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="SetCooldown",
                      properties={"cooldownName": "test", "duration": "5"},
                      children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert "HashMap<String, java.util.HashMap" not in code
        assert "private static final java.util.HashMap" not in code

    def test_cooldown_in_command_context(self, generator, base_config):
        """Test cooldown system works in command context with shared CooldownManager."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                      properties={"commandName": "heal"}, children=["action-1", "action-2"]),
                Block(id="action-1", type=BlockType.ACTION, name="CheckCooldown",
                      properties={"cooldownName": "heal_cd",
                                  "cooldownMessage": "Heal on cooldown!"},
                      children=[]),
                Block(id="action-2", type=BlockType.ACTION, name="SetCooldown",
                      properties={"cooldownName": "heal_cd", "duration": "30"},
                      children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = result["commands"]["CommandHeal.java"]

        assert "CooldownManager.isOnCooldown" in code
        assert "CooldownManager.setCooldown" in code
        assert "heal_cd" in code
        assert "import" in code and "CooldownManager" in code

    def test_check_cooldown_without_message(self, generator, base_config):
        """Test CheckCooldown without a message still returns."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="CheckCooldown",
                      properties={"cooldownName": "silent_cd"},
                      children=[]),
            ],
        )
        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert "return;" in code
        assert "CooldownManager.isOnCooldown" in code

    def test_cooldown_shared_across_classes(self, generator, base_config):
        """Test that cooldown state is shared: both listener and command use CooldownManager."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(id="event-1", type=BlockType.EVENT, name="PlayerJoinEvent",
                      properties={}, children=["action-1"]),
                Block(id="action-1", type=BlockType.ACTION, name="SetCooldown",
                      properties={"cooldownName": "shared_cd", "duration": "10"},
                      children=[]),
                Block(id="cmd-1", type=BlockType.EVENT, name="CommandEvent",
                      properties={"commandName": "check"}, children=["action-2"]),
                Block(id="action-2", type=BlockType.ACTION, name="CheckCooldown",
                      properties={"cooldownName": "shared_cd",
                                  "cooldownMessage": "Still on cooldown!"},
                      children=[]),
            ],
        )
        result = generator.generate_all(config)
        listener_code = list(result["listeners"].values())[0]
        command_code = result["commands"]["CommandCheck.java"]

        # Both reference the shared CooldownManager, not local fields
        assert "CooldownManager.setCooldown" in listener_code
        assert "CooldownManager.isOnCooldown" in command_code
        # Neither has a per-class HashMap
        assert "private static final" not in listener_code or "HashMap" not in listener_code
        assert "private static final" not in command_code or "HashMap" not in command_code


class TestBranchIfBlocks:
    """Test explicit if/else branching block generation."""

    def test_branch_if_else_with_and_combinator(self, generator, base_config):
        """BranchIf + BranchElse + BranchEndIf should generate structured if/else code."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="event-1",
                    type=BlockType.EVENT,
                    name="PlayerJoinEvent",
                    properties={},
                    children=["if-1", "action-1", "else-1", "action-2", "end-1"],
                ),
                Block(
                    id="if-1",
                    type=BlockType.ACTION,
                    name="BranchIf",
                    properties={
                        "firstType": "HasPermission",
                        "firstPermission": "myplugin.vip",
                        "combinator": "AND",
                        "secondType": "HealthBelow",
                        "secondHealth": "6",
                    },
                    children=[],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="SendMessage",
                    properties={"message": "VIP low HP"},
                    children=[],
                ),
                Block(
                    id="else-1",
                    type=BlockType.ACTION,
                    name="BranchElse",
                    properties={},
                    children=[],
                ),
                Block(
                    id="action-2",
                    type=BlockType.ACTION,
                    name="SendMessage",
                    properties={"message": "Default branch"},
                    children=[],
                ),
                Block(
                    id="end-1",
                    type=BlockType.ACTION,
                    name="BranchEndIf",
                    properties={},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        code = list(result["listeners"].values())[0]

        assert "player.hasPermission(\"myplugin.vip\")" in code
        assert "player.getHealth() < 6" in code
        assert "&&" in code
        assert "} else {" in code
        assert 'player.sendMessage("VIP low HP");' in code
        assert 'player.sendMessage("Default branch");' in code


class TestTypedCommandArguments:
    """Test StringArg/PlayerArg/IntegerArg command argument generation."""

    def test_typed_command_args_generate_prelude(self, generator, base_config):
        """Typed arg blocks should generate parsing/validation code before actions."""
        config = PluginConfig(
            **base_config,
            blocks=[
                Block(
                    id="cmd-1",
                    type=BlockType.EVENT,
                    name="CommandEvent",
                    properties={"commandName": "reward"},
                    children=["arg-1", "arg-2", "arg-3", "action-1"],
                ),
                Block(
                    id="arg-1",
                    type=BlockType.ACTION,
                    name="StringArg",
                    properties={"argName": "reason", "required": "true"},
                    children=[],
                ),
                Block(
                    id="arg-2",
                    type=BlockType.ACTION,
                    name="IntegerArg",
                    properties={"argName": "amount", "required": "true", "min": "1"},
                    children=[],
                ),
                Block(
                    id="arg-3",
                    type=BlockType.ACTION,
                    name="PlayerArg",
                    properties={"argName": "targetPlayer", "required": "false"},
                    children=[],
                ),
                Block(
                    id="action-1",
                    type=BlockType.ACTION,
                    name="SendMessage",
                    properties={"message": "Rewarded %arg0%"},
                    children=[],
                ),
            ],
        )

        result = generator.generate_all(config)
        code = result["commands"]["CommandReward.java"]

        assert "String reason = args[0];" in code
        assert "int amount;" in code
        assert "amount = Integer.parseInt(args[1]);" in code
        assert "if (amount < 1)" in code
        assert "Player targetPlayer = null;" in code
        assert "targetPlayer = Bukkit.getPlayerExact(args[2]);" in code
        assert "Missing required argument: reason" in code
        assert "Missing required integer argument: amount" in code
