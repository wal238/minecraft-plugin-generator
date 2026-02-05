import React, { useState } from 'react';
import usePluginStore from './store/usePluginStore';
import { apiService } from './services/api';
import PluginSettings from './components/PluginSettings';
import BlockPalette from './components/BlockPalette';
import Canvas from './components/Canvas';
import BlockEditor from './components/BlockEditor';
import ResizablePanel from './components/ResizablePanel';
import CodePreviewModal from './components/CodePreviewModal';
import { validateBlocks } from './utils/blockSchema';
import { validatePluginSettings } from './utils/pluginValidation';
import './App.css';

export default function App() {
  const name = usePluginStore((s) => s.name);
  const version = usePluginStore((s) => s.version);
  const mainPackage = usePluginStore((s) => s.mainPackage);
  const description = usePluginStore((s) => s.description);
  const author = usePluginStore((s) => s.author);
  const blocks = usePluginStore((s) => s.blocks);
  const selectedBlockId = usePluginStore((s) => s.selectedBlockId);
  const loading = usePluginStore((s) => s.loading);
  const error = usePluginStore((s) => s.error);
  const successMessage = usePluginStore((s) => s.successMessage);
  const setLoading = usePluginStore((s) => s.setLoading);
  const setError = usePluginStore((s) => s.setError);
  const setSuccessMessage = usePluginStore((s) => s.setSuccessMessage);

  const [previewFiles, setPreviewFiles] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const settingsErrors = validatePluginSettings({
    name,
    version,
    mainPackage,
    author
  });
  const hasSettingsErrors = Object.keys(settingsErrors).length > 0;

  const buildPayload = () => {
    const eventBlocks = blocks.filter((b) => b.type === 'event');
    const blocksById = Object.fromEntries(blocks.map((b) => [b.id, b]));

    const toPayloadBlock = (b) => ({
      id: b.id,
      type: b.type,
      name: b.name,
      properties: b.properties,
      children: b.children || [],
      custom_code: b.customCode || ''
    });

    const payloadBlocks = [];
    for (const event of eventBlocks) {
      payloadBlocks.push(toPayloadBlock(event));
      for (const childId of event.children || []) {
        const child = blocksById[childId];
        if (child) {
          payloadBlocks.push(toPayloadBlock(child));
        }
      }
    }

    return {
      name: name.trim(),
      version,
      main_package: mainPackage,
      description,
      author,
      blocks: payloadBlocks
    };
  };

  const handlePreview = async () => {
    setError(null);
    setSuccessMessage(null);

    if (hasSettingsErrors) {
      const firstError = Object.values(settingsErrors)[0];
      setError(firstError);
      return;
    }
    const eventBlocks = blocks.filter((b) => b.type === 'event');
    if (eventBlocks.length === 0) {
      setError('Please add at least one event block to the canvas.');
      return;
    }
    const validationError = validateBlocks(blocks);
    if (validationError) {
      setError(validationError);
      return;
    }

    setPreviewLoading(true);
    try {
      const payload = buildPayload();
      const result = await apiService.previewCode(payload);
      setPreviewFiles(result.files);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to preview code.';
      setError(msg);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setSuccessMessage(null);

    if (hasSettingsErrors) {
      const firstError = Object.values(settingsErrors)[0];
      setError(firstError);
      return;
    }
    const eventBlocks = blocks.filter((b) => b.type === 'event');
    if (eventBlocks.length === 0) {
      setError('Please add at least one event block to the canvas.');
      return;
    }
    const validationError = validateBlocks(blocks);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      const result = await apiService.generatePlugin(payload);
      if (result.download_id) {
        apiService.downloadPlugin(result.download_id);
      }
      setSuccessMessage('Plugin generated successfully!');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to generate plugin.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">Minecraft Plugin Builder</header>
      <div className="content">
        <aside className="sidebar">
          <PluginSettings />
          <BlockPalette />
        </aside>
        <main className="main-area">
          <Canvas />
        </main>
        {selectedBlockId && (
          <ResizablePanel minWidth={300} maxWidth={800} defaultWidth={380}>
            <BlockEditor />
          </ResizablePanel>
        )}
      </div>
      <footer className="footer">
        <button
          className="preview-btn"
          onClick={handlePreview}
          disabled={loading || previewLoading || hasSettingsErrors}
          title={hasSettingsErrors ? 'Fix plugin settings to continue.' : undefined}
        >
          {previewLoading ? 'Loading...' : 'Preview Code'}
        </button>
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={loading || previewLoading || hasSettingsErrors}
          title={hasSettingsErrors ? 'Fix plugin settings to continue.' : undefined}
        >
          {loading ? 'Generating...' : 'Generate Plugin'}
        </button>
        {(loading || previewLoading) && <div className="spinner" />}
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </footer>

      {previewFiles && (
        <CodePreviewModal
          files={previewFiles}
          onClose={() => setPreviewFiles(null)}
        />
      )}
    </div>
  );
}
