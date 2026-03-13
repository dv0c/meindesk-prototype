// Purpose: LocalStorage persistence helpers with autosave debounce support.

import { ProjectSchema } from "@/types/types";
import { createInitialProject, loadProject, serializeProject } from "@/utils/serializer";

export const STORAGE_PREFIX = "meindesk_builder_v3";

export function storageKey(projectId: string): string {
  return `${STORAGE_PREFIX}:${projectId}`;
}

export function saveProject(project: ProjectSchema): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(storageKey(project.id), serializeProject(project));
}

export function loadOrCreateProject(projectId = "default"): ProjectSchema {
  if (typeof window === "undefined") {
    return createInitialProject();
  }

  const raw = window.localStorage.getItem(storageKey(projectId));
  if (!raw) {
    const seeded = createInitialProject();
    saveProject(seeded);
    return seeded;
  }

  const loaded = loadProject(raw);
  if (!loaded) {
    const fallback = createInitialProject();
    saveProject(fallback);
    return fallback;
  }

  return loaded;
}

export function clearProject(projectId = "default"): ProjectSchema {
  const fresh = createInitialProject();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(storageKey(projectId));
    saveProject(fresh);
  }
  return fresh;
}

let autosaveHandle: ReturnType<typeof setTimeout> | null = null;

export function scheduleAutosave(project: ProjectSchema, delayMs = 2000): void {
  if (typeof window === "undefined") {
    return;
  }

  if (autosaveHandle) {
    clearTimeout(autosaveHandle);
  }

  autosaveHandle = setTimeout(() => {
    saveProject(project);
  }, delayMs);
}
