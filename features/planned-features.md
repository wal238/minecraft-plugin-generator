# Planned Features — Minecraft Plugin Builder

## Current State

The builder currently supports **22 event types** and **~65 action types** with linear action execution. All actions fire immediately on event trigger with no branching, delays, or persistence.

---

## Tier 1 — High Impact (Transforms the tool)

### 1. Conditionals & Logic Branching
**What:** If/else blocks with property checks (permission, health, item in hand, game mode, world, etc.)

**Why it matters:** This is the single biggest limitation. Without branching, every action fires unconditionally. Nearly every real plugin needs logic like "if player has permission X" or "if player health < 5".

**Implementation approach:**
- New block type: `CONDITION` that wraps child actions
- Property-based checks: `HasPermission`, `HasItem`, `IsInWorld`, `HealthBelow`, `GameModeEquals`, `IsSneaking`, `IsFlying`, etc.
- Generates `if (condition) { ... }` wrapping the child action code
- Support AND/OR combinators for multiple conditions

---

### 2. Custom Commands
**What:** Register `/mycommand` with arguments, permissions, and tab completion — then attach action blocks to execute when the command runs.

**Why it matters:** Almost every plugin needs custom commands. Currently `ExecuteCommand` only runs existing commands — it doesn't create new ones.

**Implementation approach:**
- New event-like block: `CommandEvent` with properties for command name, description, usage, permission
- Argument blocks: `StringArg`, `PlayerArg`, `IntegerArg` with name and optional/required flag
- Generates a command class registered in `plugin.yml` and `onCommand()` handler
- Child actions execute when command is triggered
- `%arg1%`, `%arg2%` placeholders for argument values in child actions

---

### 3. Scheduled & Delayed Tasks
**What:** "Wait X ticks then do action" and "Repeat every X ticks" wrapper blocks using `BukkitRunnable`.

**Why it matters:** Without this, everything fires instantly. Can't build countdown timers, delayed teleports, repeating effects, or timed game mechanics.

**Implementation approach:**
- `DelayAction` block: wraps child actions, executes after N ticks (20 ticks = 1 second)
- `RepeatAction` block: wraps child actions, executes every N ticks with optional stop-after count
- Generates `new BukkitRunnable() { ... }.runTaskLater(plugin, ticks)` / `.runTaskTimer()`
- Visual tick-to-seconds converter in the UI

---

### 4. Custom Items (ItemMeta)
**What:** Display names, lore lines, enchantments, item flags on items given to players.

**Why it matters:** Currently `GiveItem` only supports Material + amount. No way to give a "Legendary Diamond Sword" with custom name, lore, and Sharpness V.

**Implementation approach:**
- Extend `GiveItem` action properties: `displayName`, `lore` (multi-line), `enchantments` (list of type+level), `itemFlags`
- Generate `ItemStack` with `ItemMeta` configuration
- Support color codes in display name and lore (`&a`, `&b`, etc.)
- Enchantment dropdown with all vanilla enchantments and level selector

---

### 5. Cooldown System
**What:** Prevent actions from being spam-triggered. "Set cooldown for player" and "Check if on cooldown" blocks.

**Why it matters:** Without cooldowns, event-driven actions fire every time with no rate limiting. Players can spam interact events, chat events, etc.

**Implementation approach:**
- `SetCooldown` action: stores player UUID + timestamp in a HashMap
- `CheckCooldown` condition: if player is still on cooldown, skip child actions (or send "wait X seconds" message)
- Generates a static `HashMap<UUID, Long>` in the listener class
- Properties: cooldown name (string), duration (seconds), optional cooldown message

---

## Tier 2 — Opens New Plugin Categories

### 6. Custom GUI Menus
**What:** Chest-based inventory GUIs with clickable items that trigger actions.

**Why it matters:** GUI menus are how most server plugins work — shops, settings, warps, kits. This is one of the most requested features for any plugin.

**Implementation approach:**
- `CreateGUI` block: inventory size (9/18/27/36/45/54), title
- `AddGUIItem` block: slot position, item type, display name, lore
- `OnGUIClick` event block: triggers when player clicks a specific slot
- Generates `Bukkit.createInventory()`, `InventoryClickEvent` listener
- Visual grid editor in the frontend for placing items in slots

---

### 7. Boss Bars
**What:** Create boss bars at the top of the player's screen with customizable color, style, title, and progress.

**Why it matters:** Great for timers, quest progress, announcements, countdowns. Simple API, high visual impact.

