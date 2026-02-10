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
// ENTITIES - Used by SpawnEntity
// ============================================
export const ENTITY_OPTIONS = {
  PASSIVE: [
    'ALLAY', 'ARMADILLO', 'AXOLOTL', 'BAT', 'BEE', 'CAMEL', 'CAT', 'CHICKEN', 'COD', 'COW',
    'DONKEY', 'FOX', 'FROG', 'GLOW_SQUID', 'GOAT', 'HORSE', 'IRON_GOLEM', 'LLAMA', 'MOOSHROOM',
    'MULE', 'OCELOT', 'PANDA', 'PARROT', 'PIG', 'POLAR_BEAR', 'PUFFERFISH', 'RABBIT', 'SALMON',
    'SHEEP', 'SKELETON_HORSE', 'SNIFFER', 'SNOW_GOLEM', 'SQUID', 'STRIDER', 'TADPOLE', 'TRADER_LLAMA',
    'TROPICAL_FISH', 'TURTLE', 'VILLAGER', 'WANDERING_TRADER', 'WOLF',
  ],
  HOSTILE: [
    'BLAZE', 'BOGGED', 'BREEZE', 'CAVE_SPIDER', 'CREEPER', 'DROWNED', 'ELDER_GUARDIAN', 'ENDERMAN',
    'ENDERMITE', 'EVOKER', 'GHAST', 'GUARDIAN', 'HOGLIN', 'HUSK', 'MAGMA_CUBE', 'PHANTOM', 'PIGLIN',
    'PIGLIN_BRUTE', 'PILLAGER', 'RAVAGER', 'SHULKER', 'SILVERFISH', 'SKELETON', 'SLIME', 'SPIDER',
    'STRAY', 'VEX', 'VINDICATOR', 'WARDEN', 'WITCH', 'WITHER_SKELETON', 'ZOGLIN', 'ZOMBIE',
    'ZOMBIE_VILLAGER', 'ZOMBIFIED_PIGLIN',
  ],
  BOSSES: [
    'ENDER_DRAGON', 'WITHER',
  ],
  UTILITY: [
    'ARMOR_STAND', 'BLOCK_DISPLAY', 'CHEST_BOAT', 'COMMAND_BLOCK_MINECART', 'FALLING_BLOCK',
    'FURNACE_MINECART', 'GLOW_ITEM_FRAME', 'HOPPER_MINECART', 'INTERACTION', 'ITEM_DISPLAY',
    'ITEM_FRAME', 'LEASH_KNOT', 'MARKER', 'MINECART', 'PAINTING', 'SPAWNER_MINECART',
    'TNT_MINECART', 'TEXT_DISPLAY',
  ],
};

// ============================================
// WORLDS - Fallback if backend world fetch fails
// ============================================
export const WORLD_FALLBACK_OPTIONS = [
  { value: 'world', label: 'world' },
  { value: 'world_nether', label: 'world_nether' },
  { value: 'world_the_end', label: 'world_the_end' },
];

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

export const REQUIRED_OPTIONS = [
  { value: 'true', label: 'Required' },
  { value: 'false', label: 'Optional' },
];

export const BRANCH_CONDITION_TYPE_OPTIONS = [
  { value: 'HasPermission', label: 'Has Permission' },
  { value: 'HasItem', label: 'Has Item' },
  { value: 'IsInWorld', label: 'Is In World' },
  { value: 'HealthBelow', label: 'Health Below' },
  { value: 'HealthAbove', label: 'Health Above' },
  { value: 'GameModeEquals', label: 'Game Mode Equals' },
  { value: 'IsSneaking', label: 'Is Sneaking' },
  { value: 'IsFlying', label: 'Is Flying' },
  { value: 'IsOp', label: 'Is Op' },
  { value: 'CheckCooldown', label: 'Cooldown Ready' },
  { value: 'None', label: 'None (disable condition)' },
];

export const BRANCH_COMBINATOR_OPTIONS = [
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' },
];

