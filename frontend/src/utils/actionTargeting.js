const PLAYER_EVENTS = new Set([
  'PlayerJoinEvent',
  'PlayerQuitEvent',
  'PlayerMoveEvent',
  'AsyncPlayerChatEvent',
  'PlayerDeathEvent',
  'PlayerRespawnEvent',
  'PlayerInteractEvent',
  'PlayerInteractEntityEvent',
  'PlayerToggleSneakEvent',
  'PlayerToggleSprintEvent',
  'PlayerDropItemEvent',
  'EntityPickupItemEvent',
  'BlockBreakEvent',
  'BlockPlaceEvent',
  'BlockIgniteEvent',
]);

const ENTITY_EVENTS = new Set([
  'EntityDamageEvent',
  'EntityDamageByEntityEvent',
  'EntityDeathEvent',
  'CreatureSpawnEvent',
  'EntitySpawnEvent',
]);

const BLOCK_EVENTS = new Set([
  'BlockBreakEvent',
  'BlockPlaceEvent',
  'BlockBurnEvent',
  'BlockIgniteEvent',
  'BlockGrowEvent',
]);

const WORLD_EVENTS = new Set([
  'WeatherChangeEvent',
  'ThunderChangeEvent',
]);

const WORLD_TARGET_ACTIONS = new Set([
  'SetTime',
  'SetWeather',
  'SetThunder',
  'SpawnEntity',
  'StrikeLightning',
  'StrikeWithLightning',
  'CreateExplosion',
  'SpawnParticle',
  'SpawnParticles',
  'FillRegion',
]);

const TARGET_LABELS = {
  auto: 'Auto',
  player: 'Player',
  event_entity: 'Event Entity',
  event_block: 'Event Block',
  event_world: 'Event World',
};

export const supportsTargeting = (actionName) => WORLD_TARGET_ACTIONS.has(actionName);

export const getEventCapabilities = (eventName) => ({
  hasPlayer: PLAYER_EVENTS.has(eventName),
  hasEntity: ENTITY_EVENTS.has(eventName),
  hasBlock: BLOCK_EVENTS.has(eventName),
  hasWorld: WORLD_EVENTS.has(eventName) || PLAYER_EVENTS.has(eventName) || ENTITY_EVENTS.has(eventName) || BLOCK_EVENTS.has(eventName),
});

export const getAvailableTargets = (actionName, eventName) => {
  if (!supportsTargeting(actionName)) return [];

  const capabilities = getEventCapabilities(eventName);
  const options = [{ value: 'auto', label: TARGET_LABELS.auto }];

  if (capabilities.hasPlayer) {
    options.push({ value: 'player', label: TARGET_LABELS.player });
  }
  if (capabilities.hasEntity) {
    options.push({ value: 'event_entity', label: TARGET_LABELS.event_entity });
  }
  if (capabilities.hasBlock) {
    options.push({ value: 'event_block', label: TARGET_LABELS.event_block });
  }
  if (capabilities.hasWorld) {
    options.push({ value: 'event_world', label: TARGET_LABELS.event_world });
  }

  return options;
};

export const getActionTargetError = (actionName, eventName, targetValue) => {
  if (!supportsTargeting(actionName)) return null;
  if (!eventName) return null;

  const selectedTarget = targetValue || 'auto';
  const available = new Set(getAvailableTargets(actionName, eventName).map((option) => option.value));

  if (!available.has(selectedTarget)) {
    return `${actionName}: target "${selectedTarget}" is not available for ${eventName}.`;
  }

  return null;
};
