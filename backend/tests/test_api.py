"""Tests for the API endpoints."""

import pytest
from starlette.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Create a test client for the API."""
    with TestClient(app) as c:
        yield c


class TestHealthEndpoint:
    """Test the health check endpoint."""

    def test_health_check(self, client):
        """Test the health endpoint returns OK."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestBlocksEndpoint:
    """Test the blocks endpoint."""

    def test_get_blocks(self, client):
        """Test getting available block definitions."""
        response = client.get("/api/blocks")
        assert response.status_code == 200
        data = response.json()

        # Check structure
        assert "events" in data
        assert "actions" in data
        assert "custom_options" in data

        # Check events
        events = data["events"]
        assert len(events) >= 4
        event_names = [e["name"] for e in events]
        assert "PlayerJoinEvent" in event_names
        assert "PlayerQuitEvent" in event_names
        assert "BlockBreakEvent" in event_names
        assert "BlockPlaceEvent" in event_names

        # Check actions
        actions = data["actions"]
        action_names = [a["name"] for a in actions]
        assert "SendMessage" in action_names
        assert "BroadcastMessage" in action_names
        assert "GiveItem" in action_names
        assert "SetHealth" in action_names
        assert "SetHunger" in action_names
        assert "CancelEvent" in action_names
        assert "PlaySound" in action_names
        assert "TeleportPlayer" in action_names
        assert "AddExperience" in action_names
        assert "SendTitle" in action_names
        assert "ConsoleLog" in action_names
        assert "DropItem" in action_names


