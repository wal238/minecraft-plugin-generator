/**
 * Minecraft Material enum items for GiveItem and DropItem actions.
 * Organized by category for easy browsing in the UI.
 */

export const ITEM_CATEGORIES = {
  popular: {
    label: 'Popular',
    items: [
      'DIAMOND', 'GOLDEN_APPLE', 'EMERALD', 'DIAMOND_SWORD', 'IRON_PICKAXE',
      'BREAD', 'OAK_LOG', 'STONE_PICKAXE', 'NETHERITE_INGOT', 'ENCHANTED_GOLDEN_APPLE',
    ],
  },
  tools: {
    label: 'Tools',
    items: [
      // Pickaxes
      'WOODEN_PICKAXE', 'STONE_PICKAXE', 'IRON_PICKAXE', 'DIAMOND_PICKAXE', 'GOLDEN_PICKAXE', 'NETHERITE_PICKAXE',
      // Axes
      'WOODEN_AXE', 'STONE_AXE', 'IRON_AXE', 'DIAMOND_AXE', 'GOLDEN_AXE', 'NETHERITE_AXE',
      // Shovels
      'WOODEN_SHOVEL', 'STONE_SHOVEL', 'IRON_SHOVEL', 'DIAMOND_SHOVEL', 'GOLDEN_SHOVEL', 'NETHERITE_SHOVEL',
      // Hoes
      'WOODEN_HOE', 'STONE_HOE', 'IRON_HOE', 'DIAMOND_HOE', 'GOLDEN_HOE', 'NETHERITE_HOE',
      // Swords
      'WOODEN_SWORD', 'STONE_SWORD', 'IRON_SWORD', 'DIAMOND_SWORD', 'GOLDEN_SWORD', 'NETHERITE_SWORD',
      // Other
      'FISHING_ROD', 'CARROT_ON_A_STICK', 'BRUSH', 'FLINT_AND_STEEL', 'SHEARS',
    ],
  },
  armor: {
    label: 'Armor',
    items: [
      // Helmets
      'LEATHER_HELMET', 'CHAINMAIL_HELMET', 'IRON_HELMET', 'DIAMOND_HELMET', 'GOLDEN_HELMET', 'NETHERITE_HELMET', 'TURTLE_HELMET',
      // Chestplates
      'LEATHER_CHESTPLATE', 'CHAINMAIL_CHESTPLATE', 'IRON_CHESTPLATE', 'DIAMOND_CHESTPLATE', 'GOLDEN_CHESTPLATE', 'NETHERITE_CHESTPLATE',
      // Leggings
      'LEATHER_LEGGINGS', 'CHAINMAIL_LEGGINGS', 'IRON_LEGGINGS', 'DIAMOND_LEGGINGS', 'GOLDEN_LEGGINGS', 'NETHERITE_LEGGINGS',
      // Boots
      'LEATHER_BOOTS', 'CHAINMAIL_BOOTS', 'IRON_BOOTS', 'DIAMOND_BOOTS', 'GOLDEN_BOOTS', 'NETHERITE_BOOTS',
      // Special
      'ELYTRA', 'SHIELD',
    ],
  },
  combat: {
    label: 'Combat',
    items: [
      'BOW', 'CROSSBOW', 'ARROW', 'SPECTRAL_ARROW', 'TIPPED_ARROW', 'TRIDENT', 'MACE',
    ],
  },
  food: {
    label: 'Food',
    items: [
      // Cooked
      'COOKED_BEEF', 'COOKED_PORKCHOP', 'COOKED_CHICKEN', 'COOKED_MUTTON', 'COOKED_COD', 'COOKED_SALMON',
      // Raw
      'BEEF', 'PORKCHOP', 'CHICKEN', 'MUTTON', 'COD', 'SALMON', 'TROPICAL_FISH', 'PUFFERFISH',
      // Basic
      'BREAD', 'COOKIE', 'APPLE', 'GOLDEN_APPLE', 'ENCHANTED_GOLDEN_APPLE', 'BAKED_POTATO', 'POTATO', 'CARROT',
      'MELON_SLICE', 'BEETROOT', 'DRIED_KELP', 'MUSHROOM_STEW', 'BEETROOT_SOUP', 'RABBIT_STEW',
      // Special
      'HONEY_BOTTLE', 'PUMPKIN_PIE', 'CAKE', 'SWEET_BERRIES', 'GLOW_BERRIES', 'CHORUS_FRUIT',
    ],
  },
  resources: {
    label: 'Resources',
    items: [
      // Raw
      'RAW_IRON', 'RAW_COPPER', 'RAW_GOLD',
      // Refined
      'IRON_INGOT', 'GOLD_INGOT', 'COPPER_INGOT', 'DIAMOND', 'EMERALD', 'LAPIS_LAZULI', 'REDSTONE', 'COAL', 'CHARCOAL',
      // Special
      'NETHERITE_INGOT', 'NETHERITE_SCRAP', 'AMETHYST_SHARD', 'ENDER_PEARL', 'ENDER_EYE',
      'SLIME_BALL', 'BLAZE_ROD', 'GHAST_TEAR', 'NETHER_STAR',
    ],
  },
  blocks: {
    label: 'Blocks',
    items: [
      // Wood
      'OAK_LOG', 'SPRUCE_LOG', 'BIRCH_LOG', 'JUNGLE_LOG', 'ACACIA_LOG', 'DARK_OAK_LOG', 'MANGROVE_LOG', 'CHERRY_LOG',
      'OAK_PLANKS', 'SPRUCE_PLANKS', 'BIRCH_PLANKS', 'JUNGLE_PLANKS', 'ACACIA_PLANKS', 'DARK_OAK_PLANKS',
      // Stone
      'STONE', 'COBBLESTONE', 'MOSSY_COBBLESTONE', 'STONE_BRICKS', 'MOSSY_STONE_BRICKS', 'CRACKED_STONE_BRICKS',
      'DEEPSLATE', 'COBBLED_DEEPSLATE', 'DEEPSLATE_BRICKS',
      // Dirt/Grass
      'DIRT', 'GRASS_BLOCK', 'PODZOL', 'MYCELIUM', 'SAND', 'RED_SAND', 'GRAVEL',
      // Refined
      'IRON_BLOCK', 'DIAMOND_BLOCK', 'EMERALD_BLOCK', 'GOLD_BLOCK', 'COPPER_BLOCK', 'LAPIS_BLOCK', 'REDSTONE_BLOCK', 'COAL_BLOCK', 'NETHERITE_BLOCK',
      // Utility
      'CRAFTING_TABLE', 'FURNACE', 'BLAST_FURNACE', 'SMOKER', 'CHEST', 'ENDER_CHEST', 'BARREL', 'HOPPER', 'DISPENSER', 'DROPPER',
      // Decorative
      'GLASS', 'TINTED_GLASS', 'GLOWSTONE', 'SEA_LANTERN', 'LANTERN', 'SOUL_LANTERN', 'TORCH', 'BOOKSHELF',
    ],
  },
  ores: {
    label: 'Ores',
    items: [
      'COAL_ORE', 'IRON_ORE', 'COPPER_ORE', 'GOLD_ORE', 'REDSTONE_ORE', 'EMERALD_ORE', 'LAPIS_ORE', 'DIAMOND_ORE',
      'DEEPSLATE_COAL_ORE', 'DEEPSLATE_IRON_ORE', 'DEEPSLATE_COPPER_ORE', 'DEEPSLATE_GOLD_ORE',
      'DEEPSLATE_REDSTONE_ORE', 'DEEPSLATE_EMERALD_ORE', 'DEEPSLATE_LAPIS_ORE', 'DEEPSLATE_DIAMOND_ORE',
      'NETHER_GOLD_ORE', 'NETHER_QUARTZ_ORE', 'ANCIENT_DEBRIS',
    ],
  },
  utility: {
    label: 'Utility',
    items: [
      // Buckets
      'BUCKET', 'WATER_BUCKET', 'LAVA_BUCKET', 'MILK_BUCKET', 'POWDER_SNOW_BUCKET', 'AXOLOTL_BUCKET',
      // Books
      'BOOK', 'ENCHANTED_BOOK', 'WRITABLE_BOOK', 'WRITTEN_BOOK', 'NAME_TAG', 'PAPER', 'MAP', 'FILLED_MAP',
      // Misc
      'COMPASS', 'RECOVERY_COMPASS', 'CLOCK', 'LEAD', 'SADDLE', 'STICK', 'STRING', 'LEATHER', 'FEATHER',
      'BONE', 'BONE_MEAL', 'GUNPOWDER', 'EXPERIENCE_BOTTLE', 'FIREWORK_ROCKET', 'TOTEM_OF_UNDYING',
    ],
  },
  dyes: {
    label: 'Dyes',
    items: [
      'WHITE_DYE', 'ORANGE_DYE', 'MAGENTA_DYE', 'LIGHT_BLUE_DYE', 'YELLOW_DYE', 'LIME_DYE', 'PINK_DYE', 'GRAY_DYE',
      'LIGHT_GRAY_DYE', 'CYAN_DYE', 'PURPLE_DYE', 'BLUE_DYE', 'BROWN_DYE', 'GREEN_DYE', 'RED_DYE', 'BLACK_DYE',
    ],
  },
  wool: {
    label: 'Wool',
    items: [
      'WHITE_WOOL', 'ORANGE_WOOL', 'MAGENTA_WOOL', 'LIGHT_BLUE_WOOL', 'YELLOW_WOOL', 'LIME_WOOL', 'PINK_WOOL', 'GRAY_WOOL',
      'LIGHT_GRAY_WOOL', 'CYAN_WOOL', 'PURPLE_WOOL', 'BLUE_WOOL', 'BROWN_WOOL', 'GREEN_WOOL', 'RED_WOOL', 'BLACK_WOOL',
    ],
  },
  potions: {
    label: 'Potions',
    items: [
      'POTION', 'SPLASH_POTION', 'LINGERING_POTION', 'GLASS_BOTTLE',
      'BLAZE_POWDER', 'MAGMA_CREAM', 'FERMENTED_SPIDER_EYE', 'SPIDER_EYE', 'GLISTERING_MELON_SLICE',
      'GOLDEN_CARROT', 'RABBIT_FOOT', 'DRAGON_BREATH', 'PHANTOM_MEMBRANE',
    ],
  },
  spawn_eggs: {
    label: 'Spawn Eggs',
    items: [
      'ZOMBIE_SPAWN_EGG', 'SKELETON_SPAWN_EGG', 'CREEPER_SPAWN_EGG', 'ENDERMAN_SPAWN_EGG', 'BLAZE_SPAWN_EGG',
      'WITCH_SPAWN_EGG', 'GHAST_SPAWN_EGG', 'WITHER_SKELETON_SPAWN_EGG', 'PIG_SPAWN_EGG', 'SHEEP_SPAWN_EGG',
      'COW_SPAWN_EGG', 'CHICKEN_SPAWN_EGG', 'HORSE_SPAWN_EGG', 'WOLF_SPAWN_EGG', 'CAT_SPAWN_EGG',
      'RABBIT_SPAWN_EGG', 'LLAMA_SPAWN_EGG', 'PARROT_SPAWN_EGG', 'VILLAGER_SPAWN_EGG', 'IRON_GOLEM_SPAWN_EGG',
      'AXOLOTL_SPAWN_EGG', 'GOAT_SPAWN_EGG', 'ALLAY_SPAWN_EGG', 'FROG_SPAWN_EGG', 'WARDEN_SPAWN_EGG',
    ],
  },
  decorative: {
    label: 'Decorative',
    items: [
      // Flowers
      'POPPY', 'BLUE_ORCHID', 'ALLIUM', 'AZURE_BLUET', 'RED_TULIP', 'ORANGE_TULIP', 'WHITE_TULIP', 'PINK_TULIP',
      'OXEYE_DAISY', 'CORNFLOWER', 'LILY_OF_THE_VALLEY', 'WITHER_ROSE', 'SUNFLOWER', 'LILAC', 'ROSE_BUSH', 'PEONY', 'TORCHFLOWER',
      // Other
      'ITEM_FRAME', 'GLOW_ITEM_FRAME', 'PAINTING', 'ARMOR_STAND', 'END_ROD', 'LIGHTNING_ROD',
      'AMETHYST_BLOCK', 'BUDDING_AMETHYST', 'AMETHYST_CLUSTER',
    ],
  },
  music: {
    label: 'Music Discs',
    items: [
      'MUSIC_DISC_11', 'MUSIC_DISC_13', 'MUSIC_DISC_BLOCKS', 'MUSIC_DISC_CAT', 'MUSIC_DISC_CHIRP',
      'MUSIC_DISC_FAR', 'MUSIC_DISC_MALL', 'MUSIC_DISC_MELLOHI', 'MUSIC_DISC_STAL', 'MUSIC_DISC_STRAD',
      'MUSIC_DISC_WAIT', 'MUSIC_DISC_WARD', 'MUSIC_DISC_PIGSTEP', 'MUSIC_DISC_OTHERSIDE', 'MUSIC_DISC_5', 'MUSIC_DISC_RELIC',
    ],
  },
};

// Flatten all items into a single searchable array
export const ALL_ITEMS = Object.values(ITEM_CATEGORIES).flatMap((cat) => cat.items);

// Remove duplicates (popular items appear in multiple categories)
export const UNIQUE_ITEMS = [...new Set(ALL_ITEMS)].sort();

// Get display name from material name (DIAMOND_SWORD -> Diamond Sword)
export function getItemDisplayName(material) {
  return material
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
