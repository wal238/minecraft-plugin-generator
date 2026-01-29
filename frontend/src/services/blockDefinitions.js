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
      id: 'block-break',
      name: 'BlockBreakEvent',
      description: 'Triggered when a player breaks a block',
      color: '#3498db',
      properties: {},
      children: []
    },
    {
      type: 'event',
      id: 'block-place',
      name: 'BlockPlaceEvent',
      description: 'Triggered when a player places a block',
      color: '#3498db',
      properties: {},
      children: []
    }
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
      description: 'Give an item to the player',
      color: '#27ae60',
      properties: { itemType: '', amount: '1' },
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
];
