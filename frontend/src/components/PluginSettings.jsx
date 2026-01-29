import React from 'react';
import usePluginStore from '../store/usePluginStore';

export default function PluginSettings() {
  const name = usePluginStore((s) => s.name);
  const version = usePluginStore((s) => s.version);
  const mainPackage = usePluginStore((s) => s.mainPackage);
  const description = usePluginStore((s) => s.description);
  const author = usePluginStore((s) => s.author);
  const setName = usePluginStore((s) => s.setName);
  const setVersion = usePluginStore((s) => s.setVersion);
  const setMainPackage = usePluginStore((s) => s.setMainPackage);
  const setDescription = usePluginStore((s) => s.setDescription);
  const setAuthor = usePluginStore((s) => s.setAuthor);

  return (
    <div className="plugin-settings">
      <h3 className="settings-title">Plugin Settings</h3>
      <div className="form-group">
        <label className="form-label" htmlFor="plugin-name">Plugin Name</label>
        <input id="plugin-name" className="form-input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="MyPlugin" />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="plugin-version">Version</label>
        <input id="plugin-version" className="form-input" type="text" value={version} onChange={(e) => setVersion(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="plugin-package">Main Package</label>
        <input id="plugin-package" className="form-input" type="text" value={mainPackage} onChange={(e) => setMainPackage(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="plugin-description">Description</label>
        <input id="plugin-description" className="form-input" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A Minecraft plugin" />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="plugin-author">Author</label>
        <input id="plugin-author" className="form-input" type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Your name" />
      </div>
    </div>
  );
}
