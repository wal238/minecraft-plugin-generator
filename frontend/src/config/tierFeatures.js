/**
 * Tier feature configuration — single source of truth for what each tier unlocks.
 * Matches landing page PricingSection specs.
 */

export const TIER_FEATURES = {
  free: {
    maxEvents: 4,
    maxActions: 8,
    maxProjects: 1,
    buildsPerPeriod: 1,
    customGuis: false,
    bossBars: false,
    scoreboards: false,
    configPersistence: false,
    watermark: true,
  },
  premium: {
    maxEvents: 20,
    maxActions: 50,
    maxProjects: -1,
    buildsPerPeriod: 5,
    customGuis: true,
    bossBars: true,
    scoreboards: true,
    configPersistence: true,
    watermark: false,
  },
  pro: {
    maxEvents: -1,
    maxActions: -1,
    maxProjects: -1,
    buildsPerPeriod: 20,
    customGuis: true,
    bossBars: true,
    scoreboards: true,
    configPersistence: true,
    watermark: false,
  },
};

// Map block IDs to the feature flag that gates them
export const PREMIUM_BLOCKS = {
  // GUI system — Premium+
  'on-gui-click': 'customGuis',
  'create-gui': 'customGuis',
  'add-gui-item': 'customGuis',
  'open-gui': 'customGuis',
  // Boss bars — Premium+
  'create-boss-bar': 'bossBars',
  'remove-boss-bar': 'bossBars',
  // Scoreboards — Premium+
  'set-scoreboard': 'scoreboards',
  'remove-scoreboard': 'scoreboards',
  // Config persistence — Premium+
  'save-config': 'configPersistence',
  'send-config-value': 'configPersistence',
};

// Human-readable labels for upgrade prompts
export const FEATURE_LABELS = {
  customGuis: 'Custom GUIs',
  bossBars: 'Boss Bars',
  scoreboards: 'Scoreboards',
  configPersistence: 'Config Persistence',
};

export function getFeatures(tier) {
  return TIER_FEATURES[tier] || TIER_FEATURES.free;
}

export function isBlockLocked(blockId, tier) {
  const feature = PREMIUM_BLOCKS[blockId];
  if (!feature) return false;
  const features = getFeatures(tier);
  return !features[feature];
}

export function getBlockFeatureLabel(blockId) {
  const feature = PREMIUM_BLOCKS[blockId];
  return feature ? FEATURE_LABELS[feature] : null;
}
