import { useEffect, useMemo, useRef, useState } from 'react';
import usePluginStore from '../store/usePluginStore';
import CodeEditor from './CodeEditor';
import { GroupedSelect, Slider, SelectInput, NumberInput } from './form';
import { getFieldDefs } from '../utils/blockSchema';
import { getAvailableTargets, supportsTargeting } from '../utils/actionTargeting';

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
  const setSelectedBlockId = usePluginStore((state) => state.setSelectedBlockId);
  const worldOptions = usePluginStore((state) => state.worldOptions);

  const block = blocks.find((b) => b.id === selectedBlockId);
  if (!block) return null;

  const [localProperties, setLocalProperties] = useState(block.properties || {});
  const [localCode, setLocalCode] = useState(block.customCode || '');
  const debounceRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    setLocalProperties(block.properties || {});
    setLocalCode(block.customCode || '');
  }, [block.id]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      updateBlock(block.id, {
        properties: localProperties,
        customCode: localCode
      });
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [block.id, localProperties, localCode, updateBlock]);

  const isCustom = block.type === 'custom-condition' || block.type === 'custom-action';

  // Find the parent event to provide context
  const parentEvent = blocks.find(
    (b) => b.type === 'event' && b.children && b.children.includes(block.id)
  );
  const contextHint = parentEvent
    ? (EVENT_CONTEXT[parentEvent.name] || 'player (Player), event')
    : '';

  const fieldsToRender = useMemo(() => getFieldDefs(block.definition), [block.definition]);
  const targetField = useMemo(() => {
    if (block.type !== 'action' || !supportsTargeting(block.name)) return null;

    const targetOptions = getAvailableTargets(block.name, parentEvent?.name);
    if (targetOptions.length === 0) return null;

    return {
      name: 'target',
      label: 'Target Context',
      type: 'select',
      default: 'auto',
      options: targetOptions
    };
  }, [block.type, block.name, parentEvent?.name]);

  const fieldsWithTarget = useMemo(() => {
    if (!targetField) return fieldsToRender;
    const withoutTarget = fieldsToRender.filter((field) => field.name !== 'target');
    return [targetField, ...withoutTarget];
  }, [fieldsToRender, targetField]);

  const resolvedFields = useMemo(
    () =>
      fieldsWithTarget.map((field) => {
        if (field.optionsKey === 'worlds') {
          const mappedWorlds = (worldOptions || []).map((world) => ({
            value: world,
            label: world
          }));
          return {
            ...field,
            options: mappedWorlds.length > 0 ? mappedWorlds : field.options || []
          };
        }
        return field;
      }),
    [fieldsWithTarget, worldOptions]
  );

  const snippetOptions = useMemo(
    () => [
      { label: 'player.hasPermission("vip.access")', code: 'player.hasPermission("vip.access")' },
      { label: 'event.getMessage()', code: 'event.getMessage()' },
      { label: 'player.getLocation()', code: 'player.getLocation()' },
      { label: 'event.setCancelled(true);', code: 'event.setCancelled(true);\n' },
      { label: 'player.sendMessage("Hello!")', code: 'player.sendMessage("Hello!");\n' },
      { label: 'Bukkit.broadcastMessage("...")', code: 'Bukkit.broadcastMessage("...");\n' },
      { label: 'if (...) { }', code: 'if (true) {\n    \n}\n' },
    ],
    []
  );

  const handlePropertyChange = (key, value) => {
    setLocalProperties((prev) => ({ ...prev, [key]: value }));
  };

  const handleCodeChange = (code) => {
    setLocalCode(code);
  };

  const toneClass =
    block.type === 'event'
      ? 'block-tone-event'
      : block.type === 'action'
        ? 'block-tone-action'
        : 'block-tone-custom';

  const childBlocks = useMemo(() => {
    if (block.type !== 'event') return [];
    const blockMap = new Map(blocks.map((item) => [item.id, item]));
    return (block.children || [])
      .map((childId) => blockMap.get(childId))
      .filter(Boolean);
  }, [block, blocks]);

  const toHumanLabel = (value) =>
    String(value).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const resolveFieldLabelValue = (field, rawValue) => {
    const value = formatValue(rawValue);
    if (value === null) return null;
    const options = field?.options;
    if (!options) return value;

    if (Array.isArray(options)) {
      const match = options.find((opt) => {
        if (typeof opt === 'string') return opt === value;
        return String(opt.value) === value;
      });
      if (match && typeof match === 'object') return match.label || value;
      if (typeof match === 'string') return toHumanLabel(match);
      return value;
    }

    if (typeof options === 'object') {
      for (const groupItems of Object.values(options)) {
        const found = (groupItems || []).find((item) => item === value);
        if (found) return toHumanLabel(found);
      }
    }
    return value;
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };

  return (
    <div className="block-editor">
      <h3 className="block-editor-title">Edit Block</h3>
      <div className="block-editor-name">{block.name}</div>
      <span className={`block-node-badge ${toneClass}`} style={{ marginBottom: 16, display: 'inline-block' }}>
        {block.type}
      </span>

      {/* Render fields */}
      {resolvedFields.map((field) => (
        <div key={field.name} className="form-group">
          <label className="form-label" htmlFor={`prop-${field.name}`}>
            {field.label || field.name}
            {field.required && <span className="form-required">*</span>}
          </label>
          {renderField(
            field,
            localProperties?.[field.name] ?? field.default ?? '',
            (value) => handlePropertyChange(field.name, value)
          )}
        </div>
      ))}

      {/* No fields message for actions like CancelEvent */}
      {block.type === 'action' && fieldsToRender.length === 0 && (
        <div className="block-editor-no-fields">
          This action has no configurable properties.
        </div>
      )}

      {block.type === 'event' && (
        <div className="event-children-panel">
          <div className="event-children-header">Event Actions</div>
          {childBlocks.length === 0 ? (
            <div className="block-editor-no-fields">
              No child actions or conditions linked to this event yet.
            </div>
          ) : (
            <div className="event-children-list">
              {childBlocks.map((child) => {
                const fieldDefs = getFieldDefs(child.definition || {});
                const fieldByName = Object.fromEntries(fieldDefs.map((field) => [field.name, field]));
                const propertyRows = Object.entries(child.properties || {})
                  .map(([key, value]) => {
                    const field = fieldByName[key];
                    const displayKey = field?.label || key;
                    const displayValue = resolveFieldLabelValue(field, value);
                    return [displayKey, displayValue];
                  })
                  .filter(([, value]) => value !== null);

                return (
                  <button
                    key={child.id}
                    type="button"
                    className="event-child-card"
                    onClick={() => setSelectedBlockId(child.id)}
                  >
                    <div className="event-child-card-top">
                      <span className="event-child-name">{child.name}</span>
                      <span className="event-child-type">{child.type}</span>
                    </div>
                    {propertyRows.length > 0 ? (
                      <div className="event-child-properties">
                        {propertyRows.map(([key, value]) => (
                          <span key={`${child.id}-${key}`} className="event-child-property">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="event-child-empty">No configurable values</div>
                    )}
                    {child.customCode && (
                      <div className="event-child-custom">Includes custom code</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
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
          <div className="code-snippet-dropdown">
            <label className="form-hint">Insert snippet</label>
            <select
              className="form-input form-select"
              defaultValue=""
              onChange={(e) => {
                const value = e.target.value;
                if (!value) return;
                editorRef.current?.insertSnippet(value);
                e.target.value = '';
              }}
            >
              <option value="" disabled>
                Choose a snippet...
              </option>
              {snippetOptions.map((opt) => (
                <option key={opt.label} value={opt.code}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <CodeEditor
            ref={editorRef}
            code={localCode || ''}
            onChange={handleCodeChange}
            context={contextHint}
          />
        </div>
      )}
    </div>
  );
}
