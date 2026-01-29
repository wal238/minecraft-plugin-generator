import React from 'react';

export default function BlockItem({ block, onDragStart }) {
  return (
    <div
      className="block-item"
      draggable
      onDragStart={(e) => onDragStart(e, block)}
      style={{ borderLeftColor: block.color }}
    >
      <div className="block-item-name">{block.name}</div>
      <div className="block-item-description">{block.description}</div>
    </div>
  );
}
