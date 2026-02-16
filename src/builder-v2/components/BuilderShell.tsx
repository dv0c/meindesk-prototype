"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Monitor,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Redo2,
  Save,
  Settings2,
  Smartphone,
  Tablet,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useBuilderStore } from "@/builder-v2/store";
import { parseBuilderDocument } from "@/builder-v2/serialize";
import { RuntimeRenderer } from "./RuntimeRenderer";
import { BuilderBlockType } from "@/builder-v2/types";
import { GRID_COLUMNS } from "@/builder-v2/grid";
import { toast } from "sonner";

type BuilderShellProps = {
  siteId: string;
  pageId: string;
};

type ApiPage = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  excerpt?: string | null;
  layout?: unknown[];
  meta?: Record<string, unknown> | null;
  order?: number | null;
  parentId?: string | null;
  authorId?: string | null;
};

const DEVICE_WIDTH: Record<string, number> = {
  desktop: 1320,
  tablet: 820,
  mobile: 390,
};

const blockOptions: { type: BuilderBlockType; label: string }[] = [
  { type: "section", label: "Section" },
  { type: "heading", label: "Heading" },
  { type: "text", label: "Text" },
  { type: "button", label: "Button" },
  { type: "image", label: "Image" },
  { type: "spacer", label: "Spacer" },
];

