import React from 'react';
import Tooltip from './Tooltip';

/** Extended descriptions for block types */
const BLOCK_HELP = {
  // Events
  PlayerJoinEvent: 'Drag to canvas. Add actions inside to run when players join.',
  PlayerQuitEvent: 'Triggered when a player disconnects from the server.',
  PlayerMoveEvent: 'Fires frequently when player moves. Use conditions to filter.',
  AsyncPlayerChatEvent: 'Intercept and modify chat messages.',
  PlayerDeathEvent: 'Customize death messages or drop rewards.',
  PlayerRespawnEvent: 'Set spawn location or give items on respawn.',
  PlayerInteractEvent: 'Right/left click on blocks or air.',
  PlayerInteractEntityEvent: 'Right-click on mobs, NPCs, or other entities.',
  PlayerToggleSneakEvent: 'Detect when player starts/stops sneaking (shift).',
  PlayerToggleSprintEvent: 'Detect when player starts/stops sprinting.',
  PlayerDropItemEvent: 'Player drops item from inventory (Q key).',
  EntityPickupItemEvent: 'Player picks up dropped item from ground.',
  BlockBreakEvent: 'Player breaks a block. Can cancel or modify drops.',
  BlockPlaceEvent: 'Player places a block. Can cancel placement.',
  BlockBurnEvent: 'Block is destroyed by fire (no player).',
  BlockIgniteEvent: 'Block catches fire. Player may be null.',
  EntityDamageEvent: 'Any entity takes damage. Check if player.',
  EntityDamageByEntityEvent: 'Entity damaged by another. Good for PvP.',
  EntityDeathEvent: 'Any entity dies. Check entity type.',
  CreatureSpawnEvent: 'Mob spawns naturally or from spawner.',
  WeatherChangeEvent: 'Rain starts or stops in a world.',
  // Actions
  SendMessage: 'Send colored message to the player. Use %player% for name.',
  BroadcastMessage: 'Send message to ALL online players.',
  GiveItem: 'Add item to player inventory.',
  SetHealth: 'Set player health (max 20.0).',
  SetHunger: 'Set player food level (max 20).',
  CancelEvent: 'Prevent the event from happening.',
  PlaySound: 'Play Minecraft sound effect to player.',
  TeleportPlayer: 'Move player to X, Y, Z coordinates.',
  AddExperience: 'Give XP points (not levels).',
  SendTitle: 'Show big title text on screen.',
  ConsoleLog: 'Log message to server console for debugging.',
  DropItem: 'Spawn dropped item at player location.',
  SetGameMode: 'Change SURVIVAL, CREATIVE, ADVENTURE, SPECTATOR.',
  AddPotionEffect: 'Apply potion effect with duration.',
  RemovePotionEffect: 'Remove active potion effect.',
  SetVelocity: 'Launch player in a direction.',
  SendActionBar: 'Show text above hotbar.',
  SpawnParticle: 'Create particle effects.',
  KillPlayer: 'Instantly kill the player.',
  DamagePlayer: 'Deal damage (hearts = amount/2).',
  ClearInventory: 'Remove all items from inventory.',
  SetExperienceLevel: 'Set XP level directly.',
  ExecuteCommand: 'Run command as the player.',
  ExecuteConsoleCommand: 'Run command from server console.',
  KickPlayer: 'Disconnect player with message.',
  SetTime: 'Change world time (0-24000 ticks).',
  SetWeather: 'Toggle rain/thunder in world.',
  StrikeLightning: 'Lightning bolt at player location.',
  CreateExplosion: 'Create explosion (can damage blocks).',
  SetGlowing: 'Player glows through walls.',
  SetInvisible: 'Make player invisible.',
  AllowFlight: 'Enable/disable creative flight.',
  SetOnFire: 'Set player on fire (ticks).',
  // Custom
  'Custom Condition': 'Write Java boolean expression (if statement).',
  'Custom Action': 'Write any Java code for advanced logic.',
};

export default function BlockItem({ block, onDragStart }) {
  const helpText = BLOCK_HELP[block.name] || block.description;

  return (
    <Tooltip text={helpText} position="right">
      <div
        className="block-item"
        draggable
        onDragStart={(e) => onDragStart(e, block)}
        style={{ borderLeftColor: block.color }}
      >
        <div className="block-item-name">{block.name}</div>
        <div className="block-item-description">{block.description}</div>
      </div>
    </Tooltip>
  );
}
