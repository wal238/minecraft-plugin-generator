import React from 'react';

export default function UpgradePrompt({ message, onClose }) {
  const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000';

  return (
    <div className="upgrade-prompt-overlay" onClick={onClose}>
      <div className="upgrade-prompt" onClick={(e) => e.stopPropagation()}>
        <button className="upgrade-prompt-close" onClick={onClose}>&times;</button>
        <div className="upgrade-prompt-icon">&#128274;</div>
        <h3 className="upgrade-prompt-title">Upgrade Required</h3>
        <p className="upgrade-prompt-message">{message || 'This feature requires a paid plan.'}</p>
        <div className="upgrade-prompt-actions">
          <a
            href={`${landingUrl}/#pricing`}
            target="_blank"
            rel="noopener noreferrer"
            className="upgrade-prompt-btn"
          >
            View Plans
          </a>
          <button className="upgrade-prompt-cancel" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