// ============================================
// HAND OPTIONS - Used by SetItemInHand
// ============================================
export const HAND_OPTIONS = [
  { value: 'MAIN_HAND', label: 'Main Hand' },
  { value: 'OFF_HAND', label: 'Off Hand' },
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
// ENCHANTMENTS - Used by GiveItem ItemMeta
// ============================================
export const ENCHANTMENT_OPTIONS = {
  WEAPONS: [
    'SHARPNESS', 'SMITE', 'BANE_OF_ARTHROPODS', 'KNOCKBACK', 'FIRE_ASPECT',
    'LOOTING', 'SWEEPING_EDGE',
  ],
  TOOLS: [
    'EFFICIENCY', 'SILK_TOUCH', 'UNBREAKING', 'FORTUNE', 'MENDING',
  ],
  ARMOR: [
    'PROTECTION', 'FIRE_PROTECTION', 'BLAST_PROTECTION', 'PROJECTILE_PROTECTION',
    'THORNS', 'RESPIRATION', 'AQUA_AFFINITY', 'DEPTH_STRIDER', 'FROST_WALKER',
    'SOUL_SPEED', 'SWIFT_SNEAK',
  ],
  BOW: [
    'POWER', 'PUNCH', 'FLAME', 'INFINITY',
  ],
  FISHING: [
    'LUCK_OF_THE_SEA', 'LURE',
  ],
  TRIDENT: [
    'LOYALTY', 'IMPALING', 'RIPTIDE', 'CHANNELING',
  ],
  CROSSBOW: [
    'MULTISHOT', 'QUICK_CHARGE', 'PIERCING',
  ],
  GENERAL: [
    'VANISHING_CURSE', 'BINDING_CURSE',
  ],
};

// ============================================
// ITEM FLAGS - Used by GiveItem ItemMeta
// ============================================
export const ITEM_FLAG_OPTIONS = [
  { value: 'HIDE_ENCHANTS', label: 'Hide Enchants' },
  { value: 'HIDE_ATTRIBUTES', label: 'Hide Attributes' },
  { value: 'HIDE_UNBREAKABLE', label: 'Hide Unbreakable' },
  { value: 'HIDE_DESTROYS', label: 'Hide Destroys' },
  { value: 'HIDE_PLACED_ON', label: 'Hide Placed On' },
  { value: 'HIDE_DYE', label: 'Hide Dye' },
];

// ============================================
// TICK PRESETS - Used by DelayAction, RepeatAction
// ============================================
export const TICK_PRESETS = [
  { value: '1', label: '1 tick (0.05s)' },
  { value: '10', label: '10 ticks (0.5s)' },
  { value: '20', label: '1 second' },
  { value: '40', label: '2 seconds' },
  { value: '60', label: '3 seconds' },
  { value: '100', label: '5 seconds' },
  { value: '200', label: '10 seconds' },
  { value: '600', label: '30 seconds' },
  { value: '1200', label: '1 minute' },
  { value: '6000', label: '5 minutes' },
];

// ============================================
// ACTION FIELD DEFINITIONS
// Defines what fields each action needs and their types
// ============================================
export const ACTION_FIELDS = {
  SendMessage: [
    { name: 'message', label: 'Message', type: 'text', placeholder: 'Enter message... (use %player% for name)' },
  ],
  SendConsoleMessage: [
    { name: 'message', label: 'Message', type: 'text', placeholder: 'Console message...' },
  ],
  BroadcastMessage: [
    { name: 'message', label: 'Message', type: 'text', placeholder: 'Broadcast to all players...' },
  ],
  GiveItem: [
    { name: 'itemType', label: 'Item', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'amount', label: 'Amount', type: 'number', min: 1, max: 64, default: '1' },
    { name: 'displayName', label: 'Display Name', type: 'text', placeholder: 'Custom name (use & for colors, e.g. &6Golden Sword)' },
    { name: 'lore', label: 'Lore Lines', type: 'text', placeholder: 'Line 1|Line 2|Line 3 (separate with |)' },
    { name: 'enchantments', label: 'Enchantments', type: 'text', placeholder: 'SHARPNESS:5,UNBREAKING:3' },
    { name: 'itemFlags', label: 'Item Flags', type: 'text', placeholder: 'HIDE_ENCHANTS,HIDE_ATTRIBUTES' },
  ],
  DropItem: [
    { name: 'itemType', label: 'Item', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'amount', label: 'Amount', type: 'number', min: 1, max: 64, default: '1' },
  ],
  RemoveItem: [
    { name: 'itemType', label: 'Item', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'amount', label: 'Amount', type: 'number', min: 1, max: 64, default: '1' },
  ],
  SetItemInHand: [
    { name: 'itemType', label: 'Item', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'hand', label: 'Hand', type: 'select', options: HAND_OPTIONS, default: 'MAIN_HAND' },
  ],
  SetHealth: [
    { name: 'health', label: 'Health', type: 'slider', min: 0, max: 20, step: 0.5, default: '20', hint: '20 = full health (10 hearts)' },
  ],
  SetHunger: [
    { name: 'hunger', label: 'Hunger', type: 'slider', min: 0, max: 20, step: 1, default: '20', hint: '20 = full hunger' },
  ],
  SetSaturation: [
    { name: 'saturation', label: 'Saturation', type: 'slider', min: 0, max: 20, step: 0.5, default: '5', hint: 'Prevents hunger decay' },
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
    { name: 'world', label: 'World', type: 'select', optionsKey: 'worlds', options: WORLD_FALLBACK_OPTIONS },
    { name: 'yaw', label: 'Yaw', type: 'number', placeholder: '0 (optional)' },
    { name: 'pitch', label: 'Pitch', type: 'number', placeholder: '0 (optional)' },
  ],
  AddExperience: [
    { name: 'amount', label: 'XP Amount', type: 'number', min: 1, max: 100000, default: '10' },
  ],
  SetLevel: [
    { name: 'level', label: 'Level', type: 'number', min: 0, max: 10000, default: '10' },
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
  ApplyPotionEffect: [
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
    { name: 'offsetX', label: 'Offset X', type: 'number', min: 0, max: 10, step: 0.1, default: '0' },
    { name: 'offsetY', label: 'Offset Y', type: 'number', min: 0, max: 10, step: 0.1, default: '0' },
    { name: 'offsetZ', label: 'Offset Z', type: 'number', min: 0, max: 10, step: 0.1, default: '0' },
    { name: 'speed', label: 'Speed', type: 'number', min: 0, max: 10, step: 0.1, default: '0' },
  ],
  SpawnParticles: [
    { name: 'particle', label: 'Particle', type: 'grouped-select', options: PARTICLE_OPTIONS },
    { name: 'count', label: 'Count', type: 'number', min: 1, max: 1000, default: '10' },
    { name: 'offsetX', label: 'Offset X', type: 'number', min: 0, max: 10, step: 0.1, default: '0' },
    { name: 'offsetY', label: 'Offset Y', type: 'number', min: 0, max: 10, step: 0.1, default: '0' },
    { name: 'offsetZ', label: 'Offset Z', type: 'number', min: 0, max: 10, step: 0.1, default: '0' },
    { name: 'speed', label: 'Speed', type: 'number', min: 0, max: 10, step: 0.1, default: '0' },
  ],
  KillPlayer: [],
  DamagePlayer: [
    { name: 'amount', label: 'Damage', type: 'number', min: 0.5, max: 100, step: 0.5, default: '5', hint: '2 = 1 heart' },
  ],
  DamageEntity: [
    { name: 'amount', label: 'Damage', type: 'number', min: 0.5, max: 100, step: 0.5, default: '5' },
  ],
  SetEntityHealth: [
    { name: 'health', label: 'Health', type: 'slider', min: 0, max: 40, step: 0.5, default: '20' },
  ],
  TeleportEntity: [
    { name: 'x', label: 'X', type: 'number', default: '0' },
    { name: 'y', label: 'Y', type: 'number', min: -64, max: 320, default: '64' },
    { name: 'z', label: 'Z', type: 'number', default: '0' },
    { name: 'world', label: 'World', type: 'select', optionsKey: 'worlds', options: WORLD_FALLBACK_OPTIONS },
  ],
  SetEntityVelocity: [
    { name: 'x', label: 'X Velocity', type: 'number', min: -10, max: 10, step: 0.1, default: '0' },
    { name: 'y', label: 'Y Velocity', type: 'number', min: -10, max: 10, step: 0.1, default: '1' },
    { name: 'z', label: 'Z Velocity', type: 'number', min: -10, max: 10, step: 0.1, default: '0' },
  ],
  ApplyEntityPotionEffect: [
    { name: 'effectType', label: 'Effect', type: 'grouped-select', options: POTION_EFFECT_OPTIONS },
    { name: 'duration', label: 'Duration', type: 'number', min: 1, max: 99999, default: '200', hint: 'ticks (20 = 1 second)' },
    { name: 'amplifier', label: 'Level', type: 'select', options: AMPLIFIER_OPTIONS, default: '0' },
  ],
  SetEntityOnFire: [
    { name: 'ticks', label: 'Duration', type: 'number', min: 1, max: 32767, default: '100', hint: 'ticks (20 = 1 second)' },
  ],
  SetEntityCustomName: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Entity name' },
  ],
  SetEntityEquipment: [
    { name: 'helmet', label: 'Helmet', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'chestplate', label: 'Chestplate', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'leggings', label: 'Leggings', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'boots', label: 'Boots', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'mainHand', label: 'Main Hand', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'offHand', label: 'Off Hand', type: 'grouped-select', options: ITEM_OPTIONS },
  ],
  ClearInventory: [],
  ExecuteCommand: [
    { name: 'command', label: 'Command', type: 'text', placeholder: 'Command without / (use %player%)' },
  ],
  ExecuteCommandAsPlayer: [
    { name: 'command', label: 'Command', type: 'text', placeholder: 'Command without / (use %player%)' },
  ],
  StringArg: [
    { name: 'argName', label: 'Argument Name', type: 'text', placeholder: 'targetName', required: true },
    { name: 'required', label: 'Requirement', type: 'select', options: REQUIRED_OPTIONS, default: 'true' },
    { name: 'defaultValue', label: 'Default Value', type: 'text', placeholder: 'Used when optional and not provided' },
  ],
  PlayerArg: [
    { name: 'argName', label: 'Argument Name', type: 'text', placeholder: 'targetPlayer', required: true },
    { name: 'required', label: 'Requirement', type: 'select', options: REQUIRED_OPTIONS, default: 'true' },
  ],
  IntegerArg: [
    { name: 'argName', label: 'Argument Name', type: 'text', placeholder: 'amount', required: true },
    { name: 'required', label: 'Requirement', type: 'select', options: REQUIRED_OPTIONS, default: 'true' },
    { name: 'defaultValue', label: 'Default Value', type: 'number', default: '1' },
    { name: 'min', label: 'Minimum (optional)', type: 'number', placeholder: '0' },
    { name: 'max', label: 'Maximum (optional)', type: 'number', placeholder: '100' },
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
  SetThunder: [
    { name: 'thunder', label: 'Thunder', type: 'select', options: BOOLEAN_OPTIONS, default: 'false' },
    { name: 'duration', label: 'Duration', type: 'number', min: 1, max: 999999, default: '6000', hint: 'ticks' },
  ],
  SpawnEntity: [
    { name: 'entityType', label: 'Entity Type', type: 'grouped-select', options: ENTITY_OPTIONS },
  ],
  StrikeLightning: [
    { name: 'damage', label: 'Deal Damage', type: 'select', options: BOOLEAN_OPTIONS, default: 'true' },
  ],
  StrikeWithLightning: [
    { name: 'damage', label: 'Deal Damage', type: 'select', options: BOOLEAN_OPTIONS, default: 'true' },
  ],
  CreateExplosion: [
    { name: 'power', label: 'Power', type: 'slider', min: 0, max: 10, step: 0.5, default: '4', hint: 'TNT = 4' },
    { name: 'fire', label: 'Set Fire', type: 'select', options: BOOLEAN_OPTIONS, default: 'false' },
    { name: 'breakBlocks', label: 'Break Blocks', type: 'select', options: BOOLEAN_OPTIONS, default: 'false' },
  ],
  SetBlockType: [
    { name: 'blockType', label: 'Block Type', type: 'grouped-select', options: ITEM_OPTIONS },
  ],
  RemoveBlock: [],
  FillRegion: [
    { name: 'x1', label: 'X1', type: 'number', default: '0' },
    { name: 'y1', label: 'Y1', type: 'number', default: '64' },
    { name: 'z1', label: 'Z1', type: 'number', default: '0' },
    { name: 'x2', label: 'X2', type: 'number', default: '10' },
    { name: 'y2', label: 'Y2', type: 'number', default: '70' },
    { name: 'z2', label: 'Z2', type: 'number', default: '10' },
    { name: 'blockType', label: 'Block Type', type: 'grouped-select', options: ITEM_OPTIONS },
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
    { name: 'speed', label: 'Speed', type: 'number', min: 0.1, max: 1.0, step: 0.1, default: '0.2' },
  ],
  SetOnFire: [
    { name: 'ticks', label: 'Duration', type: 'number', min: 1, max: 32767, default: '100', hint: 'ticks (20 = 1 second)' },
  ],
  SetCustomName: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Player name tag' },
  ],
  GrantPermission: [
    { name: 'permission', label: 'Permission', type: 'text', placeholder: 'vip.commands' },
    { name: 'value', label: 'Value', type: 'select', options: BOOLEAN_OPTIONS, default: 'true' },
  ],
  SetMetadata: [
    { name: 'key', label: 'Key', type: 'text', placeholder: 'key' },
    { name: 'value', label: 'Value', type: 'text', placeholder: 'value' },
  ],
  DelayAction: [
    { name: 'delayTicks', label: 'Delay', type: 'select-or-custom', options: TICK_PRESETS, min: 1, max: 72000, default: '20', hint: 'ticks (20 = 1 second)' },
  ],
  RepeatAction: [
    { name: 'intervalTicks', label: 'Interval', type: 'select-or-custom', options: TICK_PRESETS, min: 1, max: 72000, default: '20', hint: 'ticks (20 = 1 second)' },
    { name: 'repeatCount', label: 'Repeat Count', type: 'number', min: 0, max: 100000, default: '0', hint: '0 = infinite' },
  ],
  SetCooldown: [
    { name: 'cooldownName', label: 'Cooldown Name', type: 'text', placeholder: 'my_cooldown', required: true },
    { name: 'duration', label: 'Duration (seconds)', type: 'number', min: 1, max: 86400, default: '5', hint: 'seconds' },
    { name: 'cooldownMessage', label: 'Message (optional)', type: 'text', placeholder: 'Please wait %remaining% seconds!' },
  ],
  SetTempVar: [
    { name: 'varName', label: 'Variable Name', type: 'text', placeholder: 'selected_item', required: true },
    { name: 'value', label: 'Value', type: 'text', placeholder: 'Use text, %player%, or %arg0%' },
  ],
  GetTempVar: [
    { name: 'varName', label: 'Variable Name', type: 'text', placeholder: 'selected_item', required: true },
    { name: 'messageFormat', label: 'Message Format', type: 'text', placeholder: 'Value: %value%', default: 'Value: %value%' },
  ],
  CheckCooldown: [
    { name: 'cooldownName', label: 'Cooldown Name', type: 'text', placeholder: 'my_cooldown', required: true },
    { name: 'cooldownMessage', label: 'Deny Message', type: 'text', placeholder: 'Please wait %remaining% seconds!' },
  ],
  BranchIf: [
    { name: 'firstType', label: 'Primary Condition', type: 'select', options: BRANCH_CONDITION_TYPE_OPTIONS, default: 'HasPermission' },
    { name: 'firstPermission', label: 'Primary Permission', type: 'text', placeholder: 'myplugin.admin' },
    { name: 'firstItemType', label: 'Primary Item', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'firstAmount', label: 'Primary Item Amount', type: 'number', min: 1, max: 64, default: '1' },
    { name: 'firstWorld', label: 'Primary World', type: 'text', placeholder: 'world' },
    { name: 'firstHealth', label: 'Primary Health', type: 'slider', min: 0, max: 20, step: 0.5, default: '5' },
    { name: 'firstGameMode', label: 'Primary Game Mode', type: 'select', options: GAME_MODE_OPTIONS, default: 'SURVIVAL' },
    { name: 'firstCooldownName', label: 'Primary Cooldown', type: 'text', placeholder: 'my_cooldown' },
    { name: 'combinator', label: 'Combine With', type: 'select', options: BRANCH_COMBINATOR_OPTIONS, default: 'AND' },
    { name: 'secondType', label: 'Secondary Condition', type: 'select', options: BRANCH_CONDITION_TYPE_OPTIONS, default: 'None' },
    { name: 'secondPermission', label: 'Secondary Permission', type: 'text', placeholder: 'myplugin.vip' },
    { name: 'secondItemType', label: 'Secondary Item', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'secondAmount', label: 'Secondary Item Amount', type: 'number', min: 1, max: 64, default: '1' },
    { name: 'secondWorld', label: 'Secondary World', type: 'text', placeholder: 'world' },
    { name: 'secondHealth', label: 'Secondary Health', type: 'slider', min: 0, max: 20, step: 0.5, default: '5' },
    { name: 'secondGameMode', label: 'Secondary Game Mode', type: 'select', options: GAME_MODE_OPTIONS, default: 'SURVIVAL' },
    { name: 'secondCooldownName', label: 'Secondary Cooldown', type: 'text', placeholder: 'my_cooldown' },
  ],
  BranchElse: [],
  BranchEndIf: [],
  HasPermission: [
    { name: 'permission', label: 'Permission Node', type: 'text', placeholder: 'myplugin.admin' },
  ],
  HasItem: [
    { name: 'itemType', label: 'Item', type: 'grouped-select', options: ITEM_OPTIONS },
    { name: 'amount', label: 'Minimum Amount', type: 'number', min: 1, max: 64, default: '1' },
  ],
  HealthAbove: [
    { name: 'health', label: 'Health Threshold', type: 'slider', min: 0, max: 20, step: 0.5, default: '10', hint: '20 = full health (10 hearts)' },
  ],
  HealthBelow: [
    { name: 'health', label: 'Health Threshold', type: 'slider', min: 0, max: 20, step: 0.5, default: '5', hint: '20 = full health (10 hearts)' },
  ],
  GameModeEquals: [
    { name: 'gameMode', label: 'Game Mode', type: 'select', options: GAME_MODE_OPTIONS, default: 'SURVIVAL' },
  ],
  IsInWorld: [
    { name: 'world', label: 'World Name', type: 'text', placeholder: 'world' },
  ],
  IsSneaking: [],
  IsFlying: [],
  IsOp: [],
  HungerAbove: [
    { name: 'hunger', label: 'Hunger Threshold', type: 'slider', min: 0, max: 20, step: 1, default: '10', hint: '20 = full hunger bar' },
  ],
  HungerBelow: [
    { name: 'hunger', label: 'Hunger Threshold', type: 'slider', min: 0, max: 20, step: 1, default: '5', hint: '20 = full hunger bar' },
  ],
  LevelAbove: [
    { name: 'level', label: 'Level Threshold', type: 'number', min: 0, max: 1000, default: '10' },
  ],
  CommandEvent: [
    { name: 'commandName', label: 'Command Name', type: 'text', placeholder: 'mycommand (without the /)', required: true },
    { name: 'commandDescription', label: 'Description', type: 'text', placeholder: 'What does this command do?' },
    { name: 'commandUsage', label: 'Usage', type: 'text', placeholder: '/<command> [args]' },
    { name: 'commandPermission', label: 'Permission', type: 'text', placeholder: 'myplugin.mycommand (leave empty for no permission)' },
    { name: 'commandAliases', label: 'Aliases', type: 'text', placeholder: 'Comma-separated aliases, e.g. mc,mycmd' },
    { name: 'commandTabCompletions', label: 'Tab Completions', type: 'text', placeholder: 'Comma-separated suggestions, e.g. reload,status,help' },
  ],
  OnGUIClick: [
    { name: 'guiTitle', label: 'GUI Title (optional)', type: 'text', placeholder: 'My Menu' },
    { name: 'slot', label: 'Slot Filter', type: 'number', min: -1, max: 53, default: '-1', hint: '-1 = any slot' },
    { name: 'cancelEvent', label: 'Cancel Click', type: 'select', options: BOOLEAN_OPTIONS, default: 'true' },
  ],
};
