import usePluginStore from '../store/usePluginStore';
import { getDefaultProperties } from '../utils/blockSchema';

export function useBlocks() {
  const addBlock = usePluginStore((state) => state.addBlock);
  const updateBlock = usePluginStore((state) => state.updateBlock);
  const deleteBlock = usePluginStore((state) => state.deleteBlock);
  const addChildBlock = usePluginStore((state) => state.addChildBlock);
  const removeChildBlock = usePluginStore((state) => state.removeChildBlock);
  const reorderChildBlocks = usePluginStore((state) => state.reorderChildBlocks);
  const blocks = usePluginStore((state) => state.blocks);

  const createBlock = (definition) => {
    const defaults = getDefaultProperties(definition);
    const overrides =
      definition.properties && !Array.isArray(definition.properties)
        ? definition.properties
        : {};

    return {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: definition.type,
      name: definition.name,
      definition,
      properties: { ...defaults, ...overrides },
      customCode: definition.customCode || '',
      children: [],
      color: definition.color
    };
  };

  const addBlockFromDefinition = (definition) => {
    const block = createBlock(definition);
    addBlock(block);
    return block;
  };

  const addChildFromDefinition = (parentId, definition) => {
    const block = createBlock(definition);
    addChildBlock(parentId, block);
    return block;
  };

  /**
   * Add a full template: creates the event block and all its children at once.
   * template: { event: {...}, children: [{...}, ...] }
   */
  const addTemplate = (template) => {
    const eventBlock = createBlock(template.event);
    addBlock(eventBlock);

    for (const childDef of template.children) {
      const childBlock = createBlock(childDef);
      addChildBlock(eventBlock.id, childBlock);
    }

    return eventBlock;
  };

  return {
    blocks,
    addBlockFromDefinition,
    addChildFromDefinition,
    addTemplate,
    updateBlock,
    deleteBlock,
    removeChildBlock,
    reorderChildBlocks
  };
}
