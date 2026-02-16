"use client";

import { CSSProperties } from "react";
import { useBuilderStore } from "@/builder-v2/store";
import { BuilderBreakpoint } from "@/builder-v2/types";

type BlockRendererProps = {
  id: string;
  breakpoint: BuilderBreakpoint;
};

function getStyle(id: string, breakpoint: BuilderBreakpoint) {
  const node = useBuilderStore((s) => s.document.nodes[id]);
  if (!node) return {} as CSSProperties;
  const base = node.props.style || {};
  const responsive = node.props.responsive?.[breakpoint] || {};
  return { ...base, ...responsive } as CSSProperties;
}

export function BlockRenderer({ id, breakpoint }: BlockRendererProps) {
  const node = useBuilderStore((s) => s.document.nodes[id]);
  const selectedId = useBuilderStore((s) => s.selectedId);
  const selectBlock = useBuilderStore((s) => s.selectBlock);
  const style = getStyle(id, breakpoint);

  if (!node) return null;

  const selected = selectedId === id;
  const selectClass = selected
    ? "outline outline-2 outline-sky-500"
    : "hover:outline hover:outline-1 hover:outline-slate-300";

  const onSelect = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectBlock(id);
  };

  if (node.type === "section") {
    return (
      <section className={`transition-all duration-200 ${selectClass}`} style={style} onClick={onSelect}>
        {node.children.map((childId) => (
          <BlockRenderer key={childId} id={childId} breakpoint={breakpoint} />
        ))}
      </section>
    );
  }

  if (node.type === "heading") {
    return (
      <h2 className={`transition-all duration-200 ${selectClass}`} style={style} onClick={onSelect}>
        {node.props.text || "Heading"}
      </h2>
    );
  }

  if (node.type === "text") {
    return (
      <p className={`transition-all duration-200 ${selectClass}`} style={style} onClick={onSelect}>
        {node.props.text || "Text"}
      </p>
    );
  }

  if (node.type === "button") {
    return (
      <a
        className={`inline-flex items-center justify-center transition-all duration-200 ${selectClass}`}
        style={style}
        href={node.props.href || "#"}
        onClick={onSelect}
      >
        {node.props.text || "Button"}
      </a>
    );
  }

  if (node.type === "image") {
    return (
      <img
        className={`block object-cover transition-all duration-200 ${selectClass}`}
        style={style}
        src={node.props.src}
        alt={node.props.alt || "Image"}
        onClick={onSelect}
      />
    );
  }

  return <div className={selectClass} style={style} onClick={onSelect} />;
}
