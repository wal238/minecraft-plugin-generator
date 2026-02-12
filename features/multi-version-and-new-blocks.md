# Paper API Multi-Version Support + Missing Features

## Context
The plugin builder is currently hardcoded to Paper API 1.21.1. Users can't target older servers (1.20.x is still widely used). Additionally, the Paper API offers many more events, actions, and conditions than we currently expose. This plan adds version selection and fills the biggest feature gaps in a phased rollout.

---

## Phase 1: Multi-Version Support Infrastructure
**Goal:** Let users choose a Paper API version; pom.xml, plugin.yml, and Java target adjust accordingly.

### Supported Versions

| Display Label | Maven Artifact Version | api-version (plugin.yml) | Java Target |
|---|---|---|---|
| 1.20.1 | 1.20.1-R0.1-SNAPSHOT | 1.20 | 17 |
| 1.20.4 | 1.20.4-R0.1-SNAPSHOT | 1.20 | 17 |
| 1.20.6 | 1.20.6-R0.1-SNAPSHOT | 1.20 | 17 |
| 1.21.1 (default) | 1.21.1-R0.1-SNAPSHOT | 1.21 | 21 |
| 1.21.4 | 1.21.4-R0.1-SNAPSHOT | 1.21 | 21 |

### Files to Change

1. **Backend — Config Model (`plugin_config.py`)**
   - Add `paper_version: str = "1.21.1"` field with validation against allowed versions

2. **Backend — Version Constants (new file: `backend/app/services/codegen/version_config.py`)**
   - Create `PAPER_VERSIONS` dict mapping version string → `{ maven_version, api_version, java_version }`
   - Helper: `get_version_config(version_str) -> dict`

3. **Backend — Template Generators (`template_generators.py`)**
   - `generate_pom_xml()`: Replace hardcoded `1.21.1-R0.1-SNAPSHOT` and Java 21 with values from version config
   - `generate_plugin_yml()`: Add `api-version: X.XX` field using version config

4. **Backend — Code Generator (`code_generator.py`)**
   - Pass `paper_version` through to template generators

5. **Frontend — Version Selector UI**
   - Add Paper version dropdown to the plugin settings panel (where name/author/version are configured)
   - Store `paperVersion` in plugin config state
   - Send `paper_version` field in API request payload

6. **Frontend — Block Definitions (`blockDefinitions.js`)**
   - Add `minVersion` field to blocks that are version-specific (e.g., 1.21-only items)
   - Filter blocks in palette based on selected version

7. **Backend — Dropdown Options (`dropdownOptions.js`)**
   - Tag version-specific items/entities (e.g., Armadillo is 1.20.5+, Breeze is 1.21+)

---

## Phase 2: New Events (15 events)
**Goal:** Add high-value events that unlock new plugin categories.

### Events to Add

| Event | Import | Player Accessor | Has Player? |
|---|---|---|---|
| InventoryClickEvent | `org.bukkit.event.inventory.InventoryClickEvent` | `(Player) event.getWhoClicked()` | cast |
| InventoryOpenEvent | `org.bukkit.event.inventory.InventoryOpenEvent` | `(Player) event.getPlayer()` | yes |
| InventoryCloseEvent | `org.bukkit.event.inventory.InventoryCloseEvent` | `(Player) event.getPlayer()` | yes |
| ProjectileHitEvent | `org.bukkit.event.entity.ProjectileHitEvent` | `(event.getEntity().getShooter() instanceof Player ? (Player) event.getEntity().getShooter() : null)` | cast |
| PlayerFishEvent | `org.bukkit.event.player.PlayerFishEvent` | `event.getPlayer()` | yes |
| PlayerBedEnterEvent | `org.bukkit.event.player.PlayerBedEnterEvent` | `event.getPlayer()` | yes |
| PlayerBedLeaveEvent | `org.bukkit.event.player.PlayerBedLeaveEvent` | `event.getPlayer()` | yes |
| EntityTameEvent | `org.bukkit.event.entity.EntityTameEvent` | `(event.getOwner() instanceof Player ? (Player) event.getOwner() : null)` | cast |
| PlayerChangedWorldEvent | `org.bukkit.event.player.PlayerChangedWorldEvent` | `event.getPlayer()` | yes |
| PlayerItemConsumeEvent | `org.bukkit.event.player.PlayerItemConsumeEvent` | `event.getPlayer()` | yes |
| EntityExplodeEvent | `org.bukkit.event.entity.EntityExplodeEvent` | `null` | no |
| PlayerBucketFillEvent | `org.bukkit.event.player.PlayerBucketFillEvent` | `event.getPlayer()` | yes |
| PlayerBucketEmptyEvent | `org.bukkit.event.player.PlayerBucketEmptyEvent` | `event.getPlayer()` | yes |
| FoodLevelChangeEvent | `org.bukkit.event.entity.FoodLevelChangeEvent` | `(event.getEntity() instanceof Player ? (Player) event.getEntity() : null)` | cast |
| SignChangeEvent | `org.bukkit.event.block.SignChangeEvent` | `event.getPlayer()` | yes |

