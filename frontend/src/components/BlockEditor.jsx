import React from 'react';
import usePluginStore from '../store/usePluginStore';
import CodeEditor from './CodeEditor';
import ItemSelect from './ItemSelect';
import SoundSelect from './SoundSelect';

/** Context hints per event type shown above the code editor. */
const EVENT_CONTEXT = {
  PlayerJoinEvent: 'player (Player), event (PlayerJoinEvent)',
  PlayerQuitEvent: 'player (Player), event (PlayerQuitEvent)',
  BlockBreakEvent: 'player (Player), event (BlockBreakEvent) — event.getBlock()',
  BlockPlaceEvent: 'player (Player), event (BlockPlaceEvent) — event.getBlock()',
};

/** Placeholder hints for common property names. */
const PROPERTY_PLACEHOLDERS = {
  message: 'Enter message... (use %player% for player name)',
  itemType: 'e.g., DIAMOND, IRON_SWORD',
  amount: '1',
  health: '20.0',
  hunger: '20',
  sound: 'ENTITY_EXPERIENCE_ORB_PICKUP',
  volume: '1.0',
  pitch: '1.0',
  x: '0',
  y: '64',
  z: '0',
  title: 'Title text',
  subtitle: 'Subtitle text',
  fadeIn: '10',
  stay: '70',
  fadeOut: '20',
};

export default function BlockEditor() {
  const blocks = usePluginStore((state) => state.blocks);
  const selectedBlockId = usePluginStore((state) => state.selectedBlockId);
  const updateBlock = usePluginStore((state) => state.updateBlock);

  const block = blocks.find((b) => b.id === selectedBlockId);
  if (!block) return null;

  const isCustom = block.type === 'custom-condition' || block.type === 'custom-action';
  const isEvent = block.type === 'event';

  // Find the parent event to provide context
  const parentEvent = blocks.find(
    (b) => b.type === 'event' && b.children && b.children.includes(block.id)
  );
  const contextHint = parentEvent
    ? (EVENT_CONTEXT[parentEvent.name] || 'player (Player), event')
    : '';

  // Property definitions from the block's definition metadata (array format from API)
  // OR derive from block.properties keys (object format from frontend definitions)
  let propertyDefs = block.definition?.properties;
  if (!Array.isArray(propertyDefs) || propertyDefs.length === 0) {
    // Fallback: derive editable fields from the block's properties object
    const propsObj = block.properties || {};
    propertyDefs = Object.keys(propsObj).map((key) => ({
      name: key,
      type: 'string',
      required: false,
      placeholder: PROPERTY_PLACEHOLDERS[key] || '',
    }));
  }

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

      {Array.isArray(propertyDefs) && propertyDefs.map((prop) => (
        <div key={prop.name} className="form-group">
          <label className="form-label" htmlFor={`prop-${prop.name}`}>
            {prop.name} {prop.required && <span className="form-required">*</span>}
          </label>
          {prop.name === 'itemType' ? (
            <ItemSelect
              value={block.properties[prop.name] || ''}
              onChange={(value) => handlePropertyChange(prop.name, value)}
            />
          ) : prop.name === 'sound' ? (
            <SoundSelect
              value={block.properties[prop.name] || ''}
              onChange={(value) => handlePropertyChange(prop.name, value)}
            />
          ) : (
            <input
              id={`prop-${prop.name}`}
              className="form-input"
              type="text"
              placeholder={prop.placeholder || ''}
              value={block.properties[prop.name] || ''}
              onChange={(e) => handlePropertyChange(prop.name, e.target.value)}
            />
          )}
        </div>
      ))}

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