**Implementation approach:**
- `CreateBossBar` action: title, color (BLUE/GREEN/PINK/PURPLE/RED/WHITE/YELLOW), style (SOLID/SEGMENTED), progress (0-100%)
- `UpdateBossBar` action: change title or progress
- `ShowBossBar` / `HideBossBar` actions: add/remove players
- Generates `Bukkit.createBossBar()` with stored reference

---

### 8. Scoreboards
**What:** Sidebar scoreboards for displaying stats like kills, money, online time, or custom values.

**Why it matters:** Visible player stats are a core feature of nearly every competitive or RPG server.

**Implementation approach:**
- `CreateScoreboard` block: display name, objective type
- `SetScore` action: player, line text, score value
- `UpdateScoreboard` action: refresh display
- Support `%player%`, `%health%`, `%level%` placeholders in line text
- Pre-built templates: Kill Counter, Online Timer, Custom Stats

---

### 9. Config & Data Persistence
**What:** Save and load player data that survives server restarts using YAML config files.

**Why it matters:** Currently all data is lost on restart. Can't build progression systems, saved preferences, or persistent stats.

**Implementation approach:**
- `SaveToConfig` action: key path + value (e.g., `players.{player}.kills`)
- `LoadFromConfig` action: key path with default value
- Generates `FileConfiguration` + `YamlConfiguration` code
- Auto-creates `config.yml` with defaults
- `%config:key.path%` placeholder for use in messages and conditions

---

### 10. Custom Recipes
**What:** Register shaped, shapeless, and furnace recipes.

**Why it matters:** Custom crafting is a popular plugin category. The visual 3x3 grid maps perfectly to a block-based UI.

**Implementation approach:**
- `ShapedRecipe` block: result item + 3x3 ingredient grid
- `ShapelessRecipe` block: result item + ingredient list
- `FurnaceRecipe` block: input item, result item, cook time, experience
- Visual crafting grid editor in the frontend
- Generates `ShapedRecipe`/`ShapelessRecipe` registration in `onEnable()`

---

## Tier 3 — Nice to Have

### 11. Economy Integration (Vault)
**What:** Give, take, and check player money using the Vault API.

**Why it matters:** Enables shop plugins, reward systems, and pay-to-use features. Depends on server having Vault + an economy plugin installed.

**Implementation approach:**
- `GiveMoney` / `TakeMoney` / `CheckBalance` actions
- `HasEnoughMoney` condition block
- Generates Vault dependency in `pom.xml` and `plugin.yml` (softdepend)
- Service registration in `onEnable()`

---

### 12. Tab List Customization
**What:** Set header and footer text on the player list (Tab key).

**Why it matters:** Quick way to add server branding and live info to the tab screen.

**Implementation approach:**
- `SetTabHeader` / `SetTabFooter` actions with text + color code support
- Generates `player.setPlayerListHeaderFooter()` using Adventure API components

---

### 13. Holograms / Floating Text
**What:** Floating text in the world using armor stands or display entities.

**Why it matters:** Used for labels, waypoints, NPC names, and decorative text.

**Implementation approach:**
- `CreateHologram` action: text, location (x, y, z, world)
- `RemoveHologram` action
- Generates invisible armor stand with custom name, or Text Display entity (1.19.4+)

---

### 14. Particle Trails
**What:** Continuous particle effects that follow a player or loop at a location.

**Why it matters:** Visual flair for VIP players, effects, ambient world decoration. Requires scheduled tasks (Tier 1 #3) first.

**Implementation approach:**
- `CreateParticleTrail` action: particle type, target (player/location), interval
- Generates a repeating `BukkitRunnable` that spawns particles at the target
- `StopParticleTrail` action to cancel

---

## Priority Order for Implementation

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| 1 | Conditionals & Logic | Medium | Critical |
| 2 | Custom Commands | Medium | Critical |
| 3 | Delayed/Repeating Tasks | Medium | Critical |
| 4 | Custom Items (ItemMeta) | Low | High |
| 5 | Cooldowns | Low | High |
| 6 | Custom GUI Menus | High | High |
| 7 | Boss Bars | Low | Medium |
| 8 | Scoreboards | Medium | Medium |
| 9 | Config/Persistence | Medium | High |
| 10 | Custom Recipes | Medium | Medium |
| 11 | Economy (Vault) | Low | Medium |
| 12 | Tab List | Low | Low |
| 13 | Holograms | Low | Low |
| 14 | Particle Trails | Low | Low |
