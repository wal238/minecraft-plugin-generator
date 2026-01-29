import React, { useState, useRef, useEffect } from 'react';
import { ITEM_CATEGORIES, getItemDisplayName } from '../data/minecraftItems';

/**
 * Searchable dropdown for selecting Minecraft item types.
 */
export default function ItemSelect({ value, onChange, placeholder = 'Search items...' }) {
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

  // Filter items based on search
  const getFilteredItems = () => {
    if (!search.trim()) {
      return ITEM_CATEGORIES[activeCategory]?.items || [];
    }
    const searchLower = search.toLowerCase();
    const allItems = Object.values(ITEM_CATEGORIES).flatMap((cat) => cat.items);
    const uniqueItems = [...new Set(allItems)];
    return uniqueItems.filter((item) =>
      item.toLowerCase().includes(searchLower) ||
      getItemDisplayName(item).toLowerCase().includes(searchLower)
    );
  };

  const filteredItems = getFilteredItems();

  const handleSelect = (item) => {
    onChange(item);
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
          placeholder={value ? getItemDisplayName(value) : placeholder}
          value={search}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
        />
        {value && !search && (
          <span className="item-select-value">{getItemDisplayName(value)}</span>
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
              {Object.entries(ITEM_CATEGORIES).map(([key, cat]) => (
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
            {filteredItems.length === 0 ? (
              <div className="item-select-empty">No items found</div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`item-select-item ${value === item ? 'selected' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  {getItemDisplayName(item)}
                  <span className="item-select-item-id">{item}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
