import React, { useEffect, useMemo, useRef, useState } from 'react';
import usePluginStore from './store/usePluginStore';
import { apiService } from './services/api';
import PluginSettings from './components/PluginSettings';
import BlockPalette from './components/BlockPalette';
import Canvas from './components/Canvas';
import BlockEditor from './components/BlockEditor';
import ResizablePanel from './components/ResizablePanel';
import CodePreviewModal from './components/CodePreviewModal';
import WelcomeTour from './components/WelcomeTour';
import { validateBlocks, normalizeBlockDefinition } from './utils/blockSchema';
import { validatePluginSettings } from './utils/pluginValidation';
import { DEFAULT_BLOCKS, TEMPLATES } from './services/blockDefinitions';
import { useBlocks } from './hooks/useBlocks';
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
  const availableBlocks = usePluginStore((s) => s.availableBlocks);
  const setWorldOptions = usePluginStore((s) => s.setWorldOptions);

  const [previewFiles, setPreviewFiles] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [quickAddSelection, setQuickAddSelection] = useState('');
  const [templateSelection, setTemplateSelection] = useState('');
  const tourStartRef = useRef(null);

  const FAVORITES_KEY = 'mpb-favorites';
  const RECENTS_KEY = 'mpb-recents';

  const { addBlockFromDefinition, addChildFromDefinition, addTemplate } = useBlocks();

  const settingsErrors = validatePluginSettings({
    name,
    version,
    mainPackage,
    author
  });
  const hasSettingsErrors = Object.keys(settingsErrors).length > 0;

  useEffect(() => {
    let active = true;
    async function fetchWorlds() {
      try {
        const data = await apiService.getWorlds();
        if (active) {
          setWorldOptions(Array.isArray(data.worlds) ? data.worlds : []);
        }
      } catch {
        if (active) {
          setWorldOptions(['world', 'world_nether', 'world_the_end']);
        }
      }
    }
    fetchWorlds();
    return () => {
      active = false;
    };
  }, [setWorldOptions]);

  useEffect(() => {
    try {
      const storedFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      const storedRecents = JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
      if (Array.isArray(storedFavs)) setFavorites(storedFavs);
      if (Array.isArray(storedRecents)) setRecents(storedRecents);
    } catch {
      setFavorites([]);
      setRecents([]);
    }
  }, []);

  const persistList = (key, list) => {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
  };

  const toggleFavorite = (block) => {
    setFavorites((prev) => {
      const exists = prev.includes(block.id);
      const next = exists ? prev.filter((id) => id !== block.id) : [block.id, ...prev];
      persistList(FAVORITES_KEY, next);
      return next;
    });
  };

  const addRecent = (block) => {
    setRecents((prev) => {
      const next = [block.id, ...prev.filter((id) => id !== block.id)].slice(0, 8);
      persistList(RECENTS_KEY, next);
      return next;
    });
  };

  const clearRecents = () => {
    setRecents([]);
    persistList(RECENTS_KEY, []);
  };

  const normalizedDefaults = useMemo(
    () => ({
      ...DEFAULT_BLOCKS,
      events: DEFAULT_BLOCKS.events.map(normalizeBlockDefinition),
      actions: DEFAULT_BLOCKS.actions.map(normalizeBlockDefinition),
      custom_options: DEFAULT_BLOCKS.custom_options.map(normalizeBlockDefinition)
    }),
    []
  );

  const blocksForMenus = availableBlocks || normalizedDefaults;

  const quickAddMap = useMemo(() => {
    const map = new Map();
    for (const b of [...blocksForMenus.events, ...blocksForMenus.actions, ...blocksForMenus.custom_options]) {
      map.set(b.id, b);
    }
    return map;
  }, [blocksForMenus]);

  const findParentEventId = (childId) => {
    const event = blocks.find((b) => b.type === 'event' && (b.children || []).includes(childId));
    return event?.id || null;
  };

  const handleQuickAdd = (value) => {
    if (!value) return;
    const definition = quickAddMap.get(value);
    if (!definition) return;

    if (definition.type === 'event') {
      addBlockFromDefinition(definition);
      setQuickAddSelection('');
      return;
    }

    const selected = blocks.find((b) => b.id === selectedBlockId);
    const parentEventId =
      selected?.type === 'event'
        ? selected.id
        : selected?.type
          ? findParentEventId(selected.id)
          : null;

    if (!parentEventId) {
      setError('Select an event on the canvas to add actions or conditions.');
      setQuickAddSelection('');
      return;
    }

    addChildFromDefinition(parentEventId, definition);
    setQuickAddSelection('');
  };

  const handleTemplateSelect = (value) => {
    if (!value) return;
    const tpl = TEMPLATES.find((t) => t.id === value);
    if (tpl) {
      addTemplate(tpl);
      setTemplateSelection('');
    }
  };

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
      <header className="header">
        <div className="header-title">Minecraft Plugin Builder</div>
        <button
          type="button"
          className="header-help-btn"
          onClick={() => tourStartRef.current?.()}
          title="Show guided tour"
          aria-label="Help"
        >
          ?
        </button>
        <div className="header-controls" data-tour="header-toolbar">
          <input
            type="text"
            className="header-search"
            placeholder="Search blocks and templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-tour="header-search"
          />
          <label className="header-toggle">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
            />
            Favorites only
          </label>
          <button
            type="button"
            className="header-btn"
            onClick={clearRecents}
            disabled={recents.length === 0}
          >
            Clear Recents
          </button>
          <select
            className="header-select header-select-compact"
            value={quickAddSelection}
            data-tour="header-quick-add"
            onChange={(e) => {
              const value = e.target.value;
              setQuickAddSelection(value);
              handleQuickAdd(value);
            }}
          >
            <option value="">Quick Add...</option>
            <optgroup label="Events">
              {blocksForMenus.events.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Actions">
              {blocksForMenus.actions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Custom">
              {blocksForMenus.custom_options.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </optgroup>
          </select>
          <select
            className="header-select"
            value={templateSelection}
            onChange={(e) => {
              const value = e.target.value;
              setTemplateSelection(value);
              handleTemplateSelect(value);
            }}
          >
            <option value="">Recipes...</option>
            {TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
          <span data-tour="preview-generate" style={{ display: 'contents' }}>
            <button
              className="preview-btn"
              onClick={handlePreview}
              disabled={loading || previewLoading || hasSettingsErrors}
              title={hasSettingsErrors ? 'Fix plugin settings to continue.' : undefined}
            >
              {previewLoading ? 'Loading...' : 'Preview'}
            </button>
            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading || previewLoading || hasSettingsErrors}
              title={hasSettingsErrors ? 'Fix plugin settings to continue.' : undefined}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </span>
          {(loading || previewLoading) && <div className="spinner" />}
        </div>
      </header>
      <div className="content">
        <aside className="sidebar">
          <div data-tour="plugin-settings">
            <PluginSettings />
          </div>
          <BlockPalette
            search={search}
            favorites={favorites}
            recents={recents}
            favoritesOnly={favoritesOnly}
            onToggleFavorite={toggleFavorite}
            onAddRecent={addRecent}
          />
        </aside>
        <main className="main-area" data-tour="canvas">
          <Canvas />
        </main>
        {selectedBlockId && (
          <ResizablePanel minWidth={300} maxWidth={800} defaultWidth={380} data-tour="block-editor">
            <BlockEditor />
          </ResizablePanel>
        )}
      </div>
      <footer className="footer">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </footer>

      {previewFiles && (
        <CodePreviewModal
          files={previewFiles}
          onClose={() => setPreviewFiles(null)}
        />
      )}

      <WelcomeTour onRequestStart={(fn) => { tourStartRef.current = fn; }} />
    </div>
  );
}
