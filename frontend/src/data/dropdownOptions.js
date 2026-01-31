/**
 * Dropdown options for all action fields.
 * Organized by category for grouped select components.
 */

// ============================================
// ITEMS - Used by GiveItem, DropItem, RemoveItem
// ============================================
export const ITEM_OPTIONS = {
  TOOLS: [
    'WOODEN_PICKAXE', 'STONE_PICKAXE', 'IRON_PICKAXE', 'DIAMOND_PICKAXE', 'GOLDEN_PICKAXE', 'NETHERITE_PICKAXE',
    'WOODEN_AXE', 'STONE_AXE', 'IRON_AXE', 'DIAMOND_AXE', 'GOLDEN_AXE', 'NETHERITE_AXE',
    'WOODEN_SHOVEL', 'STONE_SHOVEL', 'IRON_SHOVEL', 'DIAMOND_SHOVEL', 'GOLDEN_SHOVEL', 'NETHERITE_SHOVEL',
    'WOODEN_HOE', 'STONE_HOE', 'IRON_HOE', 'DIAMOND_HOE', 'GOLDEN_HOE', 'NETHERITE_HOE',
    'WOODEN_SWORD', 'STONE_SWORD', 'IRON_SWORD', 'DIAMOND_SWORD', 'GOLDEN_SWORD', 'NETHERITE_SWORD',
    'FISHING_ROD', 'TRIDENT', 'BOW', 'CROSSBOW',
  ],
  ARMOR: [
    'LEATHER_HELMET', 'LEATHER_CHESTPLATE', 'LEATHER_LEGGINGS', 'LEATHER_BOOTS',
    'CHAINMAIL_HELMET', 'CHAINMAIL_CHESTPLATE', 'CHAINMAIL_LEGGINGS', 'CHAINMAIL_BOOTS',
    'IRON_HELMET', 'IRON_CHESTPLATE', 'IRON_LEGGINGS', 'IRON_BOOTS',
    'DIAMOND_HELMET', 'DIAMOND_CHESTPLATE', 'DIAMOND_LEGGINGS', 'DIAMOND_BOOTS',
    'GOLDEN_HELMET', 'GOLDEN_CHESTPLATE', 'GOLDEN_LEGGINGS', 'GOLDEN_BOOTS',
    'NETHERITE_HELMET', 'NETHERITE_CHESTPLATE', 'NETHERITE_LEGGINGS', 'NETHERITE_BOOTS',
    'ELYTRA', 'TURTLE_HELMET', 'SHIELD',
  ],
  FOOD: [
    'BREAD', 'APPLE', 'GOLDEN_APPLE', 'ENCHANTED_GOLDEN_APPLE',
    'COOKED_BEEF', 'COOKED_PORKCHOP', 'COOKED_CHICKEN', 'COOKED_MUTTON', 'COOKED_COD', 'COOKED_SALMON',
    'BAKED_POTATO', 'COOKIE', 'MELON_SLICE', 'BEETROOT', 'PUMPKIN_PIE', 'CAKE',
    'SWEET_BERRIES', 'GLOW_BERRIES', 'HONEY_BOTTLE', 'RABBIT_STEW', 'MUSHROOM_STEW', 'BEETROOT_SOUP',
  ],
  RESOURCES: [
    'DIAMOND', 'EMERALD', 'LAPIS_LAZULI', 'REDSTONE', 'COAL', 'CHARCOAL',
    'IRON_INGOT', 'GOLD_INGOT', 'COPPER_INGOT', 'NETHERITE_INGOT', 'NETHERITE_SCRAP',
    'AMETHYST_SHARD', 'ENDER_PEARL', 'ENDER_EYE', 'SLIME_BALL', 'BLAZE_ROD', 'GHAST_TEAR', 'NETHER_STAR',
  ],
  BLOCKS: [
    'STONE', 'COBBLESTONE', 'DIRT', 'GRASS_BLOCK',
    'OAK_LOG', 'SPRUCE_LOG', 'BIRCH_LOG', 'JUNGLE_LOG', 'ACACIA_LOG', 'DARK_OAK_LOG', 'MANGROVE_LOG', 'CHERRY_LOG',
    'OAK_PLANKS', 'SPRUCE_PLANKS', 'BIRCH_PLANKS', 'JUNGLE_PLANKS', 'ACACIA_PLANKS', 'DARK_OAK_PLANKS',
    'STONE_BRICKS', 'GLASS', 'SAND', 'GRAVEL',
    'CRAFTING_TABLE', 'FURNACE', 'CHEST', 'LADDER', 'BOOKSHELF',
    'IRON_BLOCK', 'DIAMOND_BLOCK', 'EMERALD_BLOCK', 'GOLD_BLOCK', 'COPPER_BLOCK',
  ],
  MISC: [
    'BUCKET', 'WATER_BUCKET', 'LAVA_BUCKET', 'MILK_BUCKET',
    'COMPASS', 'CLOCK', 'SADDLE', 'LEAD', 'NAME_TAG',
    'STRING', 'LEATHER', 'FEATHER', 'ARROW', 'STICK', 'PAPER',
  ],
};

