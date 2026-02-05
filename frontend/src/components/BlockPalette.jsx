import { useCallback, useEffect, useMemo, useState } from 'react';
import usePluginStore from '../store/usePluginStore';
import { apiService } from '../services/api';
import { DEFAULT_BLOCKS, TEMPLATES } from '../services/blockDefinitions';
import { normalizeBlockDefinition } from '../utils/blockSchema';
import { useDragDrop } from '../hooks/useDragDrop';
import { useBlocks } from '../hooks/useBlocks';
import BlockItem from './BlockItem';
import Tooltip from './Tooltip';

export default function BlockPalette() {
  const availableBlocks = usePluginStore((state) => state.availableBlocks);
  const setAvailableBlocks = usePluginStore((state) => state.setAvailableBlocks);
  const { handleDragStart } = useDragDrop();
  const { addTemplate } = useBlocks();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [recents, setRecents] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const FAVORITES_KEY = 'mpb-favorites';
  const RECENTS_KEY = 'mpb-recents';

  useEffect(() => {
    async function fetchBlocks() {
      try {
        const data = await apiService.getBlocks();
        const normalized = {
          ...data,
          events: data.events.map(normalizeBlockDefinition),
          actions: data.actions.map(normalizeBlockDefinition),
          custom_options: data.custom_options.map(normalizeBlockDefinition)
        };
        setAvailableBlocks(normalized);
      } catch {
        const normalizedDefaults = {
          ...DEFAULT_BLOCKS,
          events: DEFAULT_BLOCKS.events.map(normalizeBlockDefinition),
          actions: DEFAULT_BLOCKS.actions.map(normalizeBlockDefinition),
          custom_options: DEFAULT_BLOCKS.custom_options.map(normalizeBlockDefinition)
        };
        setAvailableBlocks(normalizedDefaults);
      }
    }
    fetchBlocks();
  }, [setAvailableBlocks]);

  const defaultBlocks = useMemo(
    () => ({
      ...DEFAULT_BLOCKS,
      events: DEFAULT_BLOCKS.events.map(normalizeBlockDefinition),
      actions: DEFAULT_BLOCKS.actions.map(normalizeBlockDefinition),
      custom_options: DEFAULT_BLOCKS.custom_options.map(normalizeBlockDefinition)
    }),
    []
  );

  const blocks = useMemo(
    () => availableBlocks || defaultBlocks,
    [availableBlocks, defaultBlocks]
  );

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

  const persistList = useCallback((key, list) => {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
  }, []);

  const allBlocksById = useMemo(() => {
    const map = new Map();
    for (const block of [...blocks.events, ...blocks.actions, ...blocks.custom_options]) {
      map.set(block.id, block);
    }
    return map;
  }, [blocks.actions, blocks.custom_options, blocks.events]);

  const onToggleFavorite = useCallback(
    (block) => {
      setFavorites((prev) => {
        const exists = prev.includes(block.id);
        const next = exists ? prev.filter((id) => id !== block.id) : [block.id, ...prev];
        persistList(FAVORITES_KEY, next);
        return next;
      });
    },
    [persistList]
  );

  const addRecent = useCallback(
    (block) => {
      setRecents((prev) => {
        const next = [block.id, ...prev.filter((id) => id !== block.id)].slice(0, 8);
        persistList(RECENTS_KEY, next);
        return next;
      });
    },
    [persistList]
  );

  const clearRecents = useCallback(() => {
    setRecents([]);
    persistList(RECENTS_KEY, []);
  }, [persistList]);

  const onDragStart = useCallback(
    (e, block) => {
      addRecent(block);
      handleDragStart(e, block);
    },
    [addRecent, handleDragStart]
  );

  const onUseTemplate = useCallback(
    (tpl) => {
      addTemplate(tpl);
    },
    [addTemplate]
  );

  const searchQuery = search.trim().toLowerCase();
  const matchesSearch = useCallback(
    (block) =>
      !searchQuery ||
      block.name.toLowerCase().includes(searchQuery) ||
      (block.description || '').toLowerCase().includes(searchQuery),
    [searchQuery]
  );

  const filterByFavorites = useCallback(
    (block) => !favoritesOnly || favorites.includes(block.id),
    [favorites, favoritesOnly]
  );

  const filteredEvents = useMemo(
    () => blocks.events.filter(matchesSearch).filter(filterByFavorites),
    [blocks.events, filterByFavorites, matchesSearch]
  );
  const filteredActions = useMemo(
    () => blocks.actions.filter(matchesSearch).filter(filterByFavorites),
    [blocks.actions, filterByFavorites, matchesSearch]
  );
  const filteredCustom = useMemo(
    () => blocks.custom_options.filter(matchesSearch).filter(filterByFavorites),
    [blocks.custom_options, filterByFavorites, matchesSearch]
  );

  const favoriteBlocks = useMemo(
    () => favorites.map((id) => allBlocksById.get(id)).filter(Boolean),
    [allBlocksById, favorites]
  );
  const recentBlocks = useMemo(
    () => recents.map((id) => allBlocksById.get(id)).filter(Boolean),
    [allBlocksById, recents]
  );

  const filteredTemplates = useMemo(
    () =>
      TEMPLATES.filter(
        (tpl) =>
          !searchQuery ||
          tpl.name.toLowerCase().includes(searchQuery) ||
          tpl.description.toLowerCase().includes(searchQuery) ||
          tpl.event.name.toLowerCase().includes(searchQuery)
      ),
    [searchQuery]
  );

  return (
    <div className="block-palette">
      <h3 className="palette-title">
        Block Palette
        <span className="palette-subtitle">Drag blocks to the canvas</span>
      </h3>

      <div className="palette-search">
        <input
          type="text"
          className="form-input palette-search-input"
          placeholder="Search events, actions, and custom blocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="palette-search-actions">
          <label className="palette-toggle">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
            />
            Show favorites only
          </label>
          {recents.length > 0 && (
            <button type="button" className="palette-clear-btn" onClick={clearRecents}>
              Clear recents
            </button>
          )}
        </div>
      </div>

      {(favoriteBlocks.length > 0 || recentBlocks.length > 0) && (
        <div className="palette-section">
          <div className="palette-section-header">
            <span className="palette-section-icon palette-icon-templates"></span>
            Favorites & Recents
          </div>
          {favoriteBlocks.length > 0 && (
            <div className="palette-mini-section">
              <div className="palette-mini-title">Favorites</div>
              {favoriteBlocks.map((block) => (
                <BlockItem
                  key={`fav-${block.id}`}
                  block={block}
                  onDragStart={onDragStart}
                  isFavorite
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
          {recentBlocks.length > 0 && (
            <div className="palette-mini-section">
              <div className="palette-mini-title">Recent</div>
              {recentBlocks.map((block) => (
                <BlockItem
                  key={`recent-${block.id}`}
                  block={block}
                  onDragStart={onDragStart}
                  isFavorite={favorites.includes(block.id)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Guided Recipes */}
      <div className="palette-section">
        <div className="palette-section-header">
          <span className="palette-section-icon palette-icon-templates"></span>
          Guided Recipes
          <Tooltip text="Pre-built event + action combos with previews. Click to add instantly." position="right">
            <span className="info-icon">?</span>
          </Tooltip>
        </div>
        <div className="templates-list">
          {filteredTemplates.map((tpl) => (
            <button
              key={tpl.id}
              className="template-item"
              onClick={() => onUseTemplate(tpl)}
            >
              <div className="template-item-name">{tpl.name}</div>
              <div className="template-item-description">{tpl.description}</div>
              <div className="template-item-meta">
                {tpl.event.name} + {tpl.children.length} action{tpl.children.length !== 1 ? 's' : ''}
              </div>
              <div className="template-item-preview">
                <span className="template-item-event">{tpl.event.name}</span>
                <div className="template-item-actions">
                  {tpl.children.slice(0, 4).map((child, index) => (
                    <span key={`${tpl.id}-${index}`} className="template-item-chip">
                      {child.name}
                    </span>
                  ))}
                  {tpl.children.length > 4 && (
                    <span className="template-item-chip template-item-more">
                      +{tpl.children.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Events */}
      <div className="palette-section">
        <div className="palette-section-header">
          <span className="palette-section-icon palette-icon-events"></span>
          Events
          <span className="palette-section-count">{filteredEvents.length}</span>
        </div>
        <div className="palette-section-hint">Drag events to canvas first</div>
        {filteredEvents.map((block) => (
          <BlockItem
            key={block.id}
            block={block}
            onDragStart={onDragStart}
            isFavorite={favorites.includes(block.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="palette-section">
        <div className="palette-section-header">
          <span className="palette-section-icon palette-icon-actions"></span>
          Actions
          <span className="palette-section-count">{filteredActions.length}</span>
        </div>
        <div className="palette-section-hint">Drop actions onto events</div>
        {filteredActions.map((block) => (
          <BlockItem
            key={block.id}
            block={block}
            onDragStart={onDragStart}
            isFavorite={favorites.includes(block.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Custom Code */}
      <div className="palette-section">
        <div className="palette-section-header">
          <span className="palette-section-icon palette-icon-custom"></span>
          Custom Code
        </div>
        <div className="palette-section-hint">Write your own Java logic</div>
        {filteredCustom.map((block) => (
          <BlockItem
            key={block.id}
            block={block}
            onDragStart={onDragStart}
            isFavorite={favorites.includes(block.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
