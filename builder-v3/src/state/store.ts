// Purpose: Zustand editor store that powers builder state, history, and persistence.

"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import {
  defaultElementNode,
  deleteNode,
  duplicateNode,
  findNode,
  flattenTree,
  insertNode,
  moveNode,
  resolveStyles,
  setNodeInteractions,
  updateNodeAttrs,
  updateNodeProps,
  updateNodeStyle,
} from "@/state/actions";
import { createHistory, pushHistory, redoHistory, undoHistory } from "@/state/history";
import {
  Breakpoint,
  ElementInteraction,
  ElementNode,
  ElementType,
  HistoryState,
  ProjectSchema,
  ToastItem,
} from "@/types/types";
import { clearProject, loadOrCreateProject, saveProject, scheduleAutosave } from "@/utils/storage";

export interface BuilderStore {
  initialized: boolean;
  history: HistoryState<ProjectSchema>;
  selectedId: string;
  currentPageId: string;
  breakpoint: Breakpoint;
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  showRulers: boolean;
  pageBackground: string;
  canvasContainerWidth: string;
  previewMode: boolean;
  autosave: boolean;
  addPanelOpen: boolean;
  navigatorOpen: boolean;
  clipboard: ElementNode | null;
  hiddenInPreview: Record<string, boolean>;
  toasts: ToastItem[];
  init: () => void;
  getProject: () => ProjectSchema;
  getCurrentPage: () => ProjectSchema["pages"][number];
  getSelectedNode: () => ElementNode | null;
  pushProject: (project: ProjectSchema, message?: string, autosave?: boolean) => void;
  selectNode: (id: string) => void;
  addElement: (type: ElementType, parentId?: string) => void;
  moveElement: (id: string, targetParentId: string, targetIndex?: number) => void;
  updateStyle: (id: string, patch: Record<string, string>) => void;
  updateProps: (id: string, patch: Record<string, string>) => void;
  updateAttrs: (id: string, patch: Record<string, string>) => void;
  setInteractions: (id: string, interactions: ElementInteraction[]) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  copySelected: () => void;
  pasteIntoSelected: () => void;
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setPreviewMode: (enabled: boolean) => void;
  setAutosave: (enabled: boolean) => void;
  toggleAddPanel: () => void;
  toggleNavigator: () => void;
  toggleGrid: () => void;
  toggleRulers: () => void;
  setPageBackground: (value: string) => void;
  setCanvasContainerWidth: (value: string) => void;
  nudgeSelected: (dx: number, dy: number) => void;
  toggleHiddenTarget: (id: string) => void;
  resetPreviewInteractions: () => void;
  saveNow: () => void;
  newProject: () => void;
  importProject: (project: ProjectSchema) => void;
  undo: () => void;
  redo: () => void;
  addToast: (message: string, type?: ToastItem["type"]) => void;
  dismissToast: (id: string) => void;
}

function replacePage(project: ProjectSchema, pageId: string, root: ElementNode): ProjectSchema {
  return {
    ...project,
    pages: project.pages.map((page) => (page.id === pageId ? { ...page, root } : page)),
  };
}

