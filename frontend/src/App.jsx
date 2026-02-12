import React, { useEffect, useMemo, useRef, useState } from 'react';
import usePluginStore from './store/usePluginStore';
import useAuthStore from './store/useAuthStore';
import { apiService } from './services/api';
import { supabase } from './services/supabase';
import { projectService } from './services/projectService';
import PluginSettings from './components/PluginSettings';
import BlockPalette from './components/BlockPalette';
import Canvas from './components/Canvas';
import BlockEditor from './components/BlockEditor';
import ResizablePanel from './components/ResizablePanel';
import CodePreviewModal from './components/CodePreviewModal';
import ProjectsDashboard from './components/ProjectsDashboard';
import UpgradePrompt from './components/UpgradePrompt';
import WelcomeTour from './components/WelcomeTour';
import { validateBlocks, normalizeBlockDefinition } from './utils/blockSchema';
import { validatePluginSettings } from './utils/pluginValidation';
import { DEFAULT_BLOCKS, TEMPLATES } from './services/blockDefinitions';
import { useBlocks } from './hooks/useBlocks';
import { getFeatures, isBlockLocked, getBlockFeatureLabel, PREMIUM_BLOCKS } from './config/tierFeatures';
import './App.css';

export default function App() {
  const name = usePluginStore((s) => s.name);
  const version = usePluginStore((s) => s.version);
  const mainPackage = usePluginStore((s) => s.mainPackage);
  const description = usePluginStore((s) => s.description);
  const author = usePluginStore((s) => s.author);
  const paperVersion = usePluginStore((s) => s.paperVersion);
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

  const initialize = useAuthStore((s) => s.initialize);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const authInitialized = useAuthStore((s) => s.initialized);
  const signOut = useAuthStore((s) => s.signOut);

  const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000';
  const authEnabled = !!supabase;

  const [currentView, setCurrentView] = useState('editor');
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [currentProjectVersion, setCurrentProjectVersion] = useState(null);
  const [previewFiles, setPreviewFiles] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [quickAddSelection, setQuickAddSelection] = useState('');
  const [templateSelection, setTemplateSelection] = useState('');
  const [upgradeMessage, setUpgradeMessage] = useState(null);
  const [buildStatus, setBuildStatus] = useState(null);
  const [showSaveProjectModal, setShowSaveProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [savingNewProject, setSavingNewProject] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('mpb-theme') || 'dark'; } catch { return 'dark'; }
  });
  const tourStartRef = useRef(null);
  const postLoginHandledRef = useRef(false);

  const FAVORITES_KEY = 'mpb-favorites';
  const RECENTS_KEY = 'mpb-recents';
  const TOUR_COMPLETED_KEY = 'mpb-tour-completed';

  const { addBlockFromDefinition, addChildFromDefinition, addTemplate } = useBlocks();

  const settingsErrors = validatePluginSettings({
    name,
    version,
    mainPackage,
    author
  });
  const hasSettingsErrors = Object.keys(settingsErrors).length > 0;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('mpb-theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    initialize();
  }, [initialize]);

  // First login experience: show editor overview tour before dashboard
  useEffect(() => {
    if (!authEnabled || !authInitialized) return;

    if (!user) {
      postLoginHandledRef.current = false;
      return;
    }

    if (postLoginHandledRef.current) return;
    postLoginHandledRef.current = true;

    let hasCompletedTour = false;
    try {
      hasCompletedTour = localStorage.getItem(TOUR_COMPLETED_KEY) === 'true';
    } catch {
      hasCompletedTour = false;
    }

    if (hasCompletedTour) {
      setCurrentView('dashboard');
      return;
    }

    setCurrentView('editor');
    window.setTimeout(() => {
      tourStartRef.current?.();
    }, 700);
  }, [authEnabled, authInitialized, user]);

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
      // Check if template uses any premium blocks
      const t = authEnabled ? useAuthStore.getState().getTier() : 'pro';
      const allChildren = tpl.children || [];
      for (const child of allChildren) {
        const childId = child.id;
        if (childId && isBlockLocked(childId, t)) {
          const label = getBlockFeatureLabel(childId) || child.name;
          setUpgradeMessage(`This recipe uses ${label}, which requires Premium.`);
          setTemplateSelection('');
          return;
        }
      }
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
      paper_version: paperVersion,
      blocks: payloadBlocks
    };
  };

  const checkTierLimits = () => {
    const t = authEnabled ? useAuthStore.getState().getTier() : 'pro';
    const f = getFeatures(t);
    const evts = blocks.filter((b) => b.type === 'event').length;
    const acts = blocks.filter((b) => b.type !== 'event').length;

    if (f.maxEvents !== -1 && evts > f.maxEvents) {
      setUpgradeMessage(`Free tier allows up to ${f.maxEvents} events. Upgrade to add more.`);
      return false;
    }
    if (f.maxActions !== -1 && acts > f.maxActions) {
      setUpgradeMessage(`Free tier allows up to ${f.maxActions} actions. Upgrade to add more.`);
      return false;
    }
    for (const block of blocks) {
      if (isBlockLocked(block.id, t)) {
        const label = getBlockFeatureLabel(block.id) || block.name;
        setUpgradeMessage(`"${block.name}" requires Premium. ${label} is a paid feature.`);
        return false;
      }
    }
    return true;
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
    if (!checkTierLimits()) return;

    setPreviewLoading(true);
    try {
      const payload = buildPayload();
      const result = await apiService.previewCode(payload);
      setPreviewFiles(result.files);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to preview code.';
      if (err.response?.status === 403) {
        setUpgradeMessage(msg);
      } else {
        setError(msg);
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setSuccessMessage(null);
    setBuildStatus(null);

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
    if (!checkTierLimits()) return;

    setLoading(true);
    try {
      const payload = buildPayload();

      // Try async build job system first, fall back to sync
      try {
        setBuildStatus('submitting');
        const result = await apiService.submitBuildJob(payload);
        setBuildStatus('queued');

        const POLL_INTERVAL = 2000;
        const MAX_POLLS = 90;
        for (let i = 0; i < MAX_POLLS; i++) {
          await new Promise((r) => setTimeout(r, POLL_INTERVAL));
          const status = await apiService.getBuildJobStatus(result.job_id);
          setBuildStatus(status.status);

          if (status.status === 'succeeded') {
            if (status.artifact_url) {
              window.open(status.artifact_url, '_blank');
            }
            setSuccessMessage('Plugin generated successfully!');
            return;
          }
          if (status.status === 'failed') {
            setError(status.error_message || 'Build failed.');
            return;
          }
        }
        setError('Build is taking longer than expected. Check back later.');
      } catch (buildErr) {
        // Only fall back to sync for availability errors (endpoint missing, service down).
        // Business-rule rejections (403 quota, 429 rate limit) must NOT fall through.
        const status = buildErr.response?.status;
        const isAvailabilityError = !status || status === 404 || status >= 500;
        if (!isAvailabilityError) {
          throw buildErr;
        }
        try {
          setBuildStatus(null);
          const result = await apiService.generatePlugin(payload);
          if (result.download_id) {
            apiService.downloadPlugin(result.download_id);
          }
          setSuccessMessage('Plugin generated successfully!');
        } catch (syncErr) {
          throw syncErr;
        }
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to generate plugin.';
      if (err.response?.status === 403) {
        setUpgradeMessage(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
      setBuildStatus(null);
    }
  };

  const handleLoadProject = (project) => {
    if (project?.config) {
      const config = project.config;
      if (config.name) usePluginStore.getState().setName(config.name);
      if (config.version) usePluginStore.getState().setVersion(config.version);
      if (config.mainPackage) usePluginStore.getState().setMainPackage(config.mainPackage);
      if (config.description) usePluginStore.getState().setDescription(config.description);
      if (config.author) usePluginStore.getState().setAuthor(config.author);
      if (config.blocks) usePluginStore.getState().setBlocks(config.blocks);
      if (config.paperVersion) usePluginStore.getState().setPaperVersion(config.paperVersion);
    }
    setCurrentProjectId(project?.id || null);
    setCurrentProjectVersion(project?.version || null);
    setCurrentView('editor');
  };

  const handleNewProject = () => {
    usePluginStore.getState().reset();
    setCurrentProjectId(null);
    setCurrentProjectVersion(null);
    setCurrentView('editor');
  };

  const getProjectConfig = () => {
    const state = usePluginStore.getState();
    return {
      name: state.name,
      version: state.version,
      mainPackage: state.mainPackage,
      description: state.description,
      author: state.author,
      paperVersion: state.paperVersion,
      blocks: state.blocks,
    };
  };

  const openSaveProjectModal = () => {
    const state = usePluginStore.getState();
    setError(null);
    setNewProjectName((state.name || '').trim() || 'My Plugin');
    setShowSaveProjectModal(true);
  };

  const closeSaveProjectModal = () => {
    if (savingNewProject) return;
    setShowSaveProjectModal(false);
  };

  const handleCreateProject = async () => {
    const projectName = newProjectName.trim();
    if (!projectName) {
      setError('Project name is required.');
      return;
    }

    setError(null);
    setSavingNewProject(true);
    try {
      const created = await projectService.createProject(projectName, getProjectConfig());
      setCurrentProjectId(created.id);
      setCurrentProjectVersion(created.version);
      setShowSaveProjectModal(false);
      setSuccessMessage('Project created.');
    } catch (err) {
      if (err.message === 'FREE_TIER_LIMIT') {
        setUpgradeMessage('You have reached the free tier project limit. Upgrade to save more projects.');
      } else {
        setError(err.message || 'Failed to save project.');
      }
    } finally {
      setSavingNewProject(false);
    }
  };

  const handleSaveProject = async () => {
    try {
      if (currentProjectId) {
        const updated = await projectService.saveProject(currentProjectId, getProjectConfig(), currentProjectVersion);
        setCurrentProjectVersion(updated.version);
        setSuccessMessage('Project saved.');
      } else {
        openSaveProjectModal();
      }
    } catch (err) {
      if (err.message === 'FREE_TIER_LIMIT') {
        setUpgradeMessage('You have reached the free tier project limit. Upgrade to save more projects.');
      } else {
        setError(err.message || 'Failed to save project.');
      }
    }
  };

  // Auth gate — require login when Supabase is configured
  if (authEnabled && authInitialized && !user) {
    return (
      <div className="app auth-gate">
        <div className="auth-gate-card">
          <div className="auth-gate-logo">Minecraft Plugin Builder</div>
          <h1 className="auth-gate-title">Sign in to get started</h1>
          <p className="auth-gate-subtitle">
            Create a free account, verify your email, then sign in to start building Minecraft plugins
          </p>
          <div className="auth-gate-buttons">
            <a
              href={`${landingUrl}/signup?redirect=${encodeURIComponent(window.location.origin)}`}
              className="auth-gate-btn auth-gate-btn-primary"
            >
              Create Account
            </a>
            <a
              href={`${landingUrl}/login?redirect=${encodeURIComponent(window.location.origin)}`}
              className="auth-gate-btn auth-gate-btn-secondary"
            >
              Sign In
            </a>
          </div>
          <p className="auth-gate-note">Free tier includes 4 events, 8 actions, and 1 build per month</p>
        </div>
      </div>
    );
  }

  // Loading spinner while auth initializes
  if (authEnabled && !authInitialized) {
    return (
      <div className="app auth-gate">
        <div className="spinner" />
      </div>
    );
  }

  // Tier for current user (local dev = pro, no limits)
  const tier = authEnabled ? useAuthStore.getState().getTier() : 'pro';
  const features = getFeatures(tier);
  const eventCount = blocks.filter((b) => b.type === 'event').length;
  const actionCount = blocks.filter((b) => b.type !== 'event').length;

  if (currentView === 'dashboard' && authEnabled && user) {
    return (
      <div className="app">
        <ProjectsDashboard
          onNewProject={handleNewProject}
          onLoadProject={handleLoadProject}
        />
        {upgradeMessage && (
          <UpgradePrompt
            message={upgradeMessage}
            onClose={() => setUpgradeMessage(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-title">Minecraft Plugin Builder</div>
        {authEnabled && user && (
          <div className="header-nav">
            <button
              type="button"
              className="header-btn"
              onClick={() => setCurrentView('dashboard')}
              title="My Projects"
            >
              Projects
            </button>
            <button
              type="button"
              className="header-btn"
              onClick={handleSaveProject}
              title="Save project"
            >
              Save
            </button>
          </div>
        )}
        <div className="header-actions" data-tour="preview-generate">
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
            {loading
              ? buildStatus === 'running' ? 'Building...'
              : buildStatus === 'queued' ? 'Queued...'
              : 'Generating...'
              : 'Generate'}
          </button>
          {(loading || previewLoading) && <div className="spinner" />}
        </div>
        <div className="header-divider" />
        <div className="header-right">
          <button
            type="button"
            className="header-theme-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '\u2600' : '\u263D'}
          </button>
          <button
            type="button"
            className="header-help-btn"
            onClick={() => tourStartRef.current?.()}
            title="Show guided tour"
            aria-label="Help"
          >
            ?
          </button>
          {authEnabled && (
            <>
              {authInitialized && !user && (
                <a
                  href={`${landingUrl}/login?redirect=${encodeURIComponent(window.location.origin)}`}
                  className="header-btn header-login-btn"
                >
                  Sign In
                </a>
              )}
              {user && (
                <>
                  {profile && (
                    <span className={`build-counter${
                      profile.builds_used_this_period >= (
                        profile.subscription_tier === 'pro' ? 20
                        : profile.subscription_tier === 'premium' ? 5
                        : 1
                      ) ? ' at-limit' : ''
                    }`}>
                      {profile.builds_used_this_period}/
                      {profile.subscription_tier === 'pro' ? 20
                        : profile.subscription_tier === 'premium' ? 5
                        : 1} builds
                    </span>
                  )}
                  <span className="header-user-email" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    type="button"
                    className="header-btn header-signout-btn"
                    onClick={signOut}
                  >
                    Sign Out
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </header>
      <div className="content">
        <aside className="sidebar">
          <div data-tour="plugin-settings">
            <PluginSettings />
          </div>
          <BlockPalette
            search={search}
            onSearchChange={setSearch}
            favorites={favorites}
            recents={recents}
            favoritesOnly={favoritesOnly}
            onFavoritesOnlyChange={setFavoritesOnly}
            onClearRecents={clearRecents}
            onToggleFavorite={toggleFavorite}
            onAddRecent={addRecent}
            quickAddSelection={quickAddSelection}
            onQuickAdd={handleQuickAdd}
            onQuickAddSelectionChange={setQuickAddSelection}
            blocksForMenus={blocksForMenus}
            templateSelection={templateSelection}
            onTemplateSelect={handleTemplateSelect}
            onTemplateSelectionChange={setTemplateSelection}
            eventCount={eventCount}
            actionCount={actionCount}
            features={features}
            showLimits={authEnabled && !!user}
            tier={tier}
            onUpgradeNeeded={setUpgradeMessage}
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

      {showSaveProjectModal && (
        <div className="modal-overlay" onClick={closeSaveProjectModal}>
          <div className="project-save-modal" onClick={(e) => e.stopPropagation()}>
            <div className="project-save-modal-header">
              <h2>Create Project</h2>
              <button
                type="button"
                className="modal-close"
                onClick={closeSaveProjectModal}
                disabled={savingNewProject}
                aria-label="Close create project dialog"
              >
                &times;
              </button>
            </div>
            <form
              className="project-save-modal-body"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateProject();
              }}
            >
              <label className="form-label" htmlFor="project-name-input">
                Project Name
              </label>
              <input
                id="project-name-input"
                className="form-input project-save-input"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                maxLength={120}
                autoFocus
                disabled={savingNewProject}
                placeholder="My Plugin"
              />
              <p className="project-save-hint">Give this project a name so you can find it later.</p>
              <div className="project-save-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeSaveProjectModal}
                  disabled={savingNewProject}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="generate-btn"
                  disabled={savingNewProject}
                >
                  {savingNewProject ? 'Saving...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <WelcomeTour onRequestStart={(fn) => { tourStartRef.current = fn; }} />

      {upgradeMessage && (
        <UpgradePrompt
          message={upgradeMessage}
          onClose={() => setUpgradeMessage(null)}
        />
      )}
    </div>
  );
}