### Files to Change
- `constants.py` — Add entries to `EVENT_IMPORTS`, `EVENT_PLAYER_ACCESSOR`, `EVENTS_WITHOUT_PLAYER`, `BLOCK_EVENT_NAMES`
- `block_definitions.py` — Add event block definitions
- `blockDefinitions.js` — Add frontend event entries with descriptions and categories

---

## Phase 3: New Actions (18 actions)
**Goal:** Add the most-requested missing actions.

### Actions to Add

| Action | What it generates | Priority |
|---|---|---|
| CancelEvent | `event.setCancelled(true);` | Critical |
| SetArmor | `player.getInventory().setHelmet/Chestplate/Leggings/Boots()` | High |
| LaunchProjectile | `player.launchProjectile(Snowball.class)` etc. | High |
| SpawnFirework | `FireworkMeta` with colors, effects, power | High |
| SetMaxHealth | `player.getAttribute(Attribute.GENERIC_MAX_HEALTH).setBaseValue()` | High |
| HealPlayer | `player.setHealth(Math.min(player.getHealth() + amount, max))` | Medium |
| FeedPlayer | `player.setFoodLevel(Math.min(player.getFoodLevel() + amount, 20))` | Medium |
| SetSpawnLocation | `player.setBedSpawnLocation(loc, true)` | Medium |
| CloseInventory | `player.closeInventory()` | Medium |
| SendTabHeaderFooter | `player.sendPlayerListHeaderAndFooter(header, footer)` | Medium |
| SetWorldBorder | `player.getWorld().getWorldBorder().setSize/Center()` | Medium |
| SpawnFallingBlock | `world.spawnFallingBlock(loc, blockData)` | Medium |
| OpenBook | `player.openBook(Book.builder()...)` | Low |
| SetResourcePack | `player.setResourcePack(url, hash)` | Low |
| RideEntity | `entity.addPassenger(player)` | Low |
| AddShapedRecipe | `ShapedRecipe` with 3x3 grid | Low |
| SetWalkSpeed | `player.setWalkSpeed(speed)` | Low |
| SetFlySpeed | `player.setFlySpeed(speed)` | Low |

### Files to Change
- `action_generators.py` — Add `_gen_*` functions for each action
- `block_definitions.py` — Add action block definitions with properties
- `blockDefinitions.js` — Add frontend action entries
- `dropdownOptions.js` — Add projectile types, firework effects, armor slots

---

## Phase 4: New Conditions (12 conditions)
**Goal:** Add conditions for richer logic branching.

### Conditions to Add

| Condition | Java Check |
|---|---|
| IsHoldingItem | `player.getInventory().getItemInMainHand().getType() == Material.X` |
| IsRaining | `player.getWorld().hasStorm()` |
| IsThundering | `player.getWorld().isThundering()` |
| HasPotionEffect | `player.hasPotionEffect(PotionEffectType.X)` |
| IsOnGround | `player.isOnGround()` |
| IsInWater | `player.isInWater()` |
| RandomChance | `Math.random() < X / 100.0` |
| BlockIsType | `event.getBlock().getType() == Material.X` |
| TimeIsDay | `world.getTime() >= 0 && world.getTime() < 12300` |
| TimeIsNight | `world.getTime() >= 12300` |
| IsInBiome | `player.getLocation().getBlock().getBiome() == Biome.X` |
| HasExperience | `player.getTotalExperience() >= X` |

### Files to Change
- `action_generators.py` — Add guard clause generation for each condition
- `block_definitions.py` — Add condition block definitions
- `blockDefinitions.js` — Add frontend condition entries
- `dropdownOptions.js` — Add biome types dropdown

---

## Phase 5: Expanded Dropdown Options
**Goal:** Update material, entity, sound, particle, and enchantment lists for 1.21 content.

### What to Add
- **Materials:** Trial chamber blocks, copper variants, tuff variants, cherry wood, bamboo wood, armadillo scute, wind charge, etc.
- **Entities:** Breeze, Bogged, Armadillo (tag as `minVersion: "1.21"` or `"1.20.5"`)
- **Sounds:** Wind charge, vault, trial spawner sounds
- **Particles:** Trial spawner particles, new 1.21 particles
- **Enchantments:** Wind Burst, Density, Breach (1.21+)
- **Biomes:** Full biome list for the new IsInBiome condition

### Files to Change
- `dropdownOptions.js` — Primary file for all dropdown data

---

## Implementation Order
1. **Phase 1** (Multi-version) — Do first, since it's infrastructure that all other phases build on
2. **Phases 2-4** (Events, Actions, Conditions) — Can be done in parallel/interleaved
3. **Phase 5** (Dropdowns) — Do alongside or after Phase 2-4 as items are needed

---

## Verification

### Testing
- Run existing tests: `cd backend && python -m pytest tests/ -v` — ensure nothing breaks
- Add tests for multi-version pom.xml/plugin.yml generation (each version produces correct output)
- Add tests for each new event/action/condition code generation
- Test that version-specific blocks are filtered correctly in frontend

### Manual Testing
- Select each Paper version in the UI, generate a plugin, verify pom.xml has correct version/Java target and plugin.yml has correct api-version
- Test each new event/action/condition block in the builder
- Verify generated Java code compiles (spot-check a few)

### Backwards Compatibility
- Existing saved plugins without `paper_version` field default to `"1.21.1"`
- No existing block definitions are removed or renamed
