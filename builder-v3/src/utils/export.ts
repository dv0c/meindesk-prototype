// Purpose: JSON import/export and static HTML/CSS export for the current page.

import { Breakpoint, ElementNode, ExportBundle, ProjectSchema, StyleProps } from "@/types/types";
import { resolveStyles } from "@/state/actions";
import { loadProject, serializeProject } from "@/utils/serializer";

function styleObjectToCss(style: StyleProps): string {
  return Object.entries(style)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${value};`)
    .join("");
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function tagForNode(node: ElementNode): string {
  switch (node.type) {
    case "section":
      return "section";
    case "container":
    case "div":
    case "spacer":
      return "div";
    case "text":
      return "p";
    case "h1":
      return "h1";
    case "image":
      return "img";
    case "button":
      return "button";
    case "link":
      return "a";
    default:
      return "div";
  }
}

function buildNodeMarkup(node: ElementNode, breakpoint: Breakpoint, css: string[]): string {
  const tag = tagForNode(node);
  const cssClass = `node-${node.id}`;
  const style = resolveStyles(node, breakpoint);
  css.push(`.${cssClass}{${styleObjectToCss(style)}}`);

  const htmlId = node.attrs.htmlId ? ` id="${escapeHtml(node.attrs.htmlId)}"` : "";
  const className = ` class="${[cssClass, node.attrs.className ?? ""].join(" ").trim()}"`;

  if (tag === "img") {
    const src = escapeHtml(String(node.props.src ?? "/placeholder.png"));
    const alt = escapeHtml(String(node.props.alt ?? "image"));
    return `<img${htmlId}${className} src="${src}" alt="${alt}" />`;
  }

  const children = node.children.map((child) => buildNodeMarkup(child, breakpoint, css)).join("");
  const text = node.props.content ? escapeHtml(String(node.props.content)) : "";

  if (tag === "a") {
    const href = escapeHtml(String(node.props.href ?? "#"));
    return `<a${htmlId}${className} href="${href}">${text}${children}</a>`;
  }

  return `<${tag}${htmlId}${className}>${text}${children}</${tag}>`;
}

export function buildStaticExport(project: ProjectSchema, pageId: string, breakpoint: Breakpoint = "desktop"): ExportBundle {
  const page = project.pages.find((entry) => entry.id === pageId) ?? project.pages[0];
  const cssRules: string[] = [];
  const markup = buildNodeMarkup(page.root, breakpoint, cssRules);
  const css = `body{margin:0;font-family:Manrope,sans-serif;background:#07121f;color:#e5eefb;}*{box-sizing:border-box;}${cssRules.join("")}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${escapeHtml(project.name)}</title><style>${css}</style></head><body>${markup}</body></html>`;
  return { html, css };
}

function triggerDownload(filename: string, text: string, contentType: string): void {
  const blob = new Blob([text], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportProjectJson(project: ProjectSchema): void {
  triggerDownload(`${project.id}.json`, serializeProject(project), "application/json");
}

export function exportProjectHtml(project: ProjectSchema, pageId: string): void {
  const bundle = buildStaticExport(project, pageId);
  triggerDownload("index.html", bundle.html, "text/html");
}

export async function importProjectFile(file: File): Promise<ProjectSchema | null> {
  const text = await file.text();
  return loadProject(text);
}
