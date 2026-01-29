"""Block definitions and mappings."""

from typing import Any, Dict, List


class BlockDefinitionService:
    """Provides available block definitions for the frontend."""

    def get_available_blocks(self) -> Dict[str, List[Dict[str, Any]]]:
        """Return all available blocks organized by category."""
        return {
            "events": [
                {
                    "id": "player-join",
                    "name": "PlayerJoinEvent",
                    "type": "event",
                    "description": "Fired when a player joins the server",
                    "color": "#3498db",
                    "properties": [],
                },
                {
                    "id": "player-quit",
                    "name": "PlayerQuitEvent",
                    "type": "event",
                    "description": "Fired when a player leaves the server",
                    "color": "#3498db",
                    "properties": [],
                },
                {
                    "id": "block-break",
                    "name": "BlockBreakEvent",
                    "type": "event",
                    "description": "Fired when a player breaks a block",
                    "color": "#3498db",
                    "properties": [],
                },
                {
                    "id": "block-place",
                    "name": "BlockPlaceEvent",
                    "type": "event",
                    "description": "Fired when a player places a block",
                    "color": "#3498db",
                    "properties": [],
                },
            ],
            "actions": [
                {
                    "id": "send-message",
                    "name": "SendMessage",
                    "type": "action",
                    "description": "Send a message to the player",
                    "color": "#27ae60",
                    "properties": [
                        {"name": "message", "type": "string", "required": True, "placeholder": "Enter message..."},
                    ],
                },
                {
                    "id": "broadcast-message",
                    "name": "BroadcastMessage",
                    "type": "action",
                    "description": "Broadcast a message to all players",
                    "color": "#27ae60",
                    "properties": [
                        {"name": "message", "type": "string", "required": True, "placeholder": "Enter broadcast message..."},
                    ],
                },
                {
                    "id": "give-item",
                    "name": "GiveItem",
                    "type": "action",
                    "description": "Give an item to the player",
                    "color": "#27ae60",
                    "properties": [
                        {"name": "itemType", "type": "string", "required": True, "placeholder": "e.g., DIAMOND"},
                        {"name": "amount", "type": "string", "required": False, "placeholder": "1"},
                    ],
                },
                {
                    "id": "set-health",
                    "name": "SetHealth",
                    "type": "action",
                    "description": "Set the player health",
                    "color": "#27ae60",
                    "properties": [
                        {"name": "health", "type": "string", "required": True, "placeholder": "20.0"},
                    ],
                },
                {
                    "id": "set-hunger",
                    "name": "SetHunger",
                    "type": "action",
                    "description": "Set the player food level",
                    "color": "#27ae60",
                    "properties": [
                        {"name": "hunger", "type": "string", "required": True, "placeholder": "20"},
                    ],
                },
                {
                    "id": "cancel-event",
                    "name": "CancelEvent",
                    "type": "action",
                    "description": "Cancel the current event",
                    "color": "#e74c3c",
                    "properties": [],
                },
                {
                    "id": "play-sound",
                    "name": "PlaySound",
                    "type": "action",
                    "description": "Play a sound to the player",
                    "color": "#27ae60",
                    "properties": [
                        {"name": "sound", "type": "string", "required": True, "placeholder": "ENTITY_EXPERIENCE_ORB_PICKUP"},
                        {"name": "volume", "type": "string", "required": False, "placeholder": "1.0"},
                        {"name": "pitch", "type": "string", "required": False, "placeholder": "1.0"},
                    ],
                },
                {
                    "id": "teleport-player",
                    "name": "TeleportPlayer",
                    "type": "action",
                    "description": "Teleport the player to coordinates",
                    "color": "#27ae60",
                    "properties": [
                        {"name": "x", "type": "string", "required": True, "placeholder": "0"},
                        {"name": "y", "type": "string", "required": True, "placeholder": "64"},
                        {"name": "z", "type": "string", "required": True, "placeholder": "0"},
                    ],
                },
                {
                    "id": "add-experience",
                    "name": "AddExperience",
                    "type": "action",
                    "description": "Give experience points to the player",
                    "color": "#27ae60",
                    "properties": [
                        {"name": "amount", "type": "string", "required": True, "placeholder": "10"},
                    ],
                },
                {
                    "id": "send-title",
                    "name": "SendTitle",
                    "type": "action",
                    "description": "Show a title on the player screen",
                    "color": "#27ae60",
                    "properties": [
                        {"name": "title", "type": "string", "required": True, "placeholder": "Title text"},
                        {"name": "subtitle", "type": "string", "required": False, "placeholder": "Subtitle text"},
                        {"name": "fadeIn", "type": "string", "required": False, "placeholder": "10"},
                        {"name": "stay", "type": "string", "required": False, "placeholder": "70"},
                        {"name": "fadeOut", "type": "string", "required": False, "placeholder": "20"},
                    ],
                },
                {
                    "id": "console-log",
                    "name": "ConsoleLog",
                    "type": "action",
                    "description": "Log a message to the server console",
                    "color": "#95a5a6",
                    "properties": [
                        {"name": "message", "type": "string", "required": True, "placeholder": "Log message..."},
                    ],
                },
                {
                    "id": "drop-item",
                    "name": "DropItem",
                    "type": "action",
                    "description": "Drop an item at the player location",
                    "color": "#27ae60",
                    "properties": [
                        {"name": "itemType", "type": "string", "required": True, "placeholder": "DIAMOND"},
                        {"name": "amount", "type": "string", "required": False, "placeholder": "1"},
                    ],
                },
            ],
            "custom_options": [
                {
                    "id": "custom-condition",
                    "name": "Custom Condition",
                    "type": "custom-condition",
                    "description": "Write custom Java logic for a condition",
                    "color": "#f39c12",
                    "properties": [],
                },
                {
                    "id": "custom-action",
                    "name": "Custom Action",
                    "type": "custom-action",
                    "description": "Write custom Java code for an action",
                    "color": "#9b59b6",
                    "properties": [],
                },
            ],
        }
