import React, { useEffect } from 'react';
import usePluginStore from '../store/usePluginStore';
import { apiService } from '../services/api';
import { DEFAULT_BLOCKS, TEMPLATES } from '../services/blockDefinitions';
import { useDragDrop } from '../hooks/useDragDrop';
import { useBlocks } from '../hooks/useBlocks';
import BlockItem from './BlockItem';

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
      <h3 className="palette-title">Block Palette</h3>

      <div className="palette-section-header">Templates</div>
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

      <div className="palette-section-header">Events</div>
      {blocks.events.map((block) => (
        <BlockItem key={block.id} block={block} onDragStart={handleDragStart} />
      ))}

      <div className="palette-section-header">Actions</div>
      {blocks.actions.map((block) => (
        <BlockItem key={block.id} block={block} onDragStart={handleDragStart} />
      ))}

      <div className="palette-section-header">Custom</div>
      {blocks.custom_options.map((block) => (
        <BlockItem key={block.id} block={block} onDragStart={handleDragStart} />
      ))}
    </div>
  );
}