function cloneNodeForClipboard(node: ElementNode): ElementNode {
  return {
    ...node,
    id: uuidv4(),
    attrs: { ...node.attrs },
    props: { ...node.props },
    styles: {
      desktop: { ...node.styles.desktop },
      tablet: { ...node.styles.tablet },
      mobile: { ...node.styles.mobile },
    },
    interactions: node.interactions.map((it) => ({ ...it, id: uuidv4() })),
    children: node.children.map(cloneNodeForClipboard),
  };
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  initialized: false,
  history: createHistory({
    id: "default",
    name: "Builder",
    createdAt: new Date().toISOString(),
    pages: [],
  }),
  selectedId: "",
  currentPageId: "home",
  breakpoint: "desktop",
  zoom: 1,
  pan: { x: 0, y: 0 },
  showGrid: true,
  showRulers: true,
  pageBackground: "#050f1a",
  canvasContainerWidth: "1100px",
  previewMode: false,
  autosave: true,
  addPanelOpen: false,
  navigatorOpen: true,
  clipboard: null,
  hiddenInPreview: {},
  toasts: [],

  init: () => {
    if (get().initialized) {
      return;
    }
    const project = loadOrCreateProject("default");
    const pageId = project.pages[0]?.id ?? "home";
    const selectedId = project.pages[0]?.root.id ?? "";
    set({
      initialized: true,
      currentPageId: pageId,
      selectedId,
      history: createHistory(project),
    });
  },

  getProject: () => get().history.present,

  getCurrentPage: () => {
    const state = get();
    return state.history.present.pages.find((page) => page.id === state.currentPageId) ?? state.history.present.pages[0];
  },

  getSelectedNode: () => {
    const state = get();
    const page = state.getCurrentPage();
    return findNode(page.root, state.selectedId);
  },

  pushProject: (project, message, autosave = true) => {
    set((state) => ({ history: pushHistory(state.history, project) }));
    if (message) {
      get().addToast(message, "success");
    }
    if (autosave && get().autosave) {
      scheduleAutosave(project, 2000);
    }
  },

  selectNode: (id) => set({ selectedId: id }),

  addElement: (type, parentId) => {
    const state = get();
    const page = state.getCurrentPage();
    const node = defaultElementNode(type);
    const target = parentId ?? state.selectedId ?? page.root.id;
    const nextRoot = insertNode(page.root, target, node);
    state.pushProject(replacePage(state.getProject(), page.id, nextRoot));
    set({ selectedId: node.id });
  },

  moveElement: (id, targetParentId, targetIndex) => {
    const state = get();
    const page = state.getCurrentPage();
    const nextRoot = moveNode(page.root, id, targetParentId, targetIndex);
    state.pushProject(replacePage(state.getProject(), page.id, nextRoot));
  },

  updateStyle: (id, patch) => {
    const state = get();
    const page = state.getCurrentPage();
    const nextRoot = updateNodeStyle(page.root, id, state.breakpoint, patch);
    state.pushProject(replacePage(state.getProject(), page.id, nextRoot));
  },

  updateProps: (id, patch) => {
    const state = get();
    const page = state.getCurrentPage();
    const nextRoot = updateNodeProps(page.root, id, patch);
    state.pushProject(replacePage(state.getProject(), page.id, nextRoot));
  },

  updateAttrs: (id, patch) => {
    const state = get();
    const page = state.getCurrentPage();
    const nextRoot = updateNodeAttrs(page.root, id, patch);
    state.pushProject(replacePage(state.getProject(), page.id, nextRoot));
  },

  setInteractions: (id, interactions) => {
    const state = get();
    const page = state.getCurrentPage();
    const nextRoot = setNodeInteractions(page.root, id, interactions);
    state.pushProject(replacePage(state.getProject(), page.id, nextRoot));
  },

  deleteSelected: () => {
    const state = get();
    const page = state.getCurrentPage();
    if (state.selectedId === page.root.id) {
      return;
    }
    const nextRoot = deleteNode(page.root, state.selectedId);
    state.pushProject(replacePage(state.getProject(), page.id, nextRoot));
    set({ selectedId: page.root.id });
  },

  duplicateSelected: () => {
    const state = get();
    const page = state.getCurrentPage();
    const nextRoot = duplicateNode(page.root, state.selectedId);
    state.pushProject(replacePage(state.getProject(), page.id, nextRoot));
  },

  copySelected: () => {
    const node = get().getSelectedNode();
    if (!node) {
      return;
    }
    set({ clipboard: cloneNodeForClipboard(node) });
    get().addToast("Copied", "info");
  },

  pasteIntoSelected: () => {
    const state = get();
    if (!state.clipboard) {
      return;
    }
    const page = state.getCurrentPage();
    const nextRoot = insertNode(page.root, state.selectedId || page.root.id, cloneNodeForClipboard(state.clipboard));
    state.pushProject(replacePage(state.getProject(), page.id, nextRoot));
    state.addToast("Pasted", "success");
  },

  setBreakpoint: (breakpoint) => set({ breakpoint }),
  setZoom: (zoom) => set({ zoom: Math.min(2, Math.max(0.2, zoom)) }),
  setPan: (x, y) => set({ pan: { x, y } }),
  setPreviewMode: (enabled) => set({ previewMode: enabled }),
  setAutosave: (enabled) => set({ autosave: enabled }),
  toggleAddPanel: () => set((state) => ({ addPanelOpen: !state.addPanelOpen })),
  toggleNavigator: () => set((state) => ({ navigatorOpen: !state.navigatorOpen })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleRulers: () => set((state) => ({ showRulers: !state.showRulers })),
  setPageBackground: (value) => set({ pageBackground: value }),
  setCanvasContainerWidth: (value) => set({ canvasContainerWidth: value }),

  nudgeSelected: (dx, dy) => {
    const state = get();
    const node = state.getSelectedNode();
    if (!node) {
      return;
    }
    const styles = resolveStyles(node, state.breakpoint);
    const left = Number.parseInt(styles.left ?? "0", 10);
    const top = Number.parseInt(styles.top ?? "0", 10);
    state.updateStyle(node.id, {
      position: styles.position ?? "relative",
      left: `${Number.isNaN(left) ? 0 : left + dx}px`,
      top: `${Number.isNaN(top) ? 0 : top + dy}px`,
    });
  },

  toggleHiddenTarget: (id) =>
    set((state) => ({
      hiddenInPreview: {
        ...state.hiddenInPreview,
        [id]: !state.hiddenInPreview[id],
      },
    })),

  resetPreviewInteractions: () => set({ hiddenInPreview: {} }),

  saveNow: () => {
    const project = get().getProject();
    saveProject(project);
    get().addToast("Project saved", "success");
  },

  newProject: () => {
    const fresh = clearProject("default");
    set({
      history: createHistory(fresh),
      currentPageId: fresh.pages[0].id,
      selectedId: fresh.pages[0].root.id,
      hiddenInPreview: {},
    });
    get().addToast("New project created", "success");
  },

  importProject: (project) => {
    set({
      history: createHistory(project),
      currentPageId: project.pages[0]?.id ?? "home",
      selectedId: project.pages[0]?.root.id ?? "",
      hiddenInPreview: {},
    });
    saveProject(project);
    get().addToast("Project imported", "success");
  },

  undo: () => {
    set((state) => ({ history: undoHistory(state.history) }));
  },

  redo: () => {
    set((state) => ({ history: redoHistory(state.history) }));
  },

  addToast: (message, type = "info") => {
    const id = uuidv4();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      get().dismissToast(id);
    }, 2200);
  },

  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
}));

export function useTreeNodes(): ElementNode[] {
  const page = useBuilderStore((state) => state.getCurrentPage());
  return flattenTree(page.root);
}