// ============================================
// SOUNDS - Used by PlaySound
// ============================================
export const SOUND_OPTIONS = {
  'PICKUP & REWARDS': [
    'ENTITY_ITEM_PICKUP',
    'ENTITY_EXPERIENCE_ORB_PICKUP',
  ],
  'PLAYER': [
    'ENTITY_PLAYER_BREATH',
    'ENTITY_PLAYER_DEATH',
    'ENTITY_PLAYER_HURT',
    'ENTITY_PLAYER_LEVELUP',
    'ENTITY_PLAYER_HURT_DROWN',
    'ENTITY_PLAYER_HURT_FREEZE',
  ],
  'GENERIC': [
    'ENTITY_GENERIC_HURT',
    'ENTITY_GENERIC_DEATH',
    'ENTITY_GENERIC_EXPLODE',
  ],
  'BLOCK SOUNDS': [
    'BLOCK_STONE_BREAK',
    'BLOCK_STONE_PLACE',
    'BLOCK_WOOD_BREAK',
    'BLOCK_WOOD_PLACE',
    'BLOCK_GLASS_BREAK',
    'BLOCK_GLASS_PLACE',
    'BLOCK_GRAVEL_BREAK',
    'BLOCK_GRAVEL_PLACE',
  ],
  'SPECIAL': [
    'BLOCK_NOTE_BLOCK_BELL',
    'BLOCK_NOTE_BLOCK_PLING',
    'BLOCK_NOTE_BLOCK_XYLOPHONE',
    'BLOCK_ANVIL_LAND',
    'BLOCK_ANVIL_HIT',
    'BLOCK_PISTON_EXTEND',
    'BLOCK_PISTON_CONTRACT',
  ],
  'MAGIC': [
    'BLOCK_ENCHANTING_TABLE_USE',
    'ENTITY_EVOKER_CAST_SPELL',
    'ENTITY_ENDERMAN_TELEPORT',
  ],
  'UI': [
    'UI_BUTTON_CLICK',
    'UI_TOAST_CHALLENGE_COMPLETE',
  ],
  'CREATURES': [
    'ENTITY_CREEPER_PRIMED',
    'ENTITY_ZOMBIE_AMBIENT',
    'ENTITY_SKELETON_AMBIENT',
    'ENTITY_SPIDER_AMBIENT',
    'ENTITY_ENDERMAN_AMBIENT',
    'ENTITY_PIG_AMBIENT',
    'ENTITY_COW_AMBIENT',
    'ENTITY_SHEEP_AMBIENT',
    'ENTITY_CHICKEN_AMBIENT',
    'ENTITY_WOLF_AMBIENT',
    'ENTITY_CAT_AMBIENT',
  ],
};

// ============================================
// POTION EFFECTS - Used by AddPotionEffect, RemovePotionEffect
// ============================================
export const POTION_EFFECT_OPTIONS = {
  POSITIVE: [
    'SPEED',
    'STRENGTH',
    'JUMP_BOOST',
    'REGENERATION',
    'RESISTANCE',
    'FIRE_RESISTANCE',
    'WATER_BREATHING',
    'NIGHT_VISION',
    'SATURATION',
    'HASTE',
    'HEALTH_BOOST',
    'ABSORPTION',
    'LUCK',
  ],
  NEGATIVE: [
    'SLOWNESS',
    'WEAKNESS',
    'BLINDNESS',
    'MINING_FATIGUE',
    'HUNGER',
    'POISON',
    'WITHER',
    'LEVITATION',
    'UNLUCK',
  ],
  UTILITY: [
    'INVISIBILITY',
    'GLOWING',
    'NAUSEA',
    'SLOW_FALLING',
    'CONDUIT_POWER',
    'DOLPHINS_GRACE',
    'DARKNESS',
  ],
};

