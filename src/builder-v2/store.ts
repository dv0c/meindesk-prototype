"use client";

import { create } from "zustand";
import { createNewBlock, createStarterDocument } from "./defaults";
import { BuilderBlockProps, BuilderBlockType, BuilderBreakpoint, BuilderDocument } from "./types";
import { clampLayout, deriveResponsiveFromDesktop, GRID_COLUMNS } from "./grid";

type BuilderState = {
  document: BuilderDocument;
  selectedId: string | null;
  breakpoint: BuilderBreakpoint;
  isDirty: boolean;
  past: BuilderDocument[];
  future: BuilderDocument[];
  setDocument: (doc: BuilderDocument) => void;
  selectBlock: (id: string | null) => void;
  setBreakpoint: (mode: BuilderBreakpoint) => void;
  addBlock: (type: BuilderBlockType, parentId?: string | null, index?: number) => void;
  updateBlockProps: (id: string, patch: Partial<BuilderBlockProps>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, direction: "up" | "down") => void;
  moveBlockBefore: (draggedId: string, targetId: string) => void;
  moveBlockInto: (draggedId: string, parentId: string | null) => void;
  setBlockLayout: (
    id: string,
    breakpoint: BuilderBreakpoint,
    patch: Partial<{ colStart: number; colSpan: number; rowStart: number; rowSpan: number }>
  ) => void;
  placeBlockInSection: (args: {
    draggedId?: string;
    type?: BuilderBlockType;
    sectionId: string;
    breakpoint: BuilderBreakpoint;
    colStart: number;
    rowStart: number;
  }) => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
};

function pushHistory(state: BuilderState): Pick<BuilderState, "past" | "future"> {
  return {
    past: [...state.past.slice(-39), state.document],
    future: [],
  };
}

function collectDescendants(doc: BuilderDocument, id: string, acc: Set<string>) {
  const node = doc.nodes[id];
  if (!node) return;
  acc.add(id);
  node.children.forEach((childId) => collectDescendants(doc, childId, acc));
}

function findParentId(doc: BuilderDocument, id: string): string | null {
  for (const node of Object.values(doc.nodes)) {
    if (node.children.includes(id)) return node.id;
  }
  return null;
}

