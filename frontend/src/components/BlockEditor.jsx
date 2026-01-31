import usePluginStore from '../store/usePluginStore';
import CodeEditor from './CodeEditor';
import { GroupedSelect, Slider, SelectInput, NumberInput } from './form';
import { ACTION_FIELDS } from '../data/dropdownOptions';

/** Context hints per event type shown above the code editor. */
const EVENT_CONTEXT = {
  // Player Events
  PlayerJoinEvent: 'player (Player), event (PlayerJoinEvent) - event.getJoinMessage()',
  PlayerQuitEvent: 'player (Player), event (PlayerQuitEvent) - event.getQuitMessage()',
  PlayerMoveEvent: 'player (Player), event (PlayerMoveEvent) - event.getFrom(), event.getTo()',
  AsyncPlayerChatEvent: 'player (Player), event (AsyncPlayerChatEvent) - event.getMessage(), event.setMessage()',
  PlayerDeathEvent: 'player (Player), event (PlayerDeathEvent) - event.getDeathMessage(), event.getDrops()',
  PlayerRespawnEvent: 'player (Player), event (PlayerRespawnEvent) - event.getRespawnLocation()',
  PlayerInteractEvent: 'player (Player), event (PlayerInteractEvent) - event.getAction(), event.getClickedBlock()',
  PlayerInteractEntityEvent: 'player (Player), event (PlayerInteractEntityEvent) - event.getRightClicked()',
  PlayerToggleSneakEvent: 'player (Player), event (PlayerToggleSneakEvent) - event.isSneaking()',
  PlayerToggleSprintEvent: 'player (Player), event (PlayerToggleSprintEvent) - event.isSprinting()',
  PlayerDropItemEvent: 'player (Player), event (PlayerDropItemEvent) - event.getItemDrop()',
  EntityPickupItemEvent: 'player (Player), event (EntityPickupItemEvent) - event.getItem()',
  // Block Events
  BlockBreakEvent: 'player (Player), event (BlockBreakEvent) - event.getBlock(), event.setDropItems()',
  BlockPlaceEvent: 'player (Player), event (BlockPlaceEvent) - event.getBlock(), event.getBlockAgainst()',
  BlockBurnEvent: 'event (BlockBurnEvent) - event.getBlock(), event.getIgnitingBlock()',
  BlockIgniteEvent: 'player (Player|null), event (BlockIgniteEvent) - event.getBlock(), event.getCause()',
  // Entity Events
  EntityDamageEvent: 'player (Player|null), event (EntityDamageEvent) - event.getDamage(), event.getCause()',
  EntityDamageByEntityEvent: 'player (Player|null), event (EntityDamageByEntityEvent) - event.getDamager(), event.getDamage()',
  EntityDeathEvent: 'entity (LivingEntity), event (EntityDeathEvent) - event.getDrops(), event.getDroppedExp()',
  CreatureSpawnEvent: 'entity (LivingEntity), event (CreatureSpawnEvent) - event.getSpawnReason(), event.getEntityType()',
  // World Events
  WeatherChangeEvent: 'world (World), event (WeatherChangeEvent) - event.toWeatherState()',
};

/**
 * Render the appropriate form field based on field definition.
 */
function renderField(field, value, onChange) {
  const { type, name, options, min, max, step, hint, placeholder } = field;

  switch (type) {
    case 'grouped-select':
      return (
        <GroupedSelect
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder || `Select ${name}...`}
        />
      );

    case 'select':
      return (
        <SelectInput
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
        />
      );

    case 'slider':
      return (
        <Slider
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          hint={hint}
        />
      );

    case 'number':
      return (
        <NumberInput
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          hint={hint}
          placeholder={placeholder}
        />
      );

    case 'select-or-custom':
      // Dropdown with custom number input option
      return (
        <div className="select-or-custom">
          <SelectInput
            value={options.some((o) => o.value === value) ? value : 'custom'}
            onChange={(v) => {
              if (v !== 'custom') onChange(v);
            }}
            options={[...options, { value: 'custom', label: 'Custom...' }]}
          />
          {!options.some((o) => o.value === value) && (
            <NumberInput
              value={value}
              onChange={onChange}
              min={min}
              max={max}
              placeholder="Enter value..."
            />
          )}
        </div>
      );

    case 'text':
    default:
      return (
        <input
          className="form-input"
          type="text"
          placeholder={placeholder || ''}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

export default function BlockEditor() {
  const blocks = usePluginStore((state) => state.blocks);
  const selectedBlockId = usePluginStore((state) => state.selectedBlockId);
  const updateBlock = usePluginStore((state) => state.updateBlock);

  const block = blocks.find((b) => b.id === selectedBlockId);
  if (!block) return null;

  const isCustom = block.type === 'custom-condition' || block.type === 'custom-action';
  const isAction = block.type === 'action';

  // Find the parent event to provide context
  const parentEvent = blocks.find(
    (b) => b.type === 'event' && b.children && b.children.includes(block.id)
  );
  const contextHint = parentEvent
    ? (EVENT_CONTEXT[parentEvent.name] || 'player (Player), event')
    : '';

  // Get field definitions for this action from our centralized config
  const actionFields = isAction ? (ACTION_FIELDS[block.name] || []) : [];

  // For events or blocks without defined fields, derive from properties
  let fallbackFields = [];
  if (!isAction && !isCustom) {
    const propsObj = block.properties || {};
    fallbackFields = Object.keys(propsObj).map((key) => ({
      name: key,
      label: key,
      type: 'text',
    }));
  }

  const fieldsToRender = isAction ? actionFields : fallbackFields;

  const handlePropertyChange = (key, value) => {
    updateBlock(block.id, {
      properties: { ...block.properties, [key]: value }
    });
  };

  const handleCodeChange = (code) => {
    updateBlock(block.id, { customCode: code });
  };

  return (
    <div className="block-editor">
      <h3 className="block-editor-title">Edit Block</h3>
      <div className="block-editor-name">{block.name}</div>
      <span className="block-node-badge" style={{ backgroundColor: block.color, marginBottom: 16, display: 'inline-block' }}>
        {block.type}
      </span>

      {/* Render fields */}
      {fieldsToRender.map((field) => (
        <div key={field.name} className="form-group">
          <label className="form-label" htmlFor={`prop-${field.name}`}>
            {field.label || field.name}
            {field.required && <span className="form-required">*</span>}
          </label>
          {renderField(
            field,
            block.properties[field.name] || field.default || '',
            (value) => handlePropertyChange(field.name, value)
          )}
        </div>
      ))}

      {/* No fields message for actions like CancelEvent */}
      {isAction && fieldsToRender.length === 0 && (
        <div className="block-editor-no-fields">
          This action has no configurable properties.
        </div>
      )}

      {/* Custom code editor */}
      {isCustom && (
        <div className="form-group">
          <label className="form-label">
            {block.type === 'custom-condition' ? 'Condition Expression (Java)' : 'Custom Java Code'}
          </label>
          {block.type === 'custom-condition' && (
            <div className="code-editor-help">
              Write a boolean expression. It will be wrapped in <code>if (...)</code>.
              <br />Example: <code>player.hasPermission("vip.access")</code>
            </div>
          )}
          {block.type === 'custom-action' && (
            <div className="code-editor-help">
              Write Java statements that execute inside the event handler.
              <br />Example: <code>player.sendMessage("Hello!");</code>
            </div>
          )}
          <CodeEditor
            code={block.customCode || ''}
            onChange={handleCodeChange}
            context={contextHint}
          />
        </div>
      )}
    </div>
  );
}
