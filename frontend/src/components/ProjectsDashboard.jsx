import React, { useEffect, useRef, useState } from 'react';
import { projectService } from '../services/projectService';
import useAuthStore from '../store/useAuthStore';

function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getBlockCounts(config) {
  if (!config?.blocks || !Array.isArray(config.blocks)) return { events: 0, actions: 0 };
  const events = config.blocks.filter((b) => b.type === 'event').length;
  const actions = config.blocks.filter((b) => b.type !== 'event').length;
  return { events, actions };
}

export default function ProjectsDashboard({ onNewProject, onLoadProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState('');
  const menuRef = useRef(null);

  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const landingUrl = import.meta.env.VITE_LANDING_URL || 'http://localhost:3000';

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.listProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setMenuOpen(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRename = async (id) => {
    if (!newName.trim()) return;
    try {
      await projectService.renameProject(id, newName.trim());
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: newName.trim() } : p))
      );
      setRenaming(null);
      setNewName('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCardClick = async (project) => {
    try {
      const full = await projectService.getProject(project.id);
      if (full) {
        onLoadProject(full);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-title">Minecraft Plugin Builder</div>
        <div className="header-auth">
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
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-title-row">
          <div>
            <h1 className="dashboard-title">My Projects</h1>
            {!loading && (
              <p className="dashboard-subtitle">
                {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              </p>
            )}
          </div>
        </div>

        {error && <div className="dashboard-error">{error}</div>}

        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner" />
            <span>Loading projects...</span>
          </div>
        ) : (
          <div className="dashboard-grid">
            {/* New Project card */}
            <button
              type="button"
              className="project-card project-card-new"
              onClick={onNewProject}
            >
              <div className="project-card-new-icon">+</div>
              <div className="project-card-new-label">New Project</div>
            </button>

            {/* Project cards */}
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => {
                  if (renaming !== project.id) handleCardClick(project);
                }}
              >
                <div className="project-card-header">
                  {renaming === project.id ? (
                    <div className="project-card-rename" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(project.id);
                          if (e.key === 'Escape') { setRenaming(null); setNewName(''); }
                        }}
                        autoFocus
                        className="project-card-rename-input"
                      />
                      <button
                        className="project-card-rename-save"
                        onClick={() => handleRename(project.id)}
                      >
                        Save
                      </button>
                      <button
                        className="project-card-rename-cancel"
                        onClick={() => { setRenaming(null); setNewName(''); }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="project-card-name" title={project.name}>
                        {project.name}
                      </span>
                      <div className="project-card-menu-wrapper" ref={menuOpen === project.id ? menuRef : null}>
                        <button
                          type="button"
                          className="project-card-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(menuOpen === project.id ? null : project.id);
                          }}
                          title="Options"
                        >
                          &#8943;
                        </button>
                        {menuOpen === project.id && (
                          <div className="project-card-menu" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setRenaming(project.id);
                                setNewName(project.name);
                                setMenuOpen(null);
                              }}
                            >
                              Rename
                            </button>
                            <button
                              className="project-card-menu-danger"
                              onClick={() => handleDelete(project.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="project-card-meta">
                  {project.config?.mainPackage && (
                    <div className="project-card-meta-row">
                      <span className="project-card-meta-label">Package</span>
                      <span className="project-card-meta-value project-card-meta-mono">
                        {project.config.mainPackage}
                      </span>
                    </div>
                  )}
                  <div className="project-card-meta-row">
                    <span className="project-card-meta-label">Version</span>
                    <span className="project-card-meta-value">
                      {project.config?.version || project.version || '1.0.0'}
                    </span>
                  </div>
                  {project.config?.blocks && (
                    <div className="project-card-meta-row">
                      <span className="project-card-meta-label">Blocks</span>
                      <span className="project-card-meta-value">
                        {(() => {
                          const { events, actions } = getBlockCounts(project.config);
                          return `${events} event${events !== 1 ? 's' : ''}, ${actions} action${actions !== 1 ? 's' : ''}`;
                        })()}
                      </span>
                    </div>
                  )}
                  <div className="project-card-meta-row">
                    <span className="project-card-meta-label">Edited</span>
                    <span className="project-card-meta-value">
                      {timeAgo(project.updated_at)}
                    </span>
                  </div>
                </div>

                <div className="project-card-footer">
                  <span className="project-card-version-badge">v{project.version || 1}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
