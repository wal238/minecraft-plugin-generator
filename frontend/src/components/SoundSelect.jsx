import React, { useState, useRef, useEffect } from 'react';
import { SOUND_CATEGORIES, getSoundDisplayName } from '../data/minecraftSounds';

/**
 * Searchable dropdown for selecting Minecraft sound types.
 */
export default function SoundSelect({ value, onChange, placeholder = 'Search sounds...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('popular');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter sounds based on search
  const getFilteredSounds = () => {
    if (!search.trim()) {
      return SOUND_CATEGORIES[activeCategory]?.sounds || [];
    }
    const searchLower = search.toLowerCase();
    const allSounds = Object.values(SOUND_CATEGORIES).flatMap((cat) => cat.sounds);
    const uniqueSounds = [...new Set(allSounds)];
    return uniqueSounds.filter((sound) =>
      sound.toLowerCase().includes(searchLower) ||
      getSoundDisplayName(sound).toLowerCase().includes(searchLower)
    );
  };

  const filteredSounds = getFilteredSounds();

  const handleSelect = (sound) => {
    onChange(sound);
    setIsOpen(false);
    setSearch('');
  };

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="item-select" ref={containerRef}>
      <div className="item-select-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="form-input item-select-input"
          placeholder={value ? getSoundDisplayName(value) : placeholder}
          value={search}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
        {value && !search && (
          <span className="item-select-value">{getSoundDisplayName(value)}</span>
        )}
        <button
          type="button"
          className="item-select-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>

      {isOpen && (
        <div className="item-select-dropdown">
          {!search.trim() && (
            <div className="item-select-categories">
              {Object.entries(SOUND_CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  type="button"
                  className={`item-select-category ${activeCategory === key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
          <div className="item-select-list">
            {filteredSounds.length === 0 ? (
              <div className="item-select-empty">No sounds found</div>
            ) : (
              filteredSounds.map((sound) => (
                <button
                  key={sound}
                  type="button"
                  className={`item-select-item ${value === sound ? 'selected' : ''}`}
                  onClick={() => handleSelect(sound)}
                >
                  {getSoundDisplayName(sound)}
                  <span className="item-select-item-id">{sound}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
