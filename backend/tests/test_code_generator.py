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
