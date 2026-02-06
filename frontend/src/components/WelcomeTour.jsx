import React, { useEffect, useRef, useState } from 'react';
import { useTour } from '../hooks/useTour';
import './WelcomeTour.css';

/* Inline SVG icon components for tour steps */
const icons = {
  gamepad: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="3" />
      <line x1="6" y1="10" x2="6" y2="14" />
      <line x1="4" y1="12" x2="8" y2="12" />
      <circle cx="16" cy="10" r="1" fill="currentColor" />
      <circle cx="19" cy="13" r="1" fill="currentColor" />
    </svg>
  ),
  settings: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  toolbar: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="3" x2="9" y2="9" />
    </svg>
  ),
  search: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  quickAdd: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  bolt: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  target: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  layout: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  book: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  rocket: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  edit: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
};

const TOUR_STEPS = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to Minecraft Plugin Builder!',
    description:
      'Build Minecraft plugins without writing Java code! This quick tour will show you around the interface.',
    placement: 'center',
    icon: icons.gamepad,
  },
  {
    id: 'header-toolbar',
    target: '[data-tour="header-toolbar"]',
    title: 'Toolbar',
    description:
      'This is your main toolbar. It has search, quick actions, recipes, and buttons to preview or generate your plugin.',
    placement: 'bottom',
    icon: icons.toolbar,
  },
  {
    id: 'header-search',
    target: '[data-tour="header-search"]',
    title: 'Search',
    description:
      'Search for blocks or templates by name. Quickly find the event or action you need without scrolling through the palette.',
    placement: 'bottom',
    icon: icons.search,
  },
  {
    id: 'header-quick-add',
    target: '[data-tour="header-quick-add"]',
    title: 'Quick Add',
    description:
      'Instantly add events, actions, or custom blocks without dragging. Select from the dropdown and it gets added to your canvas.',
    placement: 'bottom',
    icon: icons.quickAdd,
  },
  {
    id: 'plugin-settings',
    target: '[data-tour="plugin-settings"]',
    title: 'Plugin Settings',
    description:
      'Start here: name your plugin, set its version, and fill in the author field. These details become part of your generated plugin.',
    placement: 'right',
    icon: icons.settings,
  },
  {
    id: 'palette-events',
    target: '[data-tour="palette-events"]',
    title: 'Events',
    description:
      'Events trigger your plugin logic. Drag one to the canvas to begin building. For example: PlayerJoinEvent fires when a player connects.',
    placement: 'right',
    icon: icons.bolt,
  },
  {
    id: 'palette-actions',
    target: '[data-tour="palette-actions"]',
    title: 'Actions',
    description:
      'Actions run when events fire. Drag actions onto an event on the canvas to define what your plugin does \u2014 send messages, teleport players, and more.',
    placement: 'right',
    icon: icons.target,
  },
  {
    id: 'canvas',
    target: '[data-tour="canvas"]',
    title: 'Your Workspace',
    description:
      'This is your canvas. Drag events here from the sidebar, then nest actions inside them to build your plugin logic visually.',
    placement: 'left',
    icon: icons.layout,
  },
  {
    id: 'templates',
    target: '[data-tour="templates"]',
    title: 'Guided Recipes',
    description:
      'Jump-start your plugin with pre-built recipes. Each one adds a ready-made event and actions combo to the canvas with a single click.',
    placement: 'right',
    icon: icons.book,
  },
  {
    id: 'preview-generate',
    target: '[data-tour="preview-generate"]',
    title: 'Preview & Generate',
    description:
      'Preview the generated Java source code, or generate and download a ready-to-use JAR file for your Minecraft server.',
    placement: 'bottom',
    icon: icons.rocket,
  },
  {
    id: 'block-editor',
    target: '[data-tour="block-editor"]',
    title: 'Block Editor',
    description:
      'Select any block on the canvas to edit its properties here. This panel appears automatically when a block is clicked.',
    placement: 'left',
    icon: icons.edit,
    optional: true,
  },
];

const TOOLTIP_GAP = 16;
const VIEWPORT_PADDING = 12;
const SPOTLIGHT_PADDING = 8;

function computeTooltipPosition(placement, targetRect, tooltipRect) {
  if (!targetRect) {
    return {
      top: (window.innerHeight - tooltipRect.height) / 2,
      left: (window.innerWidth - tooltipRect.width) / 2,
    };
  }

  let top, left;

  switch (placement) {
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.left + targetRect.width + SPOTLIGHT_PADDING + TOOLTIP_GAP;
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.left - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipRect.width;
      break;
    case 'bottom':
      top = targetRect.top + targetRect.height + SPOTLIGHT_PADDING + TOOLTIP_GAP;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'top':
    default:
      top = targetRect.top - SPOTLIGHT_PADDING - TOOLTIP_GAP - tooltipRect.height;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      break;
  }

  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - tooltipRect.width - VIEWPORT_PADDING)
  );
  top = Math.max(
    VIEWPORT_PADDING,
    Math.min(top, window.innerHeight - tooltipRect.height - VIEWPORT_PADDING)
  );

  return { top, left };
}