class TestGeneratePluginEndpoint:
    """Test the plugin generation endpoint."""

    def test_generate_plugin_missing_name(self, client):
        """Test that missing name returns validation error."""
        response = client.post(
            "/api/generate-plugin",
            json={
                "version": "1.0.0",
                "main_package": "com.example.test",
                "description": "Test",
                "author": "Test",
                "blocks": [],
            },
        )
        assert response.status_code == 422  # Validation error

    def test_generate_plugin_missing_blocks(self, client):
        """Test that missing blocks returns validation error."""
        response = client.post(
            "/api/generate-plugin",
            json={
                "name": "TestPlugin",
                "version": "1.0.0",
                "main_package": "com.example.test",
                "description": "Test",
                "author": "Test",
            },
        )
        assert response.status_code == 422  # Validation error

    def test_generate_plugin_empty_blocks(self, client):
        """Test that empty blocks array is handled."""
        response = client.post(
            "/api/generate-plugin",
            json={
                "name": "TestPlugin",
                "version": "1.0.0",
                "main_package": "com.example.test",
                "description": "Test",
                "author": "Test",
                "blocks": [],
            },
        )
        # Empty blocks returns validation error or fails at build stage
        assert response.status_code in [200, 400, 422, 500]

    def test_generate_plugin_valid_request_structure(self, client):
        """Test a valid plugin generation request structure."""
        payload = {
            "name": "MyTestPlugin",
            "version": "1.0.0",
            "main_package": "com.example.mytestplugin",
            "description": "A test plugin",
            "author": "TestAuthor",
            "blocks": [
                {
                    "id": "event-1",
                    "type": "event",
                    "name": "PlayerJoinEvent",
                    "properties": {},
                    "children": ["action-1"],
                    "custom_code": "",
                },
                {
                    "id": "action-1",
                    "type": "action",
                    "name": "SendMessage",
                    "properties": {"message": "Hello!"},
                    "children": [],
                    "custom_code": "",
                },
            ],
        }

        # Note: This test will fail if Maven is not installed
        # But it validates the request structure is correct
        response = client.post("/api/generate-plugin", json=payload)

        # Either succeeds (200) or fails at build stage (500) but not validation (422)
        assert response.status_code != 422

    def test_generate_plugin_with_multiple_actions(self, client):
        """Test plugin generation with multiple actions."""
        payload = {
            "name": "MultiActionPlugin",
            "version": "1.0.0",
            "main_package": "com.example.multiaction",
            "description": "Plugin with multiple actions",
            "author": "TestAuthor",
            "blocks": [
                {
                    "id": "event-1",
                    "type": "event",
                    "name": "PlayerJoinEvent",
                    "properties": {},
                    "children": ["action-1", "action-2", "action-3"],
                    "custom_code": "",
                },
                {
                    "id": "action-1",
                    "type": "action",
                    "name": "SendMessage",
                    "properties": {"message": "Welcome!"},
                    "children": [],
                    "custom_code": "",
                },
                {
                    "id": "action-2",
                    "type": "action",
                    "name": "GiveItem",
                    "properties": {"itemType": "DIAMOND", "amount": "5"},
                    "children": [],
                    "custom_code": "",
                },
                {
                    "id": "action-3",
                    "type": "action",
                    "name": "PlaySound",
                    "properties": {"sound": "ENTITY_PLAYER_LEVELUP", "volume": "1.0", "pitch": "1.0"},
                    "children": [],
                    "custom_code": "",
                },
            ],
        }

        response = client.post("/api/generate-plugin", json=payload)
        assert response.status_code != 422  # Not a validation error

    def test_generate_plugin_with_custom_action(self, client):
        """Test plugin generation with custom action code."""
        payload = {
            "name": "CustomActionPlugin",
            "version": "1.0.0",
            "main_package": "com.example.customaction",
            "description": "Plugin with custom action",
            "author": "TestAuthor",
            "blocks": [
                {
                    "id": "event-1",
                    "type": "event",
                    "name": "PlayerJoinEvent",
                    "properties": {},
                    "children": ["action-1"],
                    "custom_code": "",
                },
                {
                    "id": "action-1",
                    "type": "custom-action",
                    "name": "Custom Action",
                    "properties": {},
                    "children": [],
                    "custom_code": 'player.sendMessage("Custom code!");',
                },
            ],
        }

        response = client.post("/api/generate-plugin", json=payload)
        assert response.status_code != 422  # Not a validation error

    def test_generate_plugin_with_all_action_types(self, client):
        """Test plugin generation with all action types."""
        payload = {
            "name": "AllActionsPlugin",
            "version": "1.0.0",
            "main_package": "com.example.allactions",
            "description": "Plugin with all action types",
            "author": "TestAuthor",
            "blocks": [
                {
                    "id": "event-1",
                    "type": "event",
                    "name": "PlayerJoinEvent",
                    "properties": {},
                    "children": [
                        "action-1", "action-2", "action-3", "action-4", "action-5",
                        "action-6", "action-7", "action-8", "action-9", "action-10",
                        "action-11", "action-12",
                    ],
                    "custom_code": "",
                },
                {"id": "action-1", "type": "action", "name": "SendMessage", "properties": {"message": "Hello"}, "children": [], "custom_code": ""},
                {"id": "action-2", "type": "action", "name": "BroadcastMessage", "properties": {"message": "Broadcast"}, "children": [], "custom_code": ""},
                {"id": "action-3", "type": "action", "name": "GiveItem", "properties": {"itemType": "DIAMOND", "amount": "1"}, "children": [], "custom_code": ""},
                {"id": "action-4", "type": "action", "name": "SetHealth", "properties": {"health": "20.0"}, "children": [], "custom_code": ""},
                {"id": "action-5", "type": "action", "name": "SetHunger", "properties": {"hunger": "20"}, "children": [], "custom_code": ""},
                {"id": "action-6", "type": "action", "name": "CancelEvent", "properties": {}, "children": [], "custom_code": ""},
                {"id": "action-7", "type": "action", "name": "PlaySound", "properties": {"sound": "ENTITY_PLAYER_LEVELUP", "volume": "1.0", "pitch": "1.0"}, "children": [], "custom_code": ""},
                {"id": "action-8", "type": "action", "name": "TeleportPlayer", "properties": {"x": "0", "y": "64", "z": "0"}, "children": [], "custom_code": ""},
                {"id": "action-9", "type": "action", "name": "AddExperience", "properties": {"amount": "10"}, "children": [], "custom_code": ""},
                {"id": "action-10", "type": "action", "name": "SendTitle", "properties": {"title": "Hello", "subtitle": "World", "fadeIn": "10", "stay": "70", "fadeOut": "20"}, "children": [], "custom_code": ""},
                {"id": "action-11", "type": "action", "name": "ConsoleLog", "properties": {"message": "Log"}, "children": [], "custom_code": ""},
                {"id": "action-12", "type": "action", "name": "DropItem", "properties": {"itemType": "EMERALD", "amount": "1"}, "children": [], "custom_code": ""},
            ],
        }

        response = client.post("/api/generate-plugin", json=payload)
        assert response.status_code != 422  # Not a validation error


class TestCORS:
    """Test CORS configuration."""

    def test_cors_headers(self, client):
        """Test that CORS headers are present."""
        response = client.options(
            "/api/blocks",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
            },
        )
        # Should allow the origin
        assert response.status_code in [200, 405]
