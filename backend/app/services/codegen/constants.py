"""Constant mappings for Bukkit/Paper event imports and player accessors."""

import re
from typing import Dict

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
    # Inventory Events
    "InventoryClickEvent": "org.bukkit.event.inventory.InventoryClickEvent",
    "InventoryOpenEvent": "org.bukkit.event.inventory.InventoryOpenEvent",
    "InventoryCloseEvent": "org.bukkit.event.inventory.InventoryCloseEvent",
    # More Player Events
    "PlayerFishEvent": "org.bukkit.event.player.PlayerFishEvent",
    "PlayerBedEnterEvent": "org.bukkit.event.player.PlayerBedEnterEvent",
    "PlayerBedLeaveEvent": "org.bukkit.event.player.PlayerBedLeaveEvent",
    "PlayerChangedWorldEvent": "org.bukkit.event.player.PlayerChangedWorldEvent",
    "PlayerItemConsumeEvent": "org.bukkit.event.player.PlayerItemConsumeEvent",
    "PlayerBucketFillEvent": "org.bukkit.event.player.PlayerBucketFillEvent",
    "PlayerBucketEmptyEvent": "org.bukkit.event.player.PlayerBucketEmptyEvent",
    # More Entity Events
    "ProjectileHitEvent": "org.bukkit.event.entity.ProjectileHitEvent",
    "EntityTameEvent": "org.bukkit.event.entity.EntityTameEvent",
    "EntityExplodeEvent": "org.bukkit.event.entity.EntityExplodeEvent",
    "FoodLevelChangeEvent": "org.bukkit.event.entity.FoodLevelChangeEvent",
    # More Block Events
    "SignChangeEvent": "org.bukkit.event.block.SignChangeEvent",
    # GUI Events
    "OnGUIClick": "org.bukkit.event.inventory.InventoryClickEvent",
}

# Mapping of block event names to Java event class names
EVENT_CLASS_NAMES: Dict[str, str] = {
    "InventoryClickEvent": "InventoryClickEvent",
    "InventoryOpenEvent": "InventoryOpenEvent",
    "InventoryCloseEvent": "InventoryCloseEvent",
    "OnGUIClick": "InventoryClickEvent",
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
    # Inventory events
    "InventoryClickEvent": "(event.getWhoClicked() instanceof Player ? (Player) event.getWhoClicked() : null)",
    "InventoryOpenEvent": "(event.getPlayer() instanceof Player ? (Player) event.getPlayer() : null)",
    "InventoryCloseEvent": "(event.getPlayer() instanceof Player ? (Player) event.getPlayer() : null)",
    # More Player events
    "PlayerFishEvent": "event.getPlayer()",
    "PlayerBedEnterEvent": "event.getPlayer()",
    "PlayerBedLeaveEvent": "event.getPlayer()",
    "PlayerChangedWorldEvent": "event.getPlayer()",
    "PlayerItemConsumeEvent": "event.getPlayer()",
    "PlayerBucketFillEvent": "event.getPlayer()",
    "PlayerBucketEmptyEvent": "event.getPlayer()",
    # More Entity events
    "ProjectileHitEvent": "(event.getEntity().getShooter() instanceof Player ? (Player) event.getEntity().getShooter() : null)",
    "EntityTameEvent": "(event.getOwner() instanceof Player ? (Player) event.getOwner() : null)",
    "EntityExplodeEvent": "null",
    "FoodLevelChangeEvent": "(event.getEntity() instanceof Player ? (Player) event.getEntity() : null)",
    # More Block events
    "SignChangeEvent": "event.getPlayer()",
    # GUI events
    "OnGUIClick": "(event.getWhoClicked() instanceof Player ? (Player) event.getWhoClicked() : null)",
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
    "EntityExplodeEvent",
    "ProjectileHitEvent",
    "EntityTameEvent",
    "FoodLevelChangeEvent",
    "InventoryClickEvent",
    "InventoryOpenEvent",
    "InventoryCloseEvent",
}

BLOCK_EVENT_NAMES: set = {
    "BlockBreakEvent",
    "BlockPlaceEvent",
    "BlockBurnEvent",
    "BlockIgniteEvent",
    "BlockGrowEvent",
    "SignChangeEvent",
}

WORLD_EVENT_NAMES: set = {
    "WeatherChangeEvent",
    "ThunderChangeEvent",
}

# Regex pattern for %argN% placeholders (N is a non-negative integer)
ARG_PLACEHOLDER_RE = re.compile(r"%arg(\d+)%")