function isDescendant(doc: BuilderDocument, ancestorId: string, maybeDescendantId: string): boolean {
  const node = doc.nodes[ancestorId];
  if (!node) return false;
  for (const childId of node.children) {
    if (childId === maybeDescendantId) return true;
    if (isDescendant(doc, childId, maybeDescendantId)) return true;
  }
  return false;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  document: createStarterDocument(),
  selectedId: null,
  breakpoint: "desktop",
  isDirty: false,
  past: [],
  future: [],

  setDocument: (doc) => {
    set(() => ({
      document: doc,
      selectedId: doc.rootIds[0] || null,
      isDirty: false,
      past: [],
      future: [],
    }));
  },

  selectBlock: (id) => set(() => ({ selectedId: id })),

  setBreakpoint: (mode) => set(() => ({ breakpoint: mode })),

  addBlock: (type, parentId = null, index) => {
    const state = get();
    const next = structuredClone(state.document) as BuilderDocument;
    const block = createNewBlock(type);
    next.nodes[block.id] = block;

    if (parentId && next.nodes[parentId]) {
      const targetChildren = next.nodes[parentId].children;
      const insertionIndex = typeof index === "number" ? Math.max(0, Math.min(index, targetChildren.length)) : targetChildren.length;
      targetChildren.splice(insertionIndex, 0, block.id);
    } else {
      const insertionIndex = typeof index === "number" ? Math.max(0, Math.min(index, next.rootIds.length)) : next.rootIds.length;
      next.rootIds.splice(insertionIndex, 0, block.id);
    }

    set((prev) => ({
      ...pushHistory(prev),
      document: next,
      selectedId: block.id,
      isDirty: true,
    }));
  },

  updateBlockProps: (id, patch) => {
    const state = get();
    const block = state.document.nodes[id];
    if (!block) return;

    const next = structuredClone(state.document) as BuilderDocument;
    const target = next.nodes[id];

    target.props = {
      ...target.props,
      ...patch,
      style: {
        ...(target.props.style || {}),
        ...(patch.style || {}),
      },
      responsive: {
        ...(target.props.responsive || {}),
        ...(patch.responsive || {}),
      },
    };

    set((prev) => ({
      ...pushHistory(prev),
      document: next,
      isDirty: true,
    }));
  },

  removeBlock: (id) => {
    const state = get();
    if (!state.document.nodes[id]) return;

    const next = structuredClone(state.document) as BuilderDocument;
    const toDelete = new Set<string>();
    collectDescendants(next, id, toDelete);

    Object.values(next.nodes).forEach((node) => {
      node.children = node.children.filter((childId) => !toDelete.has(childId));
    });
    next.rootIds = next.rootIds.filter((rootId) => !toDelete.has(rootId));
    toDelete.forEach((nodeId) => {
      delete next.nodes[nodeId];
    });

    set((prev) => ({
      ...pushHistory(prev),
      document: next,
      selectedId: prev.selectedId === id ? null : prev.selectedId,
      isDirty: true,
    }));
  },

  moveBlock: (id, direction) => {
    const state = get();
    const next = structuredClone(state.document) as BuilderDocument;

    const swapInArray = (arr: string[]) => {
      const index = arr.indexOf(id);
      if (index < 0) return false;
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= arr.length) return false;
      [arr[index], arr[targetIndex]] = [arr[targetIndex], arr[index]];
      return true;
    };

    if (swapInArray(next.rootIds)) {
      set((prev) => ({ ...pushHistory(prev), document: next, isDirty: true }));
      return;
    }

    const moved = Object.values(next.nodes).some((node) => swapInArray(node.children));
    if (!moved) return;

    set((prev) => ({ ...pushHistory(prev), document: next, isDirty: true }));
  },

  moveBlockBefore: (draggedId, targetId) => {
    if (draggedId === targetId) return;

    const state = get();
    if (!state.document.nodes[draggedId] || !state.document.nodes[targetId]) return;

    const next = structuredClone(state.document) as BuilderDocument;
    const draggedParent = findParentId(next, draggedId);
    const targetParent = findParentId(next, targetId);

    const removeFromCurrent = (arr: string[]) => {
      const index = arr.indexOf(draggedId);
      if (index >= 0) arr.splice(index, 1);
    };

    if (draggedParent) {
      removeFromCurrent(next.nodes[draggedParent].children);
    } else {
      removeFromCurrent(next.rootIds);
    }

    const insertInto = targetParent ? next.nodes[targetParent].children : next.rootIds;
    const targetIndex = insertInto.indexOf(targetId);
    if (targetIndex < 0) return;
    insertInto.splice(targetIndex, 0, draggedId);

    set((prev) => ({
      ...pushHistory(prev),
      document: next,
      isDirty: true,
      selectedId: draggedId,
    }));
  },

  moveBlockInto: (draggedId, parentId) => {
    const state = get();
    if (!state.document.nodes[draggedId]) return;

    if (parentId && !state.document.nodes[parentId]) return;
    if (parentId && draggedId === parentId) return;
    if (parentId && isDescendant(state.document, draggedId, parentId)) return;

    const next = structuredClone(state.document) as BuilderDocument;
    const currentParent = findParentId(next, draggedId);

    const removeFromCurrent = (arr: string[]) => {
      const index = arr.indexOf(draggedId);
      if (index >= 0) arr.splice(index, 1);
    };

    if (currentParent) {
      removeFromCurrent(next.nodes[currentParent].children);
    } else {
      removeFromCurrent(next.rootIds);
    }

    if (parentId) {
      next.nodes[parentId].children.push(draggedId);
    } else {
      next.rootIds.push(draggedId);
    }

    set((prev) => ({
      ...pushHistory(prev),
      document: next,
      isDirty: true,
      selectedId: draggedId,
    }));
  },

  setBlockLayout: (id, breakpoint, patch) => {
    const state = get();
    const block = state.document.nodes[id];
    if (!block) return;

    const next = structuredClone(state.document) as BuilderDocument;
    const target = next.nodes[id];
    const current = target.props.layout?.[breakpoint] || {
      colStart: 1,
      colSpan: Math.min(4, GRID_COLUMNS[breakpoint]),
      rowStart: 1,
      rowSpan: 6,
    };

    const merged = clampLayout(breakpoint, {
      colStart: patch.colStart ?? current.colStart,
      colSpan: patch.colSpan ?? current.colSpan,
      rowStart: patch.rowStart ?? current.rowStart,
      rowSpan: patch.rowSpan ?? current.rowSpan,
    });

    const nextLayout = {
      ...(target.props.layout || {}),
      [breakpoint]: merged,
    };

    if (breakpoint === "desktop") {
      const auto = deriveResponsiveFromDesktop(merged);
      nextLayout.tablet = nextLayout.tablet || auto.tablet;
      nextLayout.mobile = nextLayout.mobile || auto.mobile;
    }

    target.props.layout = nextLayout;

    set((prev) => ({
      ...pushHistory(prev),
      document: next,
      isDirty: true,
      selectedId: id,
    }));
  },

  placeBlockInSection: ({ draggedId, type, sectionId, breakpoint, colStart, rowStart }) => {
    const state = get();
    const section = state.document.nodes[sectionId];
    if (!section || section.type !== "section") return;

    const next = structuredClone(state.document) as BuilderDocument;
    let blockId = draggedId || "";

    if (type) {
      const newBlock = createNewBlock(type);
      blockId = newBlock.id;
      next.nodes[blockId] = newBlock;
      next.nodes[sectionId].children.push(blockId);
    }

    if (!blockId || !next.nodes[blockId]) return;

    const currentParent = findParentId(next, blockId);
    if (currentParent && currentParent !== sectionId) {
      next.nodes[currentParent].children = next.nodes[currentParent].children.filter((id) => id !== blockId);
    }
    if (!currentParent) {
      next.rootIds = next.rootIds.filter((id) => id !== blockId);
    }
    if (!next.nodes[sectionId].children.includes(blockId)) {
      next.nodes[sectionId].children.push(blockId);
    }

    const target = next.nodes[blockId];
    const existing = target.props.layout?.[breakpoint] || {
      colStart: 1,
      colSpan: Math.min(4, GRID_COLUMNS[breakpoint]),
      rowStart: 1,
      rowSpan: 8,
    };

    const desktopLayout =
      breakpoint === "desktop"
        ? clampLayout("desktop", {
            colStart,
            colSpan: existing.colSpan,
            rowStart,
            rowSpan: existing.rowSpan,
          })
        : target.props.layout?.desktop || {
            colStart: 1,
            colSpan: Math.min(4, GRID_COLUMNS.desktop),
            rowStart: 1,
            rowSpan: 8,
          };

    const breakpointLayout = clampLayout(breakpoint, {
      colStart,
      colSpan: existing.colSpan,
      rowStart,
      rowSpan: existing.rowSpan,
    });

    const auto = deriveResponsiveFromDesktop(desktopLayout);
    target.props.layout = {
      desktop: desktopLayout,
      tablet: breakpoint === "tablet" ? breakpointLayout : target.props.layout?.tablet || auto.tablet,
      mobile: breakpoint === "mobile" ? breakpointLayout : target.props.layout?.mobile || auto.mobile,
      ...(breakpoint === "desktop" ? { desktop: breakpointLayout } : {}),
    };

    set((prev) => ({
      ...pushHistory(prev),
      document: next,
      isDirty: true,
      selectedId: blockId,
    }));
  },

  undo: () => {
    const state = get();
    if (!state.past.length) return;
    const previous = state.past[state.past.length - 1];
    const past = state.past.slice(0, -1);
    set(() => ({
      document: previous,
      past,
      future: [state.document, ...state.future].slice(0, 40),
      isDirty: true,
    }));
  },

  redo: () => {
    const state = get();
    if (!state.future.length) return;
    const [nextDoc, ...rest] = state.future;
    set(() => ({
      document: nextDoc,
      future: rest,
      past: [...state.past.slice(-39), state.document],
      isDirty: true,
    }));
  },

  markSaved: () => set(() => ({ isDirty: false })),
}));
