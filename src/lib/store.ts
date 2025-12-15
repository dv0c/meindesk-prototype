import { create } from "zustand";
import type { LayoutNode, PageData, WebsiteSettings } from "./types";

const defaultSettings: WebsiteSettings = {
  title: "My Website",
  description: "Built with v0 Page Builder",
  theme: {
    mode: 'light',
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    fontFamily: "Inter",
    backgroundColor: "#ffffff",
    textColor: "#000000",
  },
  seo: {
    // SEO fields are all optional, start with empty object
  }
};

interface BuilderState {
  // Current page data
  currentPage: PageData | null;

  websiteSettings: WebsiteSettings;

  // Layout tree
  nodes: LayoutNode[];

  // Selected node for property editing
  selectedNodeId: string | null;

  // Drag and drop state
  isDragging: boolean;

  // Actions
  setCurrentPage: (page: PageData) => void;
  updateWebsiteSettings: (settings: Partial<WebsiteSettings>) => void;
  setNodes: (nodes: LayoutNode[]) => void;
  addNode: (node: LayoutNode, parentId?: string) => void;
  updateNode: (id: string, updates: Partial<LayoutNode>) => void;
  removeNode: (id: string) => void;
  moveNode: (nodeId: string, newParentId: string | null, index: number) => void;
  selectNode: (id: string | null) => void;
  setIsDragging: (isDragging: boolean) => void;
  clearCanvas: () => void;

  // Utility functions
  findNode: (id: string, nodes?: LayoutNode[]) => LayoutNode | null;
  getNodePath: (id: string) => string[];
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  currentPage: null,
  websiteSettings: defaultSettings,
  nodes: [],
  selectedNodeId: null,
  isDragging: false,

  setCurrentPage: (page) =>
    set({
      currentPage: page,
      nodes: page.layout,
      websiteSettings: page.settings || defaultSettings,
    }),

  updateWebsiteSettings: (settings) =>
    set((state) => ({
      websiteSettings: {
        ...state.websiteSettings,
        ...settings,
        theme: {
          ...state.websiteSettings.theme,
          ...(settings.theme || {}),
        },
        seo: {
          ...state.websiteSettings.seo,
          ...(settings.seo || {}),
        },
      },
    })),

  setNodes: (nodes) => set({ nodes }),

  addNode: (node, parentId) => {
    const { nodes } = get();

    if (!parentId) {
      // Add to root
      set({ nodes: [...nodes, node] });
    } else {
      // Add to parent's children
      const addToParent = (items: LayoutNode[]): LayoutNode[] => {
        return items.map((item) => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), node],
            };
          }
          if (item.children) {
            return {
              ...item,
              children: addToParent(item.children),
            };
          }
          return item;
        });
      };

      set({ nodes: addToParent(nodes) });
    }
  },

  updateNode: (id, updates) => {
    const { nodes } = get();

    const updateInTree = (items: LayoutNode[]): LayoutNode[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        if (item.children) {
          return {
            ...item,
            children: updateInTree(item.children),
          };
        }
        return item;
      });
    };

    set({ nodes: updateInTree(nodes) });
  },

  removeNode: (id) => {
    const { nodes, selectedNodeId } = get();

    const removeFromTree = (items: LayoutNode[]): LayoutNode[] => {
      return items
        .filter((item) => item.id !== id)
        .map((item) => ({
          ...item,
          children: item.children ? removeFromTree(item.children) : undefined,
        }));
    };

    set({
      nodes: removeFromTree(nodes),
      selectedNodeId: selectedNodeId === id ? null : selectedNodeId,
    });
  },

  moveNode: (nodeId, newParentId, index) => {
    const { nodes } = get();
    let nodeToMove: LayoutNode | null = null;

    // Find and remove the node
    const removeNode = (items: LayoutNode[]): LayoutNode[] => {
      return items
        .filter((item) => {
          if (item.id === nodeId) {
            nodeToMove = item;
            return false;
          }
          return true;
        })
        .map((item) => ({
          ...item,
          children: item.children ? removeNode(item.children) : undefined,
        }));
    };

    let newNodes = removeNode(nodes);

    if (!nodeToMove) return;

    // Insert at new position
    if (!newParentId) {
      // Insert at root level
      newNodes.splice(index, 0, nodeToMove);
    } else {
      // Insert into parent's children
      const insertIntoParent = (items: LayoutNode[]): LayoutNode[] => {
        return items.map((item) => {
          if (item.id === newParentId) {
            const children = item.children || [];
            children.splice(index, 0, nodeToMove!);
            return { ...item, children };
          }
          if (item.children) {
            return {
              ...item,
              children: insertIntoParent(item.children),
            };
          }
          return item;
        });
      };

      newNodes = insertIntoParent(newNodes);
    }

    set({ nodes: newNodes });
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  setIsDragging: (isDragging) => set({ isDragging }),

  clearCanvas: () => set({ nodes: [], selectedNodeId: null }),

  findNode: (id, nodes) => {
    const searchNodes = nodes || get().nodes;

    for (const node of searchNodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = get().findNode(id, node.children);
        if (found) return found;
      }
    }

    return null;
  },

  getNodePath: (id) => {
    const { nodes, findNode } = get();
    const path: string[] = [];

    const buildPath = (items: LayoutNode[], currentPath: string[]): boolean => {
      for (const node of items) {
        const newPath = [...currentPath, node.type];

        if (node.id === id) {
          path.push(...newPath);
          return true;
        }

        if (node.children && buildPath(node.children, newPath)) {
          return true;
        }
      }

      return false;
    };

    buildPath(nodes, []);
    return path;
  },
}));
