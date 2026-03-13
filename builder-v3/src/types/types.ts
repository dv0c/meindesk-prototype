// Purpose: Central type definitions for builder schema, editor state, and interactions.

export type Breakpoint = "desktop" | "tablet" | "mobile";

export type ElementType =
  | "section"
  | "container"
  | "div"
  | "text"
  | "h1"
  | "image"
  | "button"
  | "link"
  | "spacer";

export type StyleProps = Record<string, string>;

export interface ResponsiveStyleMap {
  desktop: StyleProps;
  tablet: StyleProps;
  mobile: StyleProps;
}

export interface ElementAttributes {
  htmlId?: string;
  className?: string;
}

export interface ElementProps {
  content?: string;
  src?: string;
  href?: string;
  alt?: string;
  style?: StyleProps;
  [key: string]: string | number | boolean | StyleProps | undefined;
}

export type InteractionType = "hover-transition" | "click-toggle" | "click-navigate";

export interface ElementInteraction {
  id: string;
  type: InteractionType;
  targetId?: string;
  href?: string;
  durationMs?: number;
  easing?: string;
  scale?: number;
}

export interface ElementNode {
  id: string;
  type: ElementType;
  props: ElementProps;
  attrs: ElementAttributes;
  styles: ResponsiveStyleMap;
  interactions: ElementInteraction[];
  children: ElementNode[];
}

export interface PageSchema {
  id: string;
  title: string;
  breakpoints: Breakpoint[];
  root: ElementNode;
}

export interface ProjectSchema {
  id: string;
  name: string;
  createdAt: string;
  pages: PageSchema[];
}

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export interface ExportBundle {
  html: string;
  css: string;
}

export const BREAKPOINT_ORDER: Breakpoint[] = ["desktop", "tablet", "mobile"];

export const BREAKPOINT_WIDTH: Record<Breakpoint, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 390,
};
