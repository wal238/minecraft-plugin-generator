export const DEFAULT_BLOCKS = {
  events: [
    {
      type: 'event',
      id: 'player-join',
      name: 'PlayerJoinEvent',
      description: 'Triggered when a player joins the server',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'player-quit',
      name: 'PlayerQuitEvent',
      description: 'Triggered when a player leaves the server',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'player-move',
      name: 'PlayerMoveEvent',
      description: 'Triggered when a player moves or rotates',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'player-chat',
      name: 'AsyncPlayerChatEvent',
      description: 'Triggered when a player sends a chat message',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'player-death',
      name: 'PlayerDeathEvent',
      description: 'Triggered when a player dies',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'player-respawn',
      name: 'PlayerRespawnEvent',
      description: 'Triggered when a player respawns',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'player-interact',
      name: 'PlayerInteractEvent',
      description: 'Triggered when a player interacts',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'player-interact-entity',
      name: 'PlayerInteractEntityEvent',
      description: 'Triggered when a player interacts with an entity',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'player-toggle-sneak',
      name: 'PlayerToggleSneakEvent',
      description: 'Triggered when a player toggles sneaking',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'player-toggle-sprint',
      name: 'PlayerToggleSprintEvent',
      description: 'Triggered when a player toggles sprinting',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'player-drop-item',
      name: 'PlayerDropItemEvent',
      description: 'Triggered when a player drops an item',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'player-pickup-item',
      name: 'EntityPickupItemEvent',
      description: 'Triggered when a player picks up an item',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'block-break',
      name: 'BlockBreakEvent',
      description: 'Triggered when a player breaks a block',
      color: '#e67e22',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'block-place',
      name: 'BlockPlaceEvent',
      description: 'Triggered when a player places a block',
      color: '#e67e22',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'block-burn',
      name: 'BlockBurnEvent',
      description: 'Triggered when a block burns',
      color: '#e67e22',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'block-ignite',
      name: 'BlockIgniteEvent',
      description: 'Triggered when a block ignites',
      color: '#e67e22',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'block-grow',
      name: 'BlockGrowEvent',
      description: 'Triggered when a block grows (crops, trees)',
      color: '#e67e22',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'entity-damage',
      name: 'EntityDamageEvent',
      description: 'Triggered when any entity takes damage',
      color: '#e74c3c',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'entity-damage-by-entity',
      name: 'EntityDamageByEntityEvent',
      description: 'Triggered when an entity damages another',
      color: '#e74c3c',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'entity-death',
      name: 'EntityDeathEvent',
      description: 'Triggered when any entity dies',
      color: '#e74c3c',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'entity-spawn',
      name: 'EntitySpawnEvent',
      description: 'Triggered when any entity spawns',
      color: '#e74c3c',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'creature-spawn',
      name: 'CreatureSpawnEvent',
      description: 'Triggered when a mob spawns',
      color: '#e74c3c',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'weather-change',
      name: 'WeatherChangeEvent',
      description: 'Triggered when weather changes',
      color: '#9b59b6',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'thunder-change',
      name: 'ThunderChangeEvent',
      description: 'Triggered when thunder starts or stops',
      color: '#9b59b6',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'server-list-ping',
      name: 'ServerListPingEvent',
      description: 'Triggered when server list is pinged',
      color: '#9b59b6',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'on-gui-click',
      name: 'OnGUIClick',
      description: 'Triggered when a player clicks inside an inventory GUI',
      color: '#1abc9c',
      properties: { guiTitle: '', slot: '-1', cancelEvent: 'true' },
      children: []
    },
    {
      type: 'event',
      id: 'command-event',
      name: 'CommandEvent',
      description: 'Triggered when a player runs a custom command',
      color: '#e74c3c',
      properties: {
        commandName: '',
        commandDescription: '',
        commandUsage: '/<command>',
        commandPermission: '',
        commandAliases: '',
        commandTabCompletions: '',
      },
      children: []
    },
  ],
  actions: [
    {
      type: 'action',
      id: 'send-message',
      name: 'SendMessage',
      description: 'Send a message to the player',
      color: '#27ae60',
      properties: { message: '' },
      children: []
    },
    {
      type: 'action',
      id: 'send-console-message',
      name: 'SendConsoleMessage',
      description: 'Send a message to the console',
      color: '#95a5a6',
      properties: { message: '' },
      children: []
    },
    {
      type: 'action',
      id: 'broadcast-message',
      name: 'BroadcastMessage',
      description: 'Broadcast a message to all players',
      color: '#27ae60',
      properties: { message: '' },
      children: []
    },
    {
      type: 'action',
      id: 'give-item',
      name: 'GiveItem',
      description: 'Give an item to the player (supports custom names, lore, enchantments)',
      color: '#27ae60',
      properties: { itemType: '', amount: '1', displayName: '', lore: '', enchantments: '', itemFlags: '' },
      children: []
    },
    {
      type: 'action',
      id: 'set-health',
      name: 'SetHealth',
      description: 'Set the player health',
      color: '#27ae60',
      properties: { health: '20.0' },
      children: []
    },
    {
      type: 'action',
      id: 'set-hunger',
      name: 'SetHunger',
      description: 'Set the player food level',
      color: '#27ae60',
      properties: { hunger: '20' },
      children: []
    },
    {
      type: 'action',
      id: 'cancel-event',
      name: 'CancelEvent',
      description: 'Cancel the current event',
      color: '#e74c3c',
      properties: {},
      children: []
    },
    {
      type: 'action',
      id: 'play-sound',
      name: 'PlaySound',
      description: 'Play a sound to the player',
      color: '#27ae60',
      properties: { sound: 'ENTITY_EXPERIENCE_ORB_PICKUP', volume: '1.0', pitch: '1.0' },
      children: []
    },
    {
      type: 'action',
      id: 'teleport-player',
      name: 'TeleportPlayer',
      description: 'Teleport the player to coordinates',
      color: '#27ae60',
      properties: { x: '0', y: '64', z: '0' },
      children: []
    },
    {
      type: 'action',
      id: 'add-experience',
      name: 'AddExperience',
      description: 'Give experience points to the player',
      color: '#27ae60',
      properties: { amount: '10' },
      children: []
    },
    {
      type: 'action',
      id: 'send-title',
      name: 'SendTitle',
      description: 'Show a title on the player screen',
      color: '#27ae60',
      properties: { title: '', subtitle: '', fadeIn: '10', stay: '70', fadeOut: '20' },
      children: []
    },
    {
      type: 'action',
      id: 'console-log',
      name: 'ConsoleLog',
      description: 'Log a message to the server console',
      color: '#95a5a6',
      properties: { message: '' },
      children: []
    },
    {
      type: 'action',
      id: 'drop-item',
      name: 'DropItem',
      description: 'Drop an item at the player location',
      color: '#27ae60',
      properties: { itemType: 'DIAMOND', amount: '1' },
      children: []
    },
    {
      type: 'action',
      id: 'remove-item',
      name: 'RemoveItem',
      description: 'Remove an item from the player',
      color: '#27ae60',
      properties: { itemType: 'DIAMOND', amount: '1' },
      children: []
    },
    {
      type: 'action',
      id: 'set-item-in-hand',
      name: 'SetItemInHand',
      description: 'Set the item in player hand',
      color: '#27ae60',
      properties: { itemType: 'DIAMOND_SWORD', hand: 'MAIN_HAND' },
      children: []
    },
    {
      type: 'action',
      id: 'send-actionbar',
      name: 'SendActionBar',
      description: 'Show a message above hotbar',
      color: '#27ae60',
      properties: { message: '' },
      children: []
    },
    {
      type: 'action',
      id: 'set-saturation',
      name: 'SetSaturation',
      description: 'Set player saturation',
      color: '#27ae60',
      properties: { saturation: '5' },
      children: []
    },
    {
      type: 'action',
      id: 'set-game-mode',
      name: 'SetGameMode',
      description: 'Change player game mode',
      color: '#27ae60',
      properties: { gameMode: 'SURVIVAL' },
      children: []
    },
    {
      type: 'action',
      id: 'damage-player',
      name: 'DamagePlayer',
      description: 'Deal damage to player',
      color: '#e74c3c',
      properties: { amount: '5' },
      children: []
    },
    {
      type: 'action',
      id: 'set-experience-level',
      name: 'SetExperienceLevel',
      description: 'Set player level',
      color: '#27ae60',
      properties: { level: '10' },
      children: []
    },
    {
      type: 'action',
      id: 'set-level',
      name: 'SetLevel',
      description: 'Set player level',
      color: '#27ae60',
      properties: { level: '10' },
      children: []
    },
    {
      type: 'action',
      id: 'set-glowing',
      name: 'SetGlowing',
      description: 'Make player glow',
      color: '#27ae60',
      properties: { glowing: 'true' },
      children: []
    },
    {
      type: 'action',
      id: 'set-invisible',
      name: 'SetInvisible',
      description: 'Make player invisible',
      color: '#27ae60',
      properties: { invisible: 'true' },
      children: []
    },
    {
      type: 'action',
      id: 'set-custom-name',
      name: 'SetCustomName',
      description: 'Set player custom name',
      color: '#27ae60',
      properties: { name: '' },
      children: []
    },
    {
      type: 'action',
      id: 'allow-flight',
      name: 'AllowFlight',
      description: 'Allow or disallow flight',
      color: '#27ae60',
      properties: { allow: 'true', startFlying: 'false', speed: '0.2' },
      children: []
    },
    {
      type: 'action',
      id: 'set-on-fire',
      name: 'SetOnFire',
      description: 'Set player on fire',
      color: '#e74c3c',
      properties: { ticks: '100' },
      children: []
    },
    {
      type: 'action',
      id: 'apply-potion-effect',
      name: 'ApplyPotionEffect',
      description: 'Apply a potion effect',
      color: '#27ae60',
      properties: { effectType: 'SPEED', duration: '200', amplifier: '0' },
      children: []
    },
    {
      type: 'action',
      id: 'remove-potion-effect',
      name: 'RemovePotionEffect',
      description: 'Remove a potion effect',
      color: '#27ae60',
      properties: { effectType: 'SPEED' },
      children: []
    },
    {
      type: 'action',
      id: 'grant-permission',
      name: 'GrantPermission',
      description: 'Grant a permission to player',
      color: '#9b59b6',
      properties: { permission: 'vip.commands', value: 'true' },
      children: []
    },
    {
      type: 'action',
      id: 'set-metadata',
      name: 'SetMetadata',
      description: 'Set metadata on player',
      color: '#9b59b6',
      properties: { key: 'key', value: 'value' },
      children: []
    },
    {
      type: 'action',
      id: 'set-block-type',
      name: 'SetBlockType',
      description: 'Set block type at target',
      color: '#e67e22',
      properties: { blockType: 'STONE' },
      children: []
    },
    {
      type: 'action',
      id: 'remove-block',
      name: 'RemoveBlock',
      description: 'Remove target block',
      color: '#e67e22',
      properties: {},
      children: []
    },
    {
      type: 'action',
      id: 'damage-entity',
      name: 'DamageEntity',
      description: 'Deal damage to entity',
      color: '#e74c3c',
      properties: { amount: '5' },
      children: []
    },
    {
      type: 'action',
      id: 'set-entity-health',
      name: 'SetEntityHealth',
      description: 'Set entity health',
      color: '#e74c3c',
      properties: { health: '20' },
      children: []
    },
    {
      type: 'action',
      id: 'teleport-entity',
      name: 'TeleportEntity',
      description: 'Teleport an entity',
      color: '#e74c3c',
      properties: { x: '0', y: '64', z: '0' },
      children: []
    },
    {
      type: 'action',
      id: 'set-entity-velocity',
      name: 'SetEntityVelocity',
      description: 'Set entity velocity',
      color: '#e74c3c',
      properties: { x: '0', y: '1', z: '0' },
      children: []
    },
    {
      type: 'action',
      id: 'apply-entity-potion-effect',
      name: 'ApplyEntityPotionEffect',
      description: 'Apply potion effect to entity',
      color: '#e74c3c',
      properties: { effectType: 'SPEED', duration: '200', amplifier: '0' },
      children: []
    },
    {
      type: 'action',
      id: 'set-entity-on-fire',
      name: 'SetEntityOnFire',
      description: 'Set entity on fire',
      color: '#e74c3c',
      properties: { ticks: '100' },
      children: []
    },
    {
      type: 'action',
      id: 'set-entity-custom-name',
      name: 'SetEntityCustomName',
      description: 'Set entity custom name',
      color: '#e74c3c',
      properties: { name: 'Boss' },
      children: []
    },
    {
      type: 'action',
      id: 'set-entity-equipment',
      name: 'SetEntityEquipment',
      description: 'Set entity equipment',
      color: '#e74c3c',
      properties: {},
      children: []
    },
    {
      type: 'action',
      id: 'set-thunder',
      name: 'SetThunder',
      description: 'Set thunder state',
      color: '#9b59b6',
      properties: { thunder: 'false', duration: '6000' },
      children: []
    },
    {
      type: 'action',
      id: 'spawn-entity',
      name: 'SpawnEntity',
      description: 'Spawn an entity in world',
      color: '#9b59b6',
      properties: { entityType: 'ZOMBIE' },
      children: []
    },
    {
      type: 'action',
      id: 'strike-with-lightning',
      name: 'StrikeWithLightning',
      description: 'Strike lightning at location',
      color: '#9b59b6',
      properties: { damage: 'true' },
      children: []
    },
    {
      type: 'action',
      id: 'spawn-particles',
      name: 'SpawnParticles',
      description: 'Spawn particle effects',
      color: '#27ae60',
      properties: { particle: 'HEART', count: '10' },
      children: []
    },
    {
      type: 'action',
      id: 'fill-region',
      name: 'FillRegion',
      description: 'Fill a region with blocks',
      color: '#e67e22',
      properties: { x1: '0', y1: '64', z1: '0', x2: '10', y2: '70', z2: '10', blockType: 'STONE' },
      children: []
    },
    {
      type: 'action',
      id: 'execute-command-as-player',
      name: 'ExecuteCommandAsPlayer',
      description: 'Execute command as player',
      color: '#9b59b6',
      properties: { command: '' },
      children: []
    },
    {
      type: 'action',
      id: 'string-arg',
      name: 'StringArg',
      description: 'Declare a typed string command argument',
      color: '#16a085',
      properties: { argName: 'textArg', required: 'true', defaultValue: '' },
      children: []
    },
    {
      type: 'action',
      id: 'player-arg',
      name: 'PlayerArg',
      description: 'Declare a typed player command argument',
      color: '#16a085',
      properties: { argName: 'targetPlayer', required: 'true' },
      children: []
    },
    {
      type: 'action',
      id: 'integer-arg',
      name: 'IntegerArg',
      description: 'Declare a typed integer command argument',
      color: '#16a085',
      properties: { argName: 'amount', required: 'true', defaultValue: '1', min: '0', max: '100' },
      children: []
    },
    {
      type: 'action',
      id: 'delay-action',
      name: 'DelayAction',
      description: 'Execute following actions after a delay',
      color: '#8e44ad',
      properties: { delayTicks: '20' },
      children: []
    },
    {
      type: 'action',
      id: 'repeat-action',
      name: 'RepeatAction',
      description: 'Repeat following actions at interval',
      color: '#8e44ad',
      properties: { intervalTicks: '20', repeatCount: '' },
      children: []
    },
    {
      type: 'action',
      id: 'set-cooldown',
      name: 'SetCooldown',
      description: 'Set a cooldown timer for the player',
      color: '#8e44ad',
      properties: { cooldownName: '', duration: '5', cooldownMessage: '' },
      children: []
    },
    {
      type: 'action',
      id: 'check-cooldown',
      name: 'CheckCooldown',
      description: 'Only run following actions if player is NOT on cooldown',
      color: '#f39c12',
      properties: { cooldownName: '', cooldownMessage: '' },
      children: []
    },
    // GUI Menus
    {
      type: 'action',
      id: 'create-gui',
      name: 'CreateGUI',
      description: 'Create a chest GUI inventory',
      color: '#1abc9c',
      properties: { guiTitle: 'My Menu', guiRows: '3' },
      children: []
    },
    {
      type: 'action',
      id: 'add-gui-item',
      name: 'AddGUIItem',
      description: 'Add an item to the GUI at a specific slot',
      color: '#1abc9c',
      properties: { slot: '0', itemType: 'DIAMOND', displayName: '', amount: '1' },
      children: []
    },
    {
      type: 'action',
      id: 'open-gui',
      name: 'OpenGUI',
      description: 'Open the GUI for the player',
      color: '#1abc9c',
      properties: {},
      children: []
    },
    // Temporary Variables
    {
      type: 'action',
      id: 'set-temp-var',
      name: 'SetTempVar',
      description: 'Set a temporary variable for this event execution',
      color: '#34495e',
      properties: { varName: 'selected_item', value: '' },
      children: []
    },
    {
      type: 'action',
      id: 'get-temp-var',
      name: 'GetTempVar',
      description: 'Read a temporary variable and send it to the player',
      color: '#34495e',
      properties: { varName: 'selected_item', messageFormat: 'Value: %value%' },
      children: []
    },
    // Boss Bar
    {
      type: 'action',
      id: 'create-boss-bar',
      name: 'CreateBossBar',
      description: 'Create and show a boss bar to the player',
      color: '#e91e63',
      properties: { title: 'Boss Bar', color: 'RED', style: 'SOLID', progress: '1.0' },
      children: []
    },
    {
      type: 'action',
      id: 'remove-boss-bar',
      name: 'RemoveBossBar',
      description: 'Remove a boss bar from the player',
      color: '#e91e63',
      properties: { title: 'Boss Bar' },
      children: []
    },
    // Scoreboard
    {
      type: 'action',
      id: 'set-scoreboard',
      name: 'SetScoreboard',
      description: 'Create and display a scoreboard to the player',
      color: '#ff9800',
      properties: { title: 'My Scoreboard', lines: 'Line 1|Line 2|Line 3' },
      children: []
    },
    {
      type: 'action',
      id: 'remove-scoreboard',
      name: 'RemoveScoreboard',
      description: 'Remove the custom scoreboard from the player',
      color: '#ff9800',
      properties: {},
      children: []
    },
    // Config & Data Persistence
    {
      type: 'action',
      id: 'save-config',
      name: 'SaveConfig',
      description: 'Save a value to the plugin config file',
      color: '#607d8b',
      properties: { path: 'players.%player%.kills', value: '1' },
      children: []
    },
    {
      type: 'action',
      id: 'send-config-value',
      name: 'SendConfigValue',
      description: 'Send a config value as a message to the player',
      color: '#607d8b',
      properties: { path: 'players.%player%.kills', messageFormat: 'Your kills: %value%' },
      children: []
    },
    // Custom Recipes
    {
      type: 'action',
      id: 'add-shapeless-recipe',
      name: 'AddShapelessRecipe',
      description: 'Register a shapeless crafting recipe',
      color: '#795548',
      properties: { recipeKey: 'my_recipe', resultItem: 'DIAMOND', resultAmount: '1', ingredients: 'COAL,COAL,COAL,COAL' },
      children: []
    },
    {
      type: 'action',
      id: 'branch-if',
      name: 'BranchIf',
      description: 'Start an explicit if branch with optional AND/OR second condition',
      color: '#f39c12',
      properties: {
        firstType: 'HasPermission',
        firstPermission: '',
        firstItemType: 'DIAMOND',
        firstAmount: '1',
        firstWorld: 'world',
        firstHealth: '5',
        firstGameMode: 'SURVIVAL',
        firstCooldownName: '',
        combinator: 'AND',
        secondType: 'None',
        secondPermission: '',
        secondItemType: 'DIAMOND',
        secondAmount: '1',
        secondWorld: 'world',
        secondHealth: '5',
        secondGameMode: 'SURVIVAL',
        secondCooldownName: '',
      },
      children: []
    },
    {
      type: 'action',
      id: 'branch-else',
      name: 'BranchElse',
      description: 'Start else branch for the current BranchIf',
      color: '#f39c12',
      properties: {},
      children: []
    },
    {
      type: 'action',
      id: 'branch-end-if',
      name: 'BranchEndIf',
      description: 'Close the current BranchIf block',
      color: '#f39c12',
      properties: {},
      children: []
    },
    {
      type: 'action',
      id: 'has-permission',
      name: 'HasPermission',
      description: 'Only run following actions if player has a specific permission',
      color: '#f39c12',
      properties: { permission: '' },
      children: []
    },
    {
      type: 'action',
      id: 'has-item',
      name: 'HasItem',
      description: 'Only run following actions if player has a specific item',
      color: '#f39c12',
      properties: { itemType: 'DIAMOND', amount: '1' },
      children: []
    },
    {
      type: 'action',
      id: 'health-above',
      name: 'HealthAbove',
      description: 'Only run following actions if player health is above a value',
      color: '#f39c12',
      properties: { health: '10' },
      children: []
    },
    {
      type: 'action',
      id: 'health-below',
      name: 'HealthBelow',
      description: 'Only run following actions if player health is below a value',
      color: '#f39c12',
      properties: { health: '5' },
      children: []
    },
    {
      type: 'action',
      id: 'gamemode-equals',
      name: 'GameModeEquals',
      description: 'Only run following actions if player is in a specific game mode',
      color: '#f39c12',
      properties: { gameMode: 'SURVIVAL' },
      children: []
    },
    {
      type: 'action',
      id: 'is-in-world',
      name: 'IsInWorld',
      description: 'Only run following actions if player is in a specific world',
      color: '#f39c12',
      properties: { world: 'world' },
      children: []
    },
    {
      type: 'action',
      id: 'is-sneaking',
      name: 'IsSneaking',
      description: 'Only run following actions if player is sneaking',
      color: '#f39c12',
      properties: {},
      children: []
    },
    {
      type: 'action',
      id: 'is-flying',
      name: 'IsFlying',
      description: 'Only run following actions if player is flying',
      color: '#f39c12',
      properties: {},
      children: []
    },
    {
      type: 'action',
      id: 'is-op',
      name: 'IsOp',
      description: 'Only run following actions if player is a server operator',
      color: '#f39c12',
      properties: {},
      children: []
    },
    {
      type: 'action',
      id: 'hunger-above',
      name: 'HungerAbove',
      description: 'Only run following actions if player hunger is above a value',
      color: '#f39c12',
      properties: { hunger: '10' },
      children: []
    },
    {
      type: 'action',
      id: 'hunger-below',
      name: 'HungerBelow',
      description: 'Only run following actions if player hunger is below a value',
      color: '#f39c12',
      properties: { hunger: '5' },
      children: []
    },
    {
      type: 'action',
      id: 'level-above',
      name: 'LevelAbove',
      description: 'Only run following actions if player experience level is above a value',
      color: '#f39c12',
      properties: { level: '10' },
      children: []
    },
  ],
  custom_options: [
    {
      type: 'custom-condition',
      id: 'custom-condition',
      name: 'Custom Condition',
      description: 'Write a custom condition in Java',
      color: '#f39c12',
      properties: {},
      customCode: '',
      children: []
    },
    {
      type: 'custom-action',
      id: 'custom-action',
      name: 'Custom Action',
      description: 'Write a custom action in Java',
      color: '#9b59b6',
      properties: {},
      customCode: '',
      children: []
    }
  ]
};