// ============================================
// PARTICLES - Used by SpawnParticle
// ============================================
export const PARTICLE_OPTIONS = {
  COMMON: [
    'FLAME',
    'SMOKE_NORMAL',
    'SMOKE_LARGE',
    'HEART',
    'VILLAGER_HAPPY',
    'VILLAGER_ANGRY',
    'CRIT',
    'CRIT_MAGIC',
  ],
  MAGIC: [
    'SPELL',
    'SPELL_INSTANT',
    'SPELL_MOB',
    'SPELL_WITCH',
    'ENCHANTMENT_TABLE',
    'PORTAL',
    'END_ROD',
    'TOTEM',
  ],
  ENVIRONMENT: [
    'WATER_SPLASH',
    'WATER_BUBBLE',
    'WATER_DROP',
    'RAIN',
    'SNOWFLAKE',
    'CLOUD',
    'DUST',
    'FALLING_DUST',
  ],
  EFFECTS: [
    'EXPLOSION_NORMAL',
    'EXPLOSION_LARGE',
    'EXPLOSION_HUGE',
    'LAVA',
    'REDSTONE',
    'NOTE',
    'DRIP_WATER',
    'DRIP_LAVA',
  ],
};

// ============================================
// GAME MODES - Used by SetGameMode
// ============================================
export const GAME_MODE_OPTIONS = [
  { value: 'SURVIVAL', label: 'Survival' },
  { value: 'CREATIVE', label: 'Creative' },
  { value: 'ADVENTURE', label: 'Adventure' },
  { value: 'SPECTATOR', label: 'Spectator' },
];

// ============================================
// TIME PRESETS - Used by SetTime
// ============================================
export const TIME_PRESETS = [
  { value: '0', label: 'Sunrise (0)' },
  { value: '1000', label: 'Day (1000)' },
  { value: '6000', label: 'Noon (6000)' },
  { value: '12000', label: 'Sunset (12000)' },
  { value: '13000', label: 'Night (13000)' },
  { value: '18000', label: 'Midnight (18000)' },
];

// ============================================
// BOOLEAN/TOGGLE OPTIONS
// ============================================
export const BOOLEAN_OPTIONS = [
  { value: 'true', label: 'On' },
  { value: 'false', label: 'Off' },
];

// ============================================
// POTION AMPLIFIER LEVELS
// ============================================
export const AMPLIFIER_OPTIONS = [
  { value: '0', label: 'Level I' },
  { value: '1', label: 'Level II' },
  { value: '2', label: 'Level III' },
  { value: '3', label: 'Level IV' },
  { value: '4', label: 'Level V' },
];

// ============================================
// DURATION PRESETS (in ticks, 20 ticks = 1 second)
// ============================================
export const DURATION_PRESETS = [
  { value: '100', label: '5 seconds' },
  { value: '200', label: '10 seconds' },
  { value: '600', label: '30 seconds' },
  { value: '1200', label: '1 minute' },
  { value: '6000', label: '5 minutes' },
  { value: '12000', label: '10 minutes' },
];

