import React, { useState } from 'react';

export default function BlockNode({
  block,
  childBlocks = [],
  isSelected,
  selectedBlockId,
  onSelect,
  onDelete,
  onDeleteChild,
  onAddChild,
}) {
  const [childDragOver, setChildDragOver] = useState(false);
  const isEvent = block.type === 'event';

  const handleChildDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setChildDragOver(true);
  };

  const handleChildDragLeave = (e) => {
    e.stopPropagation();
    setChildDragOver(false);
  };

  const handleChildDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setChildDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type !== 'event') {
        onAddChild(data);
      }
    } catch {
      // ignore
    }
  };

  const renderBlock = (b, isChild = false) => {
    const propertyEntries = Object.entries(b.properties || {}).filter(
      ([, v]) => v !== ''
    );
    const selected = b.id === (isChild ? selectedBlockId : null) || (!isChild && isSelected);

    return (
      <div
        className={`block-node ${selected ? 'block-node-selected' : ''} ${isChild ? 'block-node-child' : ''}`}
        style={{ borderLeftColor: b.color }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(b.id);
        }}
      >
        <button
          className="block-node-delete"
          onClick={(e) => {
            e.stopPropagation();
            isChild ? onDeleteChild(b.id) : onDelete();
          }}
        >
          X
        </button>
        <span className="block-node-badge" style={{ backgroundColor: b.color }}>
          {b.type}
        </span>
        <div className="block-node-name">{b.name}</div>
        {propertyEntries.length > 0 && (
          <div className="block-node-properties">
            {propertyEntries.map(([key, value]) => (
              <span key={key} className="block-node-property">
                {key}: {value}
              </span>
            ))}
          </div>
        )}
        {b.customCode && (
          <div className="block-node-properties">
            <span className="block-node-property">Has custom code</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="block-node-container">
      {renderBlock(block, false)}

      {isEvent && (
        <div
          className={`block-children-zone ${childDragOver ? 'block-children-zone-active' : ''}`}
          onDragOver={handleChildDragOver}
          onDragLeave={handleChildDragLeave}
          onDrop={handleChildDrop}
        >
          {childBlocks.length === 0 ? (
            <div className="block-children-placeholder">
              Drop actions or conditions here
            </div>
          ) : (
            childBlocks.map((child) => (
              <div key={child.id}>{renderBlock(child, true)}</div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
