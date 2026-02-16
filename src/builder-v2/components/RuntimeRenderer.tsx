"use client";

import { CSSProperties } from "react";
import { GRID_COLUMNS, GRID_ROW_HEIGHT, clampLayout } from "@/builder-v2/grid";
import { BuilderBlockType, BuilderBreakpoint, BuilderDocument } from "@/builder-v2/types";

type RuntimeRendererProps = {
  document: BuilderDocument;
  breakpoint?: BuilderBreakpoint;
  selectable?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onDropType?: (type: BuilderBlockType, sectionId: string, colStart: number, rowStart: number) => void;
  onDropNode?: (draggedId: string, sectionId: string, colStart: number, rowStart: number) => void;
};

type RuntimeNodeProps = {
  id: string;
  parentType: BuilderBlockType | null;
  doc: BuilderDocument;
  breakpoint: BuilderBreakpoint;
  selectable: boolean;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  onDropType?: (type: BuilderBlockType, sectionId: string, colStart: number, rowStart: number) => void;
  onDropNode?: (draggedId: string, sectionId: string, colStart: number, rowStart: number) => void;
};

function resolveStyle(
  breakpoint: BuilderBreakpoint,
  style?: Record<string, unknown>,
  responsive?: Record<string, Record<string, unknown>>
): CSSProperties {
  return {
    ...(style || {}),
    ...(responsive?.[breakpoint] || {}),
  } as CSSProperties;
}

function getGridStyle(node: BuilderDocument["nodes"][string], parentType: BuilderBlockType | null, breakpoint: BuilderBreakpoint) {
  if (parentType !== "section") return {} as CSSProperties;
  const raw = node.props.layout?.[breakpoint] || node.props.layout?.desktop;
  if (!raw) return {} as CSSProperties;
  const layout = clampLayout(breakpoint, raw);
  return {
    gridColumn: `${layout.colStart} / span ${layout.colSpan}`,
    gridRow: `${layout.rowStart} / span ${layout.rowSpan}`,
  };
}

function pointerToGrid(
  event: React.DragEvent<HTMLElement>,
  breakpoint: BuilderBreakpoint
): { colStart: number; rowStart: number } {
  const rect = event.currentTarget.getBoundingClientRect();
  const cols = GRID_COLUMNS[breakpoint];
  const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
  const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height));

  const col = Math.floor((x / Math.max(rect.width, 1)) * cols) + 1;
  const row = Math.floor(y / GRID_ROW_HEIGHT) + 1;

  return {
    colStart: Math.max(1, Math.min(col, cols)),
    rowStart: Math.max(1, row),
  };
}

