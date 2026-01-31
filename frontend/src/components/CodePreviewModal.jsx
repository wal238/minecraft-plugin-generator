import React, { useState } from 'react';

/**
 * Modal to preview generated Java code files.
 */
export default function CodePreviewModal({ files, onClose }) {
  const fileNames = Object.keys(files);
  const [activeFile, setActiveFile] = useState(fileNames[0] || '');

  // Get just the filename from the full path for display
  const getShortName = (path) => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  // Get file extension for syntax highlighting hint
  const getFileType = (path) => {
    if (path.endsWith('.java')) return 'java';
    if (path.endsWith('.xml')) return 'xml';
    if (path.endsWith('.yml')) return 'yaml';
    return 'text';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="code-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="code-preview-header">
          <h2>Generated Code Preview</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="code-preview-tabs">
          {fileNames.map((path) => (
            <button
              key={path}
              className={`code-preview-tab ${activeFile === path ? 'active' : ''}`}
              onClick={() => setActiveFile(path)}
              title={path}
            >
              {getShortName(path)}
            </button>
          ))}
        </div>

        <div className="code-preview-path">{activeFile}</div>

        <div className="code-preview-content">
          <pre className={`language-${getFileType(activeFile)}`}>
            <code>{files[activeFile] || ''}</code>
          </pre>
        </div>

        <div className="code-preview-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