// ============================================
// ACTION FIELD DEFINITIONS
// Defines what fields each action needs and their types
// ============================================
export const ACTION_FIELDS = {
  SendMessage: [
    { name: 'message', label: 'Message', type: 'text', placeholder: 'Enter message... (use %player% for name)' },
  ],
  BroadcastMessage: [
    { name: 'message', label: 'Message', type: 'text', placeholder: 'Broadcast to all players...' },
  ],
  GiveItem: [
    { name: 'itemType', label: 'Item', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'amount', label: 'Amount', type: 'number', min: 1, max: 64, default: '1' },
  ],
  DropItem: [
    { name: 'itemType', label: 'Item', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'amount', label: 'Amount', type: 'number', min: 1, max: 64, default: '1' },
  ],
  SetHealth: [
    { name: 'health', label: 'Health', type: 'slider', min: 0, max: 20, step: 0.5, default: '20', hint: '20 = full health (10 hearts)' },
  ],
  SetHunger: [
    { name: 'hunger', label: 'Hunger', type: 'slider', min: 0, max: 20, step: 1, default: '20', hint: '20 = full hunger' },
  ],
  PlaySound: [
    { name: 'sound', label: 'Sound', type: 'grouped-select', options: SOUND_OPTIONS },
    { name: 'volume', label: 'Volume', type: 'slider', min: 0.1, max: 2.0, step: 0.1, default: '1.0' },
    { name: 'pitch', label: 'Pitch', type: 'slider', min: 0.5, max: 2.0, step: 0.1, default: '1.0' },
  ],
  TeleportPlayer: [
    { name: 'x', label: 'X', type: 'number', default: '0' },
    { name: 'y', label: 'Y', type: 'number', min: -64, max: 320, default: '64' },
    { name: 'z', label: 'Z', type: 'number', default: '0' },
  ],
  AddExperience: [
    { name: 'amount', label: 'XP Amount', type: 'number', min: 1, max: 100000, default: '10' },
  ],
  SetExperienceLevel: [
    { name: 'level', label: 'Level', type: 'number', min: 0, max: 1000, default: '10' },
  ],
  SendTitle: [
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Main title text' },
    { name: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Subtitle text' },
    { name: 'fadeIn', label: 'Fade In', type: 'number', min: 0, max: 100, default: '10', hint: 'ticks' },
    { name: 'stay', label: 'Stay', type: 'number', min: 0, max: 200, default: '70', hint: 'ticks' },
    { name: 'fadeOut', label: 'Fade Out', type: 'number', min: 0, max: 100, default: '20', hint: 'ticks' },
  ],
  SendActionBar: [
    { name: 'message', label: 'Message', type: 'text', placeholder: 'Action bar text...' },
  ],
  ConsoleLog: [
    { name: 'message', label: 'Message', type: 'text', placeholder: 'Log message...' },
  ],
  CancelEvent: [],
  SetGameMode: [
    { name: 'gameMode', label: 'Game Mode', type: 'select', options: GAME_MODE_OPTIONS },
  ],
  AddPotionEffect: [
    { name: 'effectType', label: 'Effect', type: 'grouped-select', options: POTION_EFFECT_OPTIONS },
    { name: 'duration', label: 'Duration', type: 'number', min: 1, max: 99999, default: '200', hint: 'ticks (20 = 1 second)' },
    { name: 'amplifier', label: 'Level', type: 'select', options: AMPLIFIER_OPTIONS, default: '0' },
  ],
  RemovePotionEffect: [
    { name: 'effectType', label: 'Effect', type: 'grouped-select', options: POTION_EFFECT_OPTIONS },
  ],
  SetVelocity: [
    { name: 'x', label: 'X Velocity', type: 'number', min: -10, max: 10, step: 0.1, default: '0' },
    { name: 'y', label: 'Y Velocity', type: 'number', min: -10, max: 10, step: 0.1, default: '1', hint: 'Positive = up' },
    { name: 'z', label: 'Z Velocity', type: 'number', min: -10, max: 10, step: 0.1, default: '0' },
  ],
  SpawnParticle: [
    { name: 'particle', label: 'Particle', type: 'grouped-select', options: PARTICLE_OPTIONS },
    { name: 'count', label: 'Count', type: 'number', min: 1, max: 1000, default: '10' },
  ],
  KillPlayer: [],
  DamagePlayer: [
    { name: 'amount', label: 'Damage', type: 'number', min: 0.5, max: 100, step: 0.5, default: '5', hint: '2 = 1 heart' },
  ],
  ClearInventory: [],
  ExecuteCommand: [
    { name: 'command', label: 'Command', type: 'text', placeholder: 'Command without / (use %player%)' },
  ],
  ExecuteConsoleCommand: [
    { name: 'command', label: 'Command', type: 'text', placeholder: 'Console command (use %player%)' },
  ],
  KickPlayer: [
    { name: 'reason', label: 'Reason', type: 'text', placeholder: 'Kick reason message', default: 'You have been kicked!' },
  ],
  SetTime: [
    { name: 'time', label: 'Time', type: 'select-or-custom', options: TIME_PRESETS, min: 0, max: 24000, default: '6000' },
  ],
  SetWeather: [
    { name: 'storm', label: 'Storm', type: 'select', options: BOOLEAN_OPTIONS, default: 'false' },
    { name: 'duration', label: 'Duration', type: 'number', min: 1, max: 999999, default: '6000', hint: 'ticks' },
  ],
  StrikeLightning: [
    { name: 'damage', label: 'Deal Damage', type: 'select', options: BOOLEAN_OPTIONS, default: 'true' },
  ],
  CreateExplosion: [
    { name: 'power', label: 'Power', type: 'slider', min: 0, max: 10, step: 0.5, default: '4', hint: 'TNT = 4' },
    { name: 'fire', label: 'Set Fire', type: 'select', options: BOOLEAN_OPTIONS, default: 'false' },
    { name: 'breakBlocks', label: 'Break Blocks', type: 'select', options: BOOLEAN_OPTIONS, default: 'false' },
  ],
  SetGlowing: [
    { name: 'glowing', label: 'Glowing', type: 'select', options: BOOLEAN_OPTIONS, default: 'true' },
  ],
  SetInvisible: [
    { name: 'invisible', label: 'Invisible', type: 'select', options: BOOLEAN_OPTIONS, default: 'true' },
  ],
  AllowFlight: [
    { name: 'allow', label: 'Allow Flight', type: 'select', options: BOOLEAN_OPTIONS, default: 'true' },
    { name: 'startFlying', label: 'Start Flying', type: 'select', options: BOOLEAN_OPTIONS, default: 'false' },
  ],
  SetOnFire: [
    { name: 'ticks', label: 'Duration', type: 'number', min: 1, max: 32767, default: '100', hint: 'ticks (20 = 1 second)' },
  ],
};