/**
 * Pre-built templates: event + children combos ready to drop onto the canvas.
 * Each template defines an event and its pre-configured child actions.
 */
export const TEMPLATES = [
  // ── PlayerJoinEvent Templates ──
  {
    id: 'tpl-welcome-message',
    name: 'Welcome Message',
    description: 'Greet players when they join the server',
    color: '#2980b9',
    event: { type: 'event', name: 'PlayerJoinEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'action', name: 'SendMessage', color: '#27ae60', properties: { message: 'Welcome to the server, %player%!' } },
      { type: 'action', name: 'BroadcastMessage', color: '#27ae60', properties: { message: '%player% has joined the game!' } },
    ],
  },
  {
    id: 'tpl-join-kit',
    name: 'Join Starter Kit',
    description: 'Give players items + welcome when they join',
    color: '#2980b9',
    event: { type: 'event', name: 'PlayerJoinEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'action', name: 'SendMessage', color: '#27ae60', properties: { message: 'Here is your starter kit!' } },
      { type: 'action', name: 'GiveItem', color: '#27ae60', properties: { itemType: 'IRON_SWORD', amount: '1' } },
      { type: 'action', name: 'GiveItem', color: '#27ae60', properties: { itemType: 'BREAD', amount: '16' } },
      { type: 'action', name: 'GiveItem', color: '#27ae60', properties: { itemType: 'IRON_PICKAXE', amount: '1' } },
      { type: 'action', name: 'PlaySound', color: '#27ae60', properties: { sound: 'ENTITY_PLAYER_LEVELUP', volume: '1.0', pitch: '1.0' } },
    ],
  },
  {
    id: 'tpl-vip-join',
    name: 'VIP Join Effects',
    description: 'Lightning + broadcast + title when a VIP joins',
    color: '#2980b9',
    event: { type: 'event', name: 'PlayerJoinEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'custom-action', name: 'Custom Action', color: '#9b59b6', properties: {},
        customCode: 'if (player.hasPermission("vip.join")) {\n    player.getWorld().strikeLightning(player.getLocation());\n    Bukkit.broadcastMessage(ChatColor.GOLD + "VIP " + player.getName() + " has joined!");\n    player.sendTitle(ChatColor.GOLD + "Welcome VIP!", ChatColor.YELLOW + "Enjoy your perks", 10, 70, 20);\n}' },
    ],
  },
  {
    id: 'tpl-first-join',
    name: 'First Time Join',
    description: 'Special welcome for new players with starter items',
    color: '#2980b9',
    event: { type: 'event', name: 'PlayerJoinEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'custom-action', name: 'Custom Action', color: '#9b59b6', properties: {},
        customCode: 'if (!player.hasPlayedBefore()) {\n    player.sendMessage(ChatColor.GREEN + "Welcome to the server for the first time!");\n    player.getInventory().addItem(new ItemStack(Material.DIAMOND, 5));\n    player.getInventory().addItem(new ItemStack(Material.COOKED_BEEF, 32));\n    player.setHealth(20.0);\n    player.setFoodLevel(20);\n    Bukkit.broadcastMessage(ChatColor.AQUA + player.getName() + " is new! Say hello!");\n}' },
    ],
  },
  {
    id: 'tpl-join-heal',
    name: 'Join Full Heal',
    description: 'Restore health and hunger on join',
    color: '#2980b9',
    event: { type: 'event', name: 'PlayerJoinEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'action', name: 'SetHealth', color: '#27ae60', properties: { health: '20.0' } },
      { type: 'action', name: 'SetHunger', color: '#27ae60', properties: { hunger: '20' } },
      { type: 'action', name: 'SendMessage', color: '#27ae60', properties: { message: 'You have been fully healed!' } },
      { type: 'action', name: 'PlaySound', color: '#27ae60', properties: { sound: 'ENTITY_PLAYER_LEVELUP', volume: '1.0', pitch: '1.5' } },
    ],
  },

  // ── PlayerQuitEvent Templates ──
  {
    id: 'tpl-quit-broadcast',
    name: 'Quit Broadcast',
    description: 'Broadcast when a player leaves',
    color: '#2980b9',
    event: { type: 'event', name: 'PlayerQuitEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'action', name: 'BroadcastMessage', color: '#27ae60', properties: { message: '%player% has left the server.' } },
      { type: 'action', name: 'ConsoleLog', color: '#95a5a6', properties: { message: 'Player %player% disconnected' } },
    ],
  },
  {
    id: 'tpl-quit-silent',
    name: 'Silent Quit',
    description: 'Hide the default quit message',
    color: '#2980b9',
    event: { type: 'event', name: 'PlayerQuitEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'custom-action', name: 'Custom Action', color: '#9b59b6', properties: {},
        customCode: 'event.setQuitMessage(null);' },
    ],
  },
  {
    id: 'tpl-quit-save-location',
    name: 'Quit Save & Log',
    description: 'Log player location on quit for debugging',
    color: '#2980b9',
    event: { type: 'event', name: 'PlayerQuitEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'custom-action', name: 'Custom Action', color: '#9b59b6', properties: {},
        customCode: 'org.bukkit.Location loc = player.getLocation();\nBukkit.getLogger().info(player.getName() + " quit at " + loc.getBlockX() + ", " + loc.getBlockY() + ", " + loc.getBlockZ());' },
    ],
  },
  {
    id: 'tpl-quit-effects',
    name: 'Quit Lightning Effect',
    description: 'Strike lightning where the player was standing',
    color: '#2980b9',
    event: { type: 'event', name: 'PlayerQuitEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'custom-action', name: 'Custom Action', color: '#9b59b6', properties: {},
        customCode: 'player.getWorld().strikeLightningEffect(player.getLocation());\nevent.setQuitMessage(ChatColor.RED + player.getName() + " vanished in a flash!");' },
    ],
  },

  // ── BlockBreakEvent Templates ──
  {
    id: 'tpl-prevent-break',
    name: 'Prevent Block Breaking',
    description: 'Cancel block break without permission',
    color: '#2980b9',
    event: { type: 'event', name: 'BlockBreakEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'custom-action', name: 'Custom Action', color: '#9b59b6', properties: {},
        customCode: 'if (!player.hasPermission("build.break")) {\n    event.setCancelled(true);\n    player.sendMessage(ChatColor.RED + "You cannot break blocks here!");\n}' },
    ],
  },
  {
    id: 'tpl-break-reward',
    name: 'Mining Reward',
    description: 'Give XP and play sound when breaking blocks',
    color: '#2980b9',
    event: { type: 'event', name: 'BlockBreakEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'action', name: 'AddExperience', color: '#27ae60', properties: { amount: '5' } },
      { type: 'action', name: 'PlaySound', color: '#27ae60', properties: { sound: 'ENTITY_EXPERIENCE_ORB_PICKUP', volume: '1.0', pitch: '1.2' } },
    ],
  },
  {
    id: 'tpl-break-diamond-alert',
    name: 'Diamond Alert',
    description: 'Broadcast when someone mines diamond ore',
    color: '#2980b9',
    event: { type: 'event', name: 'BlockBreakEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'custom-action', name: 'Custom Action', color: '#9b59b6', properties: {},
        customCode: 'Material type = event.getBlock().getType();\nif (type == Material.DIAMOND_ORE || type == Material.DEEPSLATE_DIAMOND_ORE) {\n    Bukkit.broadcastMessage(ChatColor.AQUA + player.getName() + " found diamonds!");\n    player.playSound(player.getLocation(), Sound.ENTITY_PLAYER_LEVELUP, 1.0f, 1.0f);\n}' },
    ],
  },
  {
    id: 'tpl-break-drop-bonus',
    name: 'Double Drops',
    description: 'Drop an extra item when breaking any block',
    color: '#2980b9',
    event: { type: 'event', name: 'BlockBreakEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'custom-action', name: 'Custom Action', color: '#9b59b6', properties: {},
        customCode: 'for (ItemStack drop : event.getBlock().getDrops(player.getInventory().getItemInMainHand())) {\n    event.getBlock().getWorld().dropItemNaturally(event.getBlock().getLocation(), drop);\n}' },
    ],
  },

  // ── BlockPlaceEvent Templates ──
  {
    id: 'tpl-no-place',
    name: 'Prevent Block Placing',
    description: 'Stop players from placing blocks without permission',
    color: '#2980b9',
    event: { type: 'event', name: 'BlockPlaceEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'custom-action', name: 'Custom Action', color: '#9b59b6', properties: {},
        customCode: 'if (!player.hasPermission("build.place")) {\n    event.setCancelled(true);\n    player.sendMessage(ChatColor.RED + "You cannot place blocks here!");\n}' },
    ],
  },
  {
    id: 'tpl-place-log',
    name: 'Place Logger',
    description: 'Log all block placements to console',
    color: '#2980b9',
    event: { type: 'event', name: 'BlockPlaceEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'custom-action', name: 'Custom Action', color: '#9b59b6', properties: {},
        customCode: 'org.bukkit.Location loc = event.getBlock().getLocation();\nBukkit.getLogger().info(player.getName() + " placed " + event.getBlock().getType() + " at " + loc.getBlockX() + ", " + loc.getBlockY() + ", " + loc.getBlockZ());' },
    ],
  },
  {
    id: 'tpl-place-no-tnt',
    name: 'Prevent TNT Placement',
    description: 'Block TNT placement for non-ops',
    color: '#2980b9',
    event: { type: 'event', name: 'BlockPlaceEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'custom-action', name: 'Custom Action', color: '#9b59b6', properties: {},
        customCode: 'if (event.getBlock().getType() == Material.TNT && !player.isOp()) {\n    event.setCancelled(true);\n    player.sendMessage(ChatColor.RED + "TNT placement is disabled!");\n}' },
    ],
  },
  {
    id: 'tpl-place-no-lava',
    name: 'Prevent Lava Placement',
    description: 'Block lava bucket usage without permission',
    color: '#2980b9',
    event: { type: 'event', name: 'BlockPlaceEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'custom-action', name: 'Custom Action', color: '#9b59b6', properties: {},
        customCode: 'if (event.getBlock().getType() == Material.LAVA && !player.hasPermission("place.lava")) {\n    event.setCancelled(true);\n    player.sendMessage(ChatColor.RED + "You cannot place lava here!");\n}' },
    ],
  },
  {
    id: 'tpl-place-sound',
    name: 'Place Sound Effect',
    description: 'Play a sound when placing blocks',
    color: '#2980b9',
    event: { type: 'event', name: 'BlockPlaceEvent', color: '#3498db', properties: {} },
    children: [
      { type: 'action', name: 'PlaySound', color: '#27ae60', properties: { sound: 'BLOCK_NOTE_BLOCK_PLING', volume: '0.5', pitch: '1.5' } },
    ],
  },
  // ── Chat Templates ──
  {
    id: 'tpl-chat-filter',
    name: 'Chat Filter',
    description: 'Filter and replace banned words in chat',
    color: '#2980b9',
    event: { type: 'event', name: 'AsyncPlayerChatEvent', color: '#3498db', properties: {} },
    children: [
      {
        type: 'custom-action',
        name: 'Custom Action',
        color: '#9b59b6',
        properties: {},
        customCode: 'String msg = event.getMessage();\nmsg = msg.replaceAll("(?i)badword", "***");\nevent.setMessage(msg);'
      },
    ],
  },
  // ── Death Templates ──
  {
    id: 'tpl-death-message',
    name: 'Death Message Customization',
    description: 'Set a custom death message and play a sound',
    color: '#2980b9',
    event: { type: 'event', name: 'PlayerDeathEvent', color: '#3498db', properties: {} },
    children: [
      {
        type: 'custom-action',
        name: 'Custom Action',
        color: '#9b59b6',
        properties: {},
        customCode: 'event.setDeathMessage(ChatColor.RED + player.getName() + " was eliminated!");\nplayer.getWorld().playSound(player.getLocation(), Sound.ENTITY_WITHER_DEATH, 1.0f, 1.0f);'
      },
    ],
  },
];
