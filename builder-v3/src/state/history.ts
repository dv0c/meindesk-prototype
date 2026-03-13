// Purpose: Immutable undo/redo helpers shared by editor state and tests.

import { HistoryState } from "@/types/types";

export function createHistory<T>(initial: T): HistoryState<T> {
  return {
    past: [],
    present: initial,
    future: [],
  };
}

export function pushHistory<T>(history: HistoryState<T>, next: T, limit = 300): HistoryState<T> {
  if (history.present === next) {
    return history;
  }

  const past = [...history.past, history.present];
  if (past.length > limit) {
    past.shift();
  }

  return {
    past,
    present: next,
    future: [],
  };
}

export function undoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  if (history.past.length === 0) {
    return history;
  }

  const past = [...history.past];
  const previous = past.pop();
  if (!previous) {
    return history;
  }

  return {
    past,
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  if (history.future.length === 0) {
    return history;
  }

  const [next, ...future] = history.future;
  return {
    past: [...history.past, history.present],
    present: next,
    future,
  };
}
