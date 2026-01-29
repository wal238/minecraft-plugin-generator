import { create } from 'zustand';

const usePluginStore = create((set) => ({
  name: '',
  version: '1.0.0',
  mainPackage: 'com.example.myplugin',
  description: '',
  author: '',

  blocks: [],
  selectedBlockId: null,

  loading: false,
  error: null,
  successMessage: null,

  availableBlocks: null,

  setName: (name) => set({ name }),
  setVersion: (version) => set({ version }),
  setMainPackage: (mainPackage) => set({ mainPackage }),
  setDescription: (description) => set({ description }),
  setAuthor: (author) => set({ author }),

  addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
  updateBlock: (id, updates) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b))
    })),
  deleteBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== id),
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId
    })),
  addChildBlock: (parentId, block) =>
    set((state) => ({
      blocks: state.blocks
        .map((b) =>
          b.id === parentId
            ? { ...b, children: [...b.children, block.id] }
            : b
        )
        .concat(block)
    })),
  removeChildBlock: (parentId, childId) =>
    set((state) => ({
      blocks: state.blocks
        .map((b) =>
          b.id === parentId
            ? { ...b, children: b.children.filter((c) => c !== childId) }
            : b
        )
        .filter((b) => b.id !== childId),
      selectedBlockId: state.selectedBlockId === childId ? null : state.selectedBlockId
    })),
  setSelectedBlockId: (selectedBlockId) => set({ selectedBlockId }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSuccessMessage: (successMessage) => set({ successMessage }),
  setAvailableBlocks: (availableBlocks) => set({ availableBlocks }),

  reset: () =>
    set({
      name: '',
      version: '1.0.0',
      mainPackage: 'com.example.myplugin',
      description: '',
      author: '',
      blocks: [],
      selectedBlockId: null,
      loading: false,
      error: null,
      successMessage: null
    })
}));

export default usePluginStore;
