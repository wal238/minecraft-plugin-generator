"""Cached block catalog helpers to avoid repeated full catalog rebuilds."""

from __future__ import annotations

from copy import deepcopy
from functools import lru_cache
from typing import Dict, List, Tuple

from app.services.block_definitions import BlockDefinitionService

_block_service = BlockDefinitionService()


@lru_cache(maxsize=1)
def _cached_catalog() -> Dict[str, List[dict]]:
    return _block_service.get_available_blocks()


@lru_cache(maxsize=1)
def _cached_index() -> Dict[str, dict]:
    blocks = _cached_catalog()
    index: Dict[str, dict] = {}
    for section in ("events", "actions", "custom_options"):
        for block in blocks.get(section, []):
            block_id = str(block.get("id", ""))
            if block_id:
                index[block_id] = block
    return index


@lru_cache(maxsize=1)
def _cached_name_to_id() -> Dict[str, str]:
    """Map block name (e.g. 'PlayerJoinEvent') to catalog id (e.g. 'player-join')."""
    blocks = _cached_catalog()
    mapping: Dict[str, str] = {}
    for section in ("events", "actions", "custom_options"):
        for block in blocks.get(section, []):
            name = str(block.get("name", ""))
            block_id = str(block.get("id", ""))
            if name and block_id:
                mapping[name] = block_id
    return mapping


def resolve_catalog_id(block_id: str, block_name: str) -> str:
    """Return the catalog id for a block, resolving instance IDs via block name."""
    index = _cached_index()
    if block_id in index:
        return block_id
    # Instance ID (e.g. 'block-1770841288613-3txd') — resolve via name
    name_map = _cached_name_to_id()
    return name_map.get(block_name, block_id)


def get_catalog_copy() -> Dict[str, List[dict]]:
    """Return a mutable copy of the full catalog for API responses."""
    return deepcopy(_cached_catalog())


def get_all_blocks() -> List[dict]:
    """Return all blocks as a flat list."""
    blocks = _cached_catalog()
    return [*blocks.get("events", []), *blocks.get("actions", []), *blocks.get("custom_options", [])]


def get_block_descriptors_for_ids(block_ids: List[str]) -> Tuple[List[dict], List[str]]:
    """Return descriptor rows used for entitlement checks and unknown IDs."""
    index = _cached_index()
    descriptors: List[dict] = []
    unknown: List[str] = []
    for block_id in block_ids:
        definition = index.get(block_id)
        if not definition:
            unknown.append(block_id)
            descriptors.append({"id": block_id, "min_paper_version": None, "max_paper_version": None})
            continue
        descriptors.append(
            {
                "id": block_id,
                "min_paper_version": definition.get("min_paper_version"),
                "max_paper_version": definition.get("max_paper_version"),
            }
        )
    return descriptors, unknown