function RuntimeNode({
  id,
  parentType,
  doc,
  breakpoint,
  selectable,
  selectedId,
  onSelect,
  onDropType,
  onDropNode,
}: RuntimeNodeProps) {
  const node = doc.nodes[id];
  if (!node) return null;

  const style = resolveStyle(breakpoint, node.props.style, node.props.responsive as any);
  const gridStyle = getGridStyle(node, parentType, breakpoint);
  const animation = node.props.animation;

  const computedStyle: CSSProperties = {
    ...style,
    ...gridStyle,
    animation:
      animation?.entrance && animation.entrance !== "none"
        ? `builder-${animation.entrance} ${animation.durationMs || 480}ms ${animation.easing || "ease-out"} ${animation.delayMs || 0}ms both`
        : undefined,
    transition: "transform 220ms ease, box-shadow 220ms ease, opacity 220ms ease",
    ["--hover-scale" as string]: String(animation?.hoverScale || 1),
    ["--hover-lift" as string]: `${animation?.hoverLift || 0}px`,
  };

  const selected = selectedId === id;
  const className = selectable
    ? `builder-node transition-all duration-150 ${selected ? "outline outline-2 outline-sky-500" : "hover:outline hover:outline-1 hover:outline-slate-300"}`
    : "builder-node";

  const onNodeSelect = (event: React.MouseEvent) => {
    if (!selectable || !onSelect) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(id);
  };

  const onSectionDrop = (event: React.DragEvent<HTMLElement>) => {
    if (!selectable || node.type !== "section") return;
    event.preventDefault();
    event.stopPropagation();
    const { colStart, rowStart } = pointerToGrid(event, breakpoint);
    const draggedId = event.dataTransfer.getData("text/builder-node");
    const type = event.dataTransfer.getData("text/builder-type") as BuilderBlockType;
    if (draggedId && onDropNode) {
      onDropNode(draggedId, id, colStart, rowStart);
      return;
    }
    if (type && onDropType) {
      onDropType(type, id, colStart, rowStart);
    }
  };

  const onNodeDragStart = (event: React.DragEvent<HTMLElement>) => {
    if (!selectable) return;
    event.dataTransfer.setData("text/builder-node", id);
    event.dataTransfer.effectAllowed = "move";
  };

  const onSectionDragOver = (event: React.DragEvent<HTMLElement>) => {
    if (!selectable || node.type !== "section") return;
    event.preventDefault();
  };

  if (node.type === "section") {
    return (
      <section
        className={className}
        style={{
          ...computedStyle,
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLUMNS[breakpoint]}, minmax(0, 1fr))`,
          gridAutoRows: `${GRID_ROW_HEIGHT}px`,
          columnGap: "12px",
          rowGap: "12px",
          backgroundSize: `calc(100% / ${GRID_COLUMNS[breakpoint]}) 100%`,
          backgroundImage: selectable
            ? "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px)"
            : computedStyle.backgroundImage,
        }}
        onClick={onNodeSelect}
        data-hover={animation?.hoverScale && animation.hoverScale > 1 ? "1" : "0"}
        data-builder-id={id}
        onDragOver={onSectionDragOver}
        onDrop={onSectionDrop}
        draggable={selectable}
        onDragStart={onNodeDragStart}
      >
        {node.children.map((childId) => (
          <RuntimeNode
            key={childId}
            id={childId}
            parentType={node.type}
            doc={doc}
            breakpoint={breakpoint}
            selectable={selectable}
            selectedId={selectedId}
            onSelect={onSelect}
            onDropType={onDropType}
            onDropNode={onDropNode}
          />
        ))}
      </section>
    );
  }

  if (node.type === "heading") {
    return (
      <h2
        className={className}
        style={computedStyle}
        onClick={onNodeSelect}
        data-hover={animation?.hoverScale && animation.hoverScale > 1 ? "1" : "0"}
        data-builder-id={id}
        draggable={selectable}
        onDragStart={onNodeDragStart}
      >
        {node.props.text || "Heading"}
      </h2>
    );
  }

  if (node.type === "text") {
    return (
      <p
        className={className}
        style={computedStyle}
        onClick={onNodeSelect}
        data-hover={animation?.hoverScale && animation.hoverScale > 1 ? "1" : "0"}
        data-builder-id={id}
        draggable={selectable}
        onDragStart={onNodeDragStart}
      >
        {node.props.text || "Text"}
      </p>
    );
  }

  if (node.type === "button") {
    return (
      <a
        className={`inline-flex items-center justify-center ${className}`}
        style={computedStyle}
        href={node.props.href || "#"}
        onClick={onNodeSelect}
        data-hover={animation?.hoverScale && animation.hoverScale > 1 ? "1" : "0"}
        data-builder-id={id}
        draggable={selectable}
        onDragStart={onNodeDragStart}
      >
        {node.props.text || "Button"}
      </a>
    );
  }

  if (node.type === "image") {
    return (
      <img
        className={`block object-cover ${className}`}
        style={computedStyle}
        src={node.props.src}
        alt={node.props.alt || "Image"}
        onClick={onNodeSelect}
        data-hover={animation?.hoverScale && animation.hoverScale > 1 ? "1" : "0"}
        data-builder-id={id}
        draggable={selectable}
        onDragStart={onNodeDragStart}
      />
    );
  }

  return (
    <div
      className={className}
      style={computedStyle}
      onClick={onNodeSelect}
      data-builder-id={id}
      draggable={selectable}
      onDragStart={onNodeDragStart}
    />
  );
}

export function RuntimeRenderer({
  document,
  breakpoint = "desktop",
  selectable = false,
  selectedId = null,
  onSelect,
  onDropType,
  onDropNode,
}: RuntimeRendererProps) {
  return (
    <>
      <style>{`
        @keyframes builder-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes builder-fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes builder-zoom { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .builder-node[data-hover='1']:hover { transform: translateY(calc(var(--hover-lift, 0px) * -1)) scale(var(--hover-scale, 1)); }
      `}</style>
      {document.rootIds.map((rootId) => (
        <RuntimeNode
          key={rootId}
          id={rootId}
          parentType={null}
          doc={document}
          breakpoint={breakpoint}
          selectable={selectable}
          selectedId={selectedId}
          onSelect={onSelect}
          onDropType={onDropType}
          onDropNode={onDropNode}
        />
      ))}
    </>
  );
}
