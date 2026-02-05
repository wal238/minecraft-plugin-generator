import { useState, useRef, useEffect, useMemo, useCallback, useDeferredValue } from 'react';

/**
 * Searchable dropdown with grouped options.
 * Options format: { 'Group Name': ['OPTION_1', 'OPTION_2'], ... }
 */
export default function GroupedSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const groups = useMemo(() => Object.keys(options), [options]);
  const deferredSearch = useDeferredValue(search);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search
  const optionsLower = useMemo(() => {
    const lower = {};
    for (const [group, items] of Object.entries(options)) {
      lower[group] = items.map((item) => item.toLowerCase());
    }
    return lower;
  }, [options]);

  const filteredOptions = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) {
      return activeGroup ? { [activeGroup]: options[activeGroup] } : options;
    }

    const filtered = {};
    for (const [group, items] of Object.entries(options)) {
      if (activeGroup && group !== activeGroup) continue;
      const lowerItems = optionsLower[group] || [];
      const matches = items.filter((item, index) =>
        lowerItems[index]?.includes(query)
      );
      if (matches.length > 0) {
        filtered[group] = matches;
      }
    }
    return filtered;
  }, [activeGroup, deferredSearch, options, optionsLower]);

  const hasResults = useMemo(() => Object.keys(filteredOptions).length > 0, [filteredOptions]);

  const handleSelect = useCallback((item) => {
    onChange(item);
    setOpen(false);
    setSearch('');
  }, [onChange]);

  const formatLabel = useCallback((item) => {
    return item.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }, []);

  return (
    <div className="grouped-select" ref={containerRef}>
      <div className="grouped-select-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="form-input grouped-select-input"
          value={open ? search : (value ? formatLabel(value) : '')}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={value ? formatLabel(value) : placeholder}
        />
        <button
          type="button"
          className="grouped-select-toggle"
          onClick={() => {
            setOpen(!open);
            if (!open) inputRef.current?.focus();
          }}
        >
          {open ? '\u25B2' : '\u25BC'}
        </button>
      </div>

      {open && (
        <div className="grouped-select-dropdown">
          {/* Category tabs */}
          <div className="grouped-select-categories">
            <button
              type="button"
              className={`grouped-select-category ${activeGroup === null ? 'active' : ''}`}
              onClick={() => setActiveGroup(null)}
            >
              All
            </button>
            {groups.map((group) => (
              <button
                key={group}
                type="button"
                className={`grouped-select-category ${activeGroup === group ? 'active' : ''}`}
                onClick={() => setActiveGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Options list */}
          <div className="grouped-select-list">
            {hasResults ? (
              Object.entries(filteredOptions).map(([group, items]) => (
                <div key={group} className="grouped-select-group">
                  <div className="grouped-select-group-label">{group}</div>
                  {items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`grouped-select-item ${value === item ? 'selected' : ''}`}
                      onClick={() => handleSelect(item)}
                    >
                      <span>{formatLabel(item)}</span>
                      <span className="grouped-select-item-id">{item}</span>
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <div className="grouped-select-empty">No matches found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
