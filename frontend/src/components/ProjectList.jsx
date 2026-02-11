import React, { useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import useAuthStore from '../store/useAuthStore';

export default function ProjectList({ onLoadProject, onClose }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [newName, setNewName] = useState('');
  const profile = useAuthStore((s) => s.profile);

  useEffect(() => {
    loadProjects();
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

  const handleLoad = async (id) => {
    try {
      const project = await projectService.getProject(id);
      if (project) {
        onLoadProject(project);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="project-list-overlay" onClick={onClose}>
      <div className="project-list" onClick={(e) => e.stopPropagation()}>
        <div className="project-list-header">
          <h3>My Projects</h3>
          <button className="project-list-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="project-list-error">{error}</div>}

        {loading ? (
          <div className="project-list-loading">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="project-list-empty">No saved projects yet.</div>
        ) : (
          <div className="project-list-items">
            {projects.map((project) => (
              <div key={project.id} className="project-list-item">
                {renaming === project.id ? (
                  <div className="project-rename">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename(project.id)}
                      autoFocus
                    />
                    <button onClick={() => handleRename(project.id)}>Save</button>
                    <button onClick={() => { setRenaming(null); setNewName(''); }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="project-info" onClick={() => handleLoad(project.id)}>
                      <span className="project-name">{project.name}</span>
                      <span className="project-date">
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="project-actions">
                      <button
                        title="Rename"
                        onClick={() => { setRenaming(project.id); setNewName(project.name); }}
                      >
                        &#9998;
                      </button>
                      <button title="Delete" onClick={() => handleDelete(project.id)}>
                        &#128465;
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