export function BuilderShell({ siteId, pageId }: BuilderShellProps) {
  const [page, setPage] = useState<ApiPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"design" | "actions">("design");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [railPos, setRailPos] = useState<{ top: number; left: number; visible: boolean }>({
    top: 0,
    left: 0,
    visible: false,
  });

  const doc = useBuilderStore((s) => s.document);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const breakpoint = useBuilderStore((s) => s.breakpoint);
  const isDirty = useBuilderStore((s) => s.isDirty);
  const setDocument = useBuilderStore((s) => s.setDocument);
  const setBreakpoint = useBuilderStore((s) => s.setBreakpoint);
  const addBlock = useBuilderStore((s) => s.addBlock);
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const updateBlockProps = useBuilderStore((s) => s.updateBlockProps);
  const removeBlock = useBuilderStore((s) => s.removeBlock);
  const moveBlock = useBuilderStore((s) => s.moveBlock);
  const moveBlockBefore = useBuilderStore((s) => s.moveBlockBefore);
  const setBlockLayout = useBuilderStore((s) => s.setBlockLayout);
  const placeBlockInSection = useBuilderStore((s) => s.placeBlockInSection);
  const undo = useBuilderStore((s) => s.undo);
  const redo = useBuilderStore((s) => s.redo);
  const markSaved = useBuilderStore((s) => s.markSaved);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/team/${siteId}/pages/${pageId}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Could not load page");
        const data = (await res.json()) as ApiPage;
        setPage(data);
        setDocument(parseBuilderDocument((data.meta || {})["builderV2"]));
      } catch {
        if (!controller.signal.aborted) toast.error("Failed to load builder document");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [pageId, setDocument, siteId]);

  const selectedBlock = selectedId ? doc.nodes[selectedId] : null;
  const selectedParent = useMemo(() => {
    if (!selectedId) return null;
    return Object.values(doc.nodes).find((node) => node.children.includes(selectedId)) || null;
  }, [doc.nodes, selectedId]);

  const flatList = useMemo(() => {
    const items: { id: string; depth: number }[] = [];
    const walk = (id: string, depth: number) => {
      items.push({ id, depth });
      (doc.nodes[id]?.children || []).forEach((childId) => walk(childId, depth + 1));
    };
    doc.rootIds.forEach((rootId) => walk(rootId, 0));
    return items;
  }, [doc]);

  useEffect(() => {
    if (!selectedId) {
      setRailPos((prev) => ({ ...prev, visible: false }));
      return;
    }

    const update = () => {
      const target = window.document.querySelector(`[data-builder-id="${selectedId}"]`) as HTMLElement | null;
      if (!target) {
        setRailPos((prev) => ({ ...prev, visible: false }));
        return;
      }
      const rect = target.getBoundingClientRect();
      setRailPos({ top: rect.top + rect.height / 2 - 72, left: rect.right + 10, visible: true });
    };

    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [selectedId, breakpoint, doc]);

  async function onSave() {
    if (!page) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/team/${siteId}/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: page.title,
          slug: page.slug,
          status: page.status,
          excerpt: page.excerpt || "",
          layout: Array.isArray(page.layout) ? page.layout : [],
          meta: { ...(page.meta || {}), builderV2: doc },
          order: page.order ?? 0,
          parentId: page.parentId ?? null,
          authorId: page.authorId ?? null,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      markSaved();
      toast.success("Builder state saved");
    } catch {
      toast.error("Could not save your changes");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const withMod = event.metaKey || event.ctrlKey;
      if (!withMod) return;
      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!saving) void onSave();
      }
      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, saving, undo]);

  if (loading) {
    return <div className="flex h-[calc(100vh-64px)] items-center justify-center text-sm text-muted-foreground">Loading builder...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col bg-[#e7e8ed]">
      <header className="mx-4 mt-3 flex h-12 items-center rounded-xl border border-slate-300/70 bg-white/90 px-3 shadow-sm">
        <div className="w-[220px] text-sm font-semibold text-slate-700">{page?.title || "Untitled page"}</div>
        <div className="flex flex-1 items-center justify-center gap-1">
          <Button variant={breakpoint === "desktop" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setBreakpoint("desktop")}><Monitor className="h-4 w-4" /></Button>
          <Button variant={breakpoint === "tablet" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setBreakpoint("tablet")}><Tablet className="h-4 w-4" /></Button>
          <Button variant={breakpoint === "mobile" ? "default" : "outline"} size="icon" className="h-8 w-8" onClick={() => setBreakpoint("mobile")}><Smartphone className="h-4 w-4" /></Button>
        </div>
        <div className="flex w-[340px] items-center justify-end gap-2">
          <Button variant="outline" className="h-8 gap-2 text-xs font-medium"><Eye className="h-3.5 w-3.5" />Preview page</Button>
          <Button variant="ghost" className="h-8 gap-2 text-xs" onClick={() => setSidebarCollapsed((prev) => !prev)}>
            {sidebarCollapsed ? <PanelRightOpen className="h-3.5 w-3.5" /> : <PanelRightClose className="h-3.5 w-3.5" />}
            {sidebarCollapsed ? "Expand" : "Collapse sidebar"}
          </Button>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-[220px_1fr_330px] gap-4 overflow-hidden p-4">
        <aside className="rounded-2xl border border-slate-300/80 bg-white/90">
          <ScrollArea className="h-full px-3 py-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Blocks</p>
            <div className="space-y-2">
              {blockOptions.map((option) => (
                <Button
                  key={option.type}
                  variant="outline"
                  className="h-9 w-full justify-start gap-2"
                  onClick={() => addBlock(option.type, selectedBlock?.type === "section" ? selectedBlock.id : null)}
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("text/builder-type", option.type)}
                >
                  <Plus className="h-3 w-3" />{option.label}
                </Button>
              ))}
            </div>
            <Separator className="my-4" />
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Layers</p>
            <div className="space-y-1">
              {flatList.map(({ id, depth }) => {
                const node = doc.nodes[id];
                if (!node) return null;
                return (
                  <button
                    key={id}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition ${selectedId === id ? "bg-blue-100 text-blue-900" : "hover:bg-slate-100 text-slate-700"}`}
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    onClick={() => selectBlock(id)}
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData("text/builder-node", id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const draggedId = event.dataTransfer.getData("text/builder-node");
                      if (!draggedId || draggedId === id) return;
                      moveBlockBefore(draggedId, id);
                    }}
                  >
                    <span>{node.name}</span>
                    <span className="text-[10px] uppercase text-slate-400">{node.type}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        <main className="overflow-auto rounded-2xl border border-slate-300/80 bg-[#f4f5f8] p-5" onClick={() => selectBlock(null)}>
          <div className="mx-auto" style={{ width: `${DEVICE_WIDTH[breakpoint]}px`, maxWidth: "100%" }}>
            <RuntimeRenderer
              document={doc}
              breakpoint={breakpoint}
              selectable
              selectedId={selectedId}
              onSelect={selectBlock}
              onDropType={(type, sectionId, colStart, rowStart) =>
                placeBlockInSection({ type, sectionId, breakpoint, colStart, rowStart })
              }
              onDropNode={(draggedId, sectionId, colStart, rowStart) =>
                placeBlockInSection({ draggedId, sectionId, breakpoint, colStart, rowStart })
              }
            />
          </div>
        </main>

        {!sidebarCollapsed ? (
          <aside className="overflow-hidden rounded-2xl border border-slate-300/80 bg-white/95">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-lg font-semibold text-slate-700">{selectedBlock?.name || "Select block"}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => selectedId && removeBlock(selectedId)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 border-b px-4 pt-2">
              <button className={`border-b-2 px-2 pb-2 text-sm ${activeTab === "design" ? "border-slate-900 font-semibold text-slate-900" : "border-transparent text-slate-500"}`} onClick={() => setActiveTab("design")}>Design</button>
              <button className={`border-b-2 px-2 pb-2 text-sm ${activeTab === "actions" ? "border-slate-900 font-semibold text-slate-900" : "border-transparent text-slate-500"}`} onClick={() => setActiveTab("actions")}>Actions</button>
            </div>

            <ScrollArea className="h-[calc(100%-170px)] px-4 py-4">
              {!selectedBlock ? <p className="text-xs text-slate-500">Select a block to edit.</p> : null}

              {selectedBlock && activeTab === "design" ? (
                <div className="space-y-3 pb-4">
                  {(selectedBlock.type === "heading" || selectedBlock.type === "text" || selectedBlock.type === "button") && (
                    <div>
                      <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Header</label>
                      <Input value={selectedBlock.props.text || ""} onChange={(event) => updateBlockProps(selectedBlock.id, { text: event.target.value })} className="h-8" />
                    </div>
                  )}

                  {selectedBlock.type === "image" && (
                    <>
                      <div>
                        <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Image URL</label>
                        <Input value={selectedBlock.props.src || ""} onChange={(event) => updateBlockProps(selectedBlock.id, { src: event.target.value })} className="h-8" />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Subheader</label>
                        <Input value={selectedBlock.props.alt || ""} onChange={(event) => updateBlockProps(selectedBlock.id, { alt: event.target.value })} className="h-8" />
                      </div>
                    </>
                  )}

                  <Separator />

                  {selectedParent?.type === "section" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Col Start</label><Input value={String(selectedBlock.props.layout?.[breakpoint]?.colStart || 1)} onChange={(event) => setBlockLayout(selectedBlock.id, breakpoint, { colStart: Number(event.target.value || 1) })} className="h-8" /></div>
                      <div><label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Col Span</label><Input value={String(selectedBlock.props.layout?.[breakpoint]?.colSpan || Math.min(4, GRID_COLUMNS[breakpoint]))} onChange={(event) => setBlockLayout(selectedBlock.id, breakpoint, { colSpan: Number(event.target.value || 1) })} className="h-8" /></div>
                      <div><label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Row Start</label><Input value={String(selectedBlock.props.layout?.[breakpoint]?.rowStart || 1)} onChange={(event) => setBlockLayout(selectedBlock.id, breakpoint, { rowStart: Number(event.target.value || 1) })} className="h-8" /></div>
                      <div><label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Row Span</label><Input value={String(selectedBlock.props.layout?.[breakpoint]?.rowSpan || 6)} onChange={(event) => setBlockLayout(selectedBlock.id, breakpoint, { rowSpan: Number(event.target.value || 1) })} className="h-8" /></div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Padding</label><Input value={selectedBlock.props.style?.padding || ""} onChange={(event) => updateBlockProps(selectedBlock.id, { style: { padding: event.target.value } })} className="h-8" /></div>
                    <div><label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Margin</label><Input value={selectedBlock.props.style?.margin || ""} onChange={(event) => updateBlockProps(selectedBlock.id, { style: { margin: event.target.value } })} className="h-8" /></div>
                  </div>
                </div>
              ) : null}

              {selectedBlock && activeTab === "actions" ? (
                <div className="space-y-3 pb-4">
                  <div>
                    <label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Entrance</label>
                    <select
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                      value={selectedBlock.props.animation?.entrance || "none"}
                      onChange={(event) => updateBlockProps(selectedBlock.id, { animation: { ...(selectedBlock.props.animation || {}), entrance: event.target.value as any } })}
                    >
                      <option value="none">None</option>
                      <option value="fade">Fade</option>
                      <option value="fade-up">Fade Up</option>
                      <option value="zoom">Zoom</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Duration</label><Input value={String(selectedBlock.props.animation?.durationMs || 480)} onChange={(event) => updateBlockProps(selectedBlock.id, { animation: { ...(selectedBlock.props.animation || {}), durationMs: Number(event.target.value || 0) } })} className="h-8" /></div>
                    <div><label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Delay</label><Input value={String(selectedBlock.props.animation?.delayMs || 0)} onChange={(event) => updateBlockProps(selectedBlock.id, { animation: { ...(selectedBlock.props.animation || {}), delayMs: Number(event.target.value || 0) } })} className="h-8" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Hover Scale</label><Input value={String(selectedBlock.props.animation?.hoverScale || 1)} onChange={(event) => updateBlockProps(selectedBlock.id, { animation: { ...(selectedBlock.props.animation || {}), hoverScale: Number(event.target.value || 1) } })} className="h-8" /></div>
                    <div><label className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Hover Lift</label><Input value={String(selectedBlock.props.animation?.hoverLift || 0)} onChange={(event) => updateBlockProps(selectedBlock.id, { animation: { ...(selectedBlock.props.animation || {}), hoverLift: Number(event.target.value || 0) } })} className="h-8" /></div>
                  </div>
                </div>
              ) : null}
            </ScrollArea>

            <div className="border-t px-4 py-3">
              <div className="mb-2 flex gap-2">
                <Button variant="outline" size="icon" onClick={undo}><Undo2 className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" onClick={redo}><Redo2 className="h-4 w-4" /></Button>
              </div>
              <Button onClick={onSave} disabled={saving} className="mb-2 h-9 w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"><Save className="h-4 w-4" />{saving ? "Saving..." : "Save changes"}</Button>
              <Button variant="outline" className="h-9 w-full" onClick={undo}>Discard</Button>
            </div>
          </aside>
        ) : null}
      </div>

      {selectedId && railPos.visible ? (
        <div className="fixed z-[60] flex flex-col gap-1 rounded-xl border border-slate-300 bg-[#1e2330] p-1 shadow-2xl" style={{ top: railPos.top, left: railPos.left }}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-100 hover:bg-white/10" onClick={() => moveBlock(selectedId, "up")}><ArrowUp className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-100 hover:bg-white/10" onClick={() => moveBlock(selectedId, "down")}><ArrowDown className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-100 hover:bg-white/10" onClick={() => setActiveTab("actions")}><Settings2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-300 hover:bg-white/10" onClick={() => removeBlock(selectedId)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ) : null}
    </div>
  );
}
