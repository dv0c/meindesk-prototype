// Purpose: Main builder composition with topbar, panels, canvas, inspector, and preview.

"use client";

import { useEffect } from "react";
import { Canvas } from "@/components/Canvas/Canvas";
import { Inspector } from "@/components/Inspector/Inspector";
import { LayersPanel } from "@/components/Layers/LayersPanel";
import { BreakpointSwitcher } from "@/components/Panels/BreakpointSwitcher";
import { PreviewModal } from "@/components/Panels/PreviewModal";
import { LeftToolbar } from "@/components/Toolbar/LeftToolbar";
import { Topbar } from "@/components/Toolbar/Topbar";
import { useBuilderStore } from "@/state/store";

export default function HomePage() {
  const init = useBuilderStore((state) => state.init);
  const previewMode = useBuilderStore((state) => state.previewMode);
  const toasts = useBuilderStore((state) => state.toasts);
  const dismissToast = useBuilderStore((state) => state.dismissToast);
  const nudgeSelected = useBuilderStore((state) => state.nudgeSelected);
  const saveNow = useBuilderStore((state) => state.saveNow);
  const undo = useBuilderStore((state) => state.undo);
  const redo = useBuilderStore((state) => state.redo);
  const deleteSelected = useBuilderStore((state) => state.deleteSelected);
  const copySelected = useBuilderStore((state) => state.copySelected);
  const pasteIntoSelected = useBuilderStore((state) => state.pasteIntoSelected);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const mod = event.metaKey || event.ctrlKey;
      const shift = event.shiftKey;

      if (mod && key === "s") {
        event.preventDefault();
        saveNow();
        return;
      }

      if (mod && key === "z" && !shift) {
        event.preventDefault();
        undo();
        return;
      }

      if (mod && ((shift && key === "z") || key === "y")) {
        event.preventDefault();
        redo();
        return;
      }

      if (mod && key === "c") {
        event.preventDefault();
        copySelected();
        return;
      }

      if (mod && key === "v") {
        event.preventDefault();
        pasteIntoSelected();
        return;
      }

      if (key === "delete" || key === "backspace") {
        const target = event.target as HTMLElement;
        const isInput = ["INPUT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable;
        if (!isInput) {
          event.preventDefault();
          deleteSelected();
        }
        return;
      }

      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        const step = shift ? 10 : 1;
        if (key === "arrowup") {
          event.preventDefault();
          nudgeSelected(0, -step);
        }
        if (key === "arrowdown") {
          event.preventDefault();
          nudgeSelected(0, step);
        }
        if (key === "arrowleft") {
          event.preventDefault();
          nudgeSelected(-step, 0);
        }
        if (key === "arrowright") {
          event.preventDefault();
          nudgeSelected(step, 0);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [copySelected, deleteSelected, nudgeSelected, pasteIntoSelected, redo, saveNow, undo]);

  return (
    <div className="builder-shell">
      <Topbar />
      <div className="builder-main">
        <LeftToolbar />
        <LayersPanel />
        <Canvas />
        <Inspector />
      </div>
      <BreakpointSwitcher />
      {previewMode ? <PreviewModal /> : null}

      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => dismissToast(toast.id)}
            type="button"
          >
            {toast.message}
          </button>
        ))}
      </div>
    </div>
  );
}
