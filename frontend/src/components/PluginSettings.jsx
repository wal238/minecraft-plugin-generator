import React, { useEffect, useMemo, useState } from 'react';
import usePluginStore from '../store/usePluginStore';
import { InfoTooltip } from './Tooltip';
import { suggestMainPackage, validatePluginSettings } from '../utils/pluginValidation';

/** Help text for each field */
const FIELD_HELP = {
  name: 'The display name of your plugin. This appears in /plugins list and server logs.',
  version: 'Semantic version (e.g., 1.0.0). Increment when you release updates.',
  mainPackage: 'Java package path for your plugin code. Use reverse domain notation (com.yourname.pluginname).',
  description: 'Brief description shown in plugin managers. Keep it under 100 characters.',
  author: 'Your name or team name. Shown in plugin info.',
};

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
  const [mainPackageTouched, setMainPackageTouched] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const shouldAutofill = !mainPackageTouched && (!mainPackage || mainPackage === 'com.example.myplugin');
    if (shouldAutofill && (name.trim() || author.trim())) {
      setMainPackage(suggestMainPackage(name, author));
    }
  }, [author, mainPackage, mainPackageTouched, name, setMainPackage]);

  const errors = useMemo(
    () =>
      validatePluginSettings({
        name,
        version,
        mainPackage,
        author
      }),
    [author, mainPackage, name, version]
  );

  return (
    <div className="plugin-settings">
      <div className="settings-title">
        <div className="settings-title-row">
          <span>Plugin Settings</span>
          <button
            type="button"
            className="settings-collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            aria-expanded={!collapsed}
          >
            {collapsed ? 'Show' : 'Hide'}
          </button>
        </div>
        <span className="settings-subtitle">Configure your Minecraft plugin</span>
      </div>

      {collapsed ? (
        <div className="settings-collapsed-note">Settings hidden</div>
      ) : (
        <>
      <div className="form-group">
        <label className="form-label" htmlFor="plugin-name">
          Plugin Name <span className="form-required">*</span>
          <InfoTooltip text={FIELD_HELP.name} />
        </label>
        <input
          id="plugin-name"
          className="form-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="MyAwesomePlugin"
        />
        {errors.name ? (
          <span className="form-hint form-hint-error">{errors.name}</span>
        ) : (
          !name && (
            <span className="form-hint form-hint-warning">Required - enter a plugin name</span>
          )
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="plugin-version">
          Version
          <InfoTooltip text={FIELD_HELP.version} />
        </label>
        <input
          id="plugin-version"
          className="form-input"
          type="text"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="1.0.0"
        />
        {errors.version ? (
          <span className="form-hint form-hint-error">{errors.version}</span>
        ) : (
          <span className="form-hint">Format: major.minor.patch (e.g., 1.0.0)</span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="plugin-package">
          Main Package
          <InfoTooltip text={FIELD_HELP.mainPackage} />
        </label>
        <input
          id="plugin-package"
          className="form-input form-input-mono"
          type="text"
          value={mainPackage}
          onChange={(e) => {
            setMainPackageTouched(true);
            setMainPackage(e.target.value);
          }}
          placeholder="com.example.myplugin"
        />
        {errors.mainPackage ? (
          <span className="form-hint form-hint-error">{errors.mainPackage}</span>
        ) : (
          <span className="form-hint">Java package path (lowercase, no spaces)</span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="plugin-description">
          Description
          <InfoTooltip text={FIELD_HELP.description} />
        </label>
        <input
          id="plugin-description"
          className="form-input"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A custom Minecraft plugin"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="plugin-author">
          Author
          <InfoTooltip text={FIELD_HELP.author} />
        </label>
        <input
          id="plugin-author"
          className="form-input"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="YourName"
        />
        {errors.author && <span className="form-hint form-hint-error">{errors.author}</span>}
      </div>
        </>
      )}
    </div>
  );
}
