import React, { useMemo, useState } from 'react';
import { useBlocks } from '../hooks/useBlocks';
import usePluginStore from '../store/usePluginStore';
import BlockNode from './BlockNode';

export default function Canvas() {
  const { blocks, addBlockFromDefinition, addChildFromDefinition, deleteBlock, removeChildBlock, reorderChildBlocks } = useBlocks();
  const setSelectedBlockId = usePluginStore((state) => state.setSelectedBlockId);
  const selectedBlockId = usePluginStore((state) => state.selectedBlockId);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      // Only allow event blocks at the top level
      if (data.type === 'event') {
        addBlockFromDefinition(data);
      }
    } catch {
      // ignore invalid data
    }
  };

  const blocksById = useMemo(() => {
    const map = new Map();
    for (const block of blocks) {
      map.set(block.id, block);
    }
    return map;
  }, [blocks]);

  // Only show top-level event blocks (not child blocks)
  const topLevelBlocks = useMemo(
    () => blocks.filter((b) => b.type === 'event'),
    [blocks]
  );

  const getChildBlocks = (parentBlock) =>
    parentBlock.children
      .map((childId) => blocksById.get(childId))
      .filter(Boolean);

  return (
    <div
      className={`canvas ${dragOver ? 'canvas-drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {topLevelBlocks.length === 0 ? (
        <div className="canvas-placeholder">
          <div className="canvas-placeholder-icon">+</div>
          <div>Drag event blocks here to build your plugin</div>
        </div>
      ) : (
        topLevelBlocks.map((block) => (
          <BlockNode
            key={block.id}
            block={block}
            childBlocks={getChildBlocks(block)}
            isSelected={block.id === selectedBlockId}
            selectedBlockId={selectedBlockId}
            onSelect={(id) => setSelectedBlockId(id)}
            onDelete={() => deleteBlock(block.id)}
            onDeleteChild={(childId) => removeChildBlock(block.id, childId)}
            onAddChild={(definition) => addChildFromDefinition(block.id, definition)}
            onReorderChild={(sourceId, targetId) => reorderChildBlocks(block.id, sourceId, targetId)}
          />
        ))
      )}
    </div>
  );
}
