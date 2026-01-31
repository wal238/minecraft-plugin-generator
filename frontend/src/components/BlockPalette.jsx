import { useEffect } from 'react';
import usePluginStore from '../store/usePluginStore';
import { apiService } from '../services/api';
import { DEFAULT_BLOCKS, TEMPLATES } from '../services/blockDefinitions';
import { useDragDrop } from '../hooks/useDragDrop';
import { useBlocks } from '../hooks/useBlocks';
import BlockItem from './BlockItem';
import Tooltip from './Tooltip';

export default function BlockPalette() {
  const availableBlocks = usePluginStore((state) => state.availableBlocks);
  const setAvailableBlocks = usePluginStore((state) => state.setAvailableBlocks);
  const { handleDragStart } = useDragDrop();
  const { addTemplate } = useBlocks();

  useEffect(() => {
    async function fetchBlocks() {
      try {
        const data = await apiService.getBlocks();
        setAvailableBlocks(data);
      } catch {
        setAvailableBlocks(DEFAULT_BLOCKS);
      }
    }
    fetchBlocks();
  }, [setAvailableBlocks]);

  const blocks = availableBlocks || DEFAULT_BLOCKS;

  return (
    <div className="block-palette">
      <h3 className="palette-title">
        Block Palette
        <span className="palette-subtitle">Drag blocks to the canvas</span>
      </h3>

      {/* Quick Start Templates */}
      <div className="palette-section">
        <div className="palette-section-header">
          <span className="palette-section-icon palette-icon-templates"></span>
          Quick Start Templates
          <Tooltip text="Pre-built event + action combos. Click to add instantly." position="right">
            <span className="info-icon">?</span>
          </Tooltip>
        </div>
        <div className="templates-list">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              className="template-item"
              onClick={() => addTemplate(tpl)}
            >
              <div className="template-item-name">{tpl.name}</div>
              <div className="template-item-description">{tpl.description}</div>
              <div className="template-item-meta">
                {tpl.event.name} + {tpl.children.length} action{tpl.children.length !== 1 ? 's' : ''}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Events */}
      <div className="palette-section">
        <div className="palette-section-header">
          <span className="palette-section-icon palette-icon-events"></span>
          Events
          <span className="palette-section-count">{blocks.events.length}</span>
        </div>
        <div className="palette-section-hint">Drag events to canvas first</div>
        {blocks.events.map((block) => (
          <BlockItem key={block.id} block={block} onDragStart={handleDragStart} />
        ))}
      </div>

      {/* Actions */}
      <div className="palette-section">
        <div className="palette-section-header">
          <span className="palette-section-icon palette-icon-actions"></span>
          Actions
          <span className="palette-section-count">{blocks.actions.length}</span>
        </div>
        <div className="palette-section-hint">Drop actions onto events</div>
        {blocks.actions.map((block) => (
          <BlockItem key={block.id} block={block} onDragStart={handleDragStart} />
        ))}
      </div>

      {/* Custom Code */}
      <div className="palette-section">
        <div className="palette-section-header">
          <span className="palette-section-icon palette-icon-custom"></span>
          Custom Code
        </div>
        <div className="palette-section-hint">Write your own Java logic</div>
        {blocks.custom_options.map((block) => (
          <BlockItem key={block.id} block={block} onDragStart={handleDragStart} />
        ))}
      </div>
    </div>
  );
}
