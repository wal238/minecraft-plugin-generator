import React, { useState, useRef, useCallback, useEffect } from 'react';

/**
 * A panel that can be resized by dragging its left edge.
 * Used for the editor panel to allow more space for code editing.
 */
export default function ResizablePanel({ children, minWidth = 280, maxWidth = 800, defaultWidth = 350, ...rest }) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);

  const startResize = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (!isResizing || !panelRef.current) return;

    const containerRight = window.innerWidth;
    const newWidth = containerRight - e.clientX;

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setWidth(newWidth);
    }
  }, [isResizing, minWidth, maxWidth]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, resize, stopResize]);

  return (
    <aside
      ref={panelRef}
      className="editor-panel resizable-panel"
      style={{ width: `${width}px` }}
      {...rest}
    >
      <div
        className={`resize-handle ${isResizing ? 'active' : ''}`}
        onMouseDown={startResize}
      />
      <div className="resizable-panel-content">
        {children}
      </div>
    </aside>
  );
}