function TourOverlay({ hasTarget, onClick }) {
  return (
    <div
      className={`tour-overlay ${hasTarget ? '' : 'tour-overlay-dark'}`}
      onClick={onClick}
    />
  );
}

function TourTooltip({
  step,
  targetRect,
  stepNumber,
  totalSteps,
  isFirst,
  isLast,
  onNext,
  onBack,
  onSkip,
  onFinish,
  dontShowAgain,
  onDontShowAgainChange,
  isCenterMode,
}) {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!tooltipRef.current) return;
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const computed = computeTooltipPosition(step.placement, targetRect, tooltipRect);
    setPosition(computed);
  }, [step, targetRect]);

  return (
    <div
      ref={tooltipRef}
      className={`tour-tooltip ${isCenterMode ? 'tour-tooltip-center' : ''}`}
      style={isCenterMode ? {} : { top: position.top, left: position.left }}
      key={step.id}
    >
      {!isCenterMode && (
        <div className={`tour-tooltip-arrow tour-tooltip-arrow-${step.placement}`} />
      )}

      <div className="tour-tooltip-header">
        {step.icon && <span className="tour-tooltip-icon">{step.icon}</span>}
        <h3 className="tour-tooltip-title">{step.title}</h3>
        <button
          className="tour-tooltip-close"
          onClick={onSkip}
          aria-label="Close tour"
        >
          &times;
        </button>
      </div>

      <p className="tour-tooltip-body">{step.description}</p>

      <div className="tour-tooltip-footer">
        <div className="tour-tooltip-progress">
          {Array.from({ length: totalSteps }, (_, i) => (
            <span
              key={i}
              className={`tour-tooltip-dot ${i === stepNumber - 1 ? 'active' : ''} ${i < stepNumber - 1 ? 'completed' : ''}`}
            />
          ))}
          <span className="tour-tooltip-counter">
            {stepNumber} of {totalSteps}
          </span>
        </div>
        <div className="tour-tooltip-actions">
          {!isFirst && (
            <button className="tour-btn tour-btn-secondary" onClick={onBack}>
              Back
            </button>
          )}
          {isLast ? (
            <button className="tour-btn tour-btn-primary" onClick={onFinish}>
              Get Started!
            </button>
          ) : (
            <button className="tour-btn tour-btn-primary" onClick={onNext}>
              Next
            </button>
          )}
        </div>
      </div>

      {isFirst && (
        <label className="tour-tooltip-dismiss">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => onDontShowAgainChange(e.target.checked)}
          />
          Don't show this again
        </label>
      )}
    </div>
  );
}

export default function WelcomeTour({ onRequestStart }) {
  const tour = useTour(TOUR_STEPS);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (onRequestStart) {
      onRequestStart(tour.start);
    }
  }, [onRequestStart, tour.start]);

  useEffect(() => {
    if (!tour.isOpen || !tour.currentStep) {
      setTargetRect(null);
      return;
    }

    const selector = tour.currentStep.target;
    if (!selector) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(selector);
    if (!el) {
      setTargetRect(null);
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    requestAnimationFrame(measure);

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [tour.isOpen, tour.currentStep]);

  useEffect(() => {
    if (!tour.isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') tour.close();
      if (e.key === 'ArrowRight') tour.goNext();
      if (e.key === 'ArrowLeft') tour.goBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tour.isOpen, tour.goNext, tour.goBack, tour.close]);

  if (!tour.isOpen || !tour.currentStep) return null;

  const isCenterMode = !tour.currentStep.target || !targetRect;

  return (
    <div className="tour-container">
      <TourOverlay hasTarget={!!targetRect} onClick={tour.close} />
      {targetRect && (
        <div
          className="tour-spotlight"
          style={{
            top: targetRect.top - SPOTLIGHT_PADDING,
            left: targetRect.left - SPOTLIGHT_PADDING,
            width: targetRect.width + SPOTLIGHT_PADDING * 2,
            height: targetRect.height + SPOTLIGHT_PADDING * 2,
          }}
        />
      )}
      <TourTooltip
        step={tour.currentStep}
        targetRect={targetRect}
        stepNumber={tour.currentStepIndex + 1}
        totalSteps={tour.totalSteps}
        isFirst={tour.isFirstStep}
        isLast={tour.isLastStep}
        onNext={tour.goNext}
        onBack={tour.goBack}
        onSkip={tour.close}
        onFinish={tour.finish}
        dontShowAgain={tour.dontShowAgain}
        onDontShowAgainChange={tour.setDontShowAgain}
        isCenterMode={isCenterMode}
      />
    </div>
  );
}
