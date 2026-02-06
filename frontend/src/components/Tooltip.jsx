import React, { useState, useRef, useEffect } from 'react';

/**
 * Lightweight tooltip component.
 * Wrap any element and provide tooltip text.
 */
export default function Tooltip({ children, text, position = 'top' }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (visible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top, left;

      switch (position) {
        case 'bottom':
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + 8;
          break;
        case 'top':
        default:
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
      }

      // Keep tooltip within viewport
      left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
      top = Math.max(8, top);

      setCoords({ top, left });
    }
  }, [visible, position]);

  return (
    <span
      ref={triggerRef}
      className="tooltip-trigger"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          ref={tooltipRef}
          className={`tooltip tooltip-${position}`}
          style={{ top: coords.top, left: coords.left }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

/**
 * Info icon with tooltip - common pattern for help hints.
 */
export function InfoTooltip({ text, position = 'right' }) {
  return (
    <Tooltip text={text} position={position}>
      <span className="info-icon">?</span>
    </Tooltip>
  );
}
