import { useState } from 'react';

export function useDragDrop() {
  const [draggedBlock, setDraggedBlock] = useState(null);

  const handleDragStart = (e, block) => {
    setDraggedBlock(block);
    e.dataTransfer.setData('application/json', JSON.stringify(block));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return { draggedBlock, handleDragStart, handleDragEnd, handleDragOver };
}
