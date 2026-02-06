import React, { useState } from 'react';
import { getFieldDefs } from '../utils/blockSchema';

export default function BlockNode({
  block,
  childBlocks = [],
  isSelected,
  selectedBlockId,
  onSelect,
  onDelete,
  onDeleteChild,
  onAddChild,
  onReorderChild,
}) {
  const [childDragOver, setChildDragOver] = useState(false);
  const [childReorderTarget, setChildReorderTarget] = useState(null);
  const isEvent = block.type === 'event';
  const CHILD_DRAG_TYPE = 'application/x-block-child';

  const moveChild = (childId, direction) => {
    if (!onReorderChild) return;
    const ids = block.children || [];
    const index = ids.indexOf(childId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ids.length) return;
    onReorderChild(childId, ids[targetIndex]);
  };

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
    setChildReorderTarget(null);
    try {
      const reorderPayload = e.dataTransfer.getData(CHILD_DRAG_TYPE);
      if (reorderPayload) return;

      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type !== 'event') {
        onAddChild(data);
      }
    } catch {
      // ignore
    }
  };

  const hasMissingRequired = (b) => {
    const fields = getFieldDefs(b.definition);
    return fields.some((field) => {
      if (!field.required) return false;
      const value = b.properties?.[field.name];
      return value === undefined || value === null || value === '';
    });
  };

  const getToneClass = (type) => {
    if (type === 'event') return 'block-tone-event';
    if (type === 'action') return 'block-tone-action';
    return 'block-tone-custom';
  };

  const renderBlock = (b, isChild = false) => {
    const propertyEntries = Object.entries(b.properties || {}).filter(
      ([, v]) => v !== ''
    );
    const selected = b.id === (isChild ? selectedBlockId : null) || (!isChild && isSelected);
    const missingRequired = hasMissingRequired(b);
    const childIndex = isChild ? (block.children || []).indexOf(b.id) : -1;
    const canMoveUp = isChild && childIndex > 0;
    const canMoveDown = isChild && childIndex !== -1 && childIndex < (block.children || []).length - 1;

    return (
      <div
        className={`block-node ${getToneClass(b.type)} ${selected ? 'block-node-selected' : ''} ${isChild ? 'block-node-child' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(b.id);
        }}
        draggable={isChild}
        tabIndex={isChild ? 0 : undefined}
        onKeyDown={(e) => {
          if (!isChild) return;
          if ((e.altKey || e.ctrlKey) && e.key === 'ArrowUp') {
            e.preventDefault();
            moveChild(b.id, 'up');
          }
          if ((e.altKey || e.ctrlKey) && e.key === 'ArrowDown') {
            e.preventDefault();
            moveChild(b.id, 'down');
          }
        }}
        onDragStart={(e) => {
          if (!isChild) return;
          e.dataTransfer.setData(CHILD_DRAG_TYPE, JSON.stringify({ type: 'child', id: b.id }));
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(e) => {
          if (!isChild) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          setChildReorderTarget(b.id);
        }}
        onDragLeave={() => {
          if (!isChild) return;
          setChildReorderTarget((prev) => (prev === b.id ? null : prev));
        }}
        onDrop={(e) => {
          if (!isChild) return;
          e.preventDefault();
          const payload = e.dataTransfer.getData(CHILD_DRAG_TYPE);
          if (!payload) return;
          try {
            const data = JSON.parse(payload);
            if (data?.type === 'child' && data?.id && onReorderChild) {
              onReorderChild(data.id, b.id);
            }
            setChildReorderTarget(null);
          } catch {
            // ignore
          }
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
        {isChild && (
          <div className="block-node-reorder">
            <button
              type="button"
              className="block-node-reorder-btn"
              onClick={(e) => {
                e.stopPropagation();
                moveChild(b.id, 'up');
              }}
              disabled={!canMoveUp}
              title="Move up (Alt/Ctrl + ↑)"
            >
              ▲
            </button>
            <button
              type="button"
              className="block-node-reorder-btn"
              onClick={(e) => {
                e.stopPropagation();
                moveChild(b.id, 'down');
              }}
              disabled={!canMoveDown}
              title="Move down (Alt/Ctrl + ↓)"
            >
              ▼
            </button>
          </div>
        )}
        <span className="block-node-badge">
          {b.type}
        </span>
        {missingRequired && (
          <span className="block-node-badge block-node-badge-warning">
            Missing required fields
          </span>
        )}
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
              <div
                key={child.id}
                className={`block-child-wrapper ${childReorderTarget === child.id ? 'block-child-reorder-target' : ''}`}
              >
                {renderBlock(child, true)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
