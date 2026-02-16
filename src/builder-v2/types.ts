export type BuilderBreakpoint = "desktop" | "tablet" | "mobile";

export type BuilderBlockType =
  | "section"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "spacer";

export type BlockStyleProps = {
  width?: string;
  maxWidth?: string;
  minHeight?: string;
  padding?: string;
  margin?: string;
  background?: string;
  color?: string;
  borderRadius?: string;
  border?: string;
  boxShadow?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right";
  lineHeight?: string;
  letterSpacing?: string;
  gap?: string;
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
};

export type BuilderBlockProps = {
  text?: string;
  href?: string;
  src?: string;
  alt?: string;
  animation?: {
    entrance?: "none" | "fade" | "fade-up" | "zoom";
    durationMs?: number;
    delayMs?: number;
    easing?: "ease" | "ease-in" | "ease-out" | "ease-in-out";
    hoverScale?: number;
    hoverLift?: number;
  };
  style?: BlockStyleProps;
  responsive?: Partial<Record<BuilderBreakpoint, BlockStyleProps>>;
  layout?: Partial<
    Record<
      BuilderBreakpoint,
      {
        colStart: number;
        colSpan: number;
        rowStart: number;
        rowSpan: number;
      }
    >
  >;
};

export type BuilderBlock = {
  id: string;
  type: BuilderBlockType;
  name: string;
  props: BuilderBlockProps;
  children: string[];
};

export type BuilderDocument = {
  version: 1;
  rootIds: string[];
  nodes: Record<string, BuilderBlock>;
};

export type BuilderPageMeta = {
  builderV2?: BuilderDocument;
};
