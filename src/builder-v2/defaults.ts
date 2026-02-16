import { BuilderBlock, BuilderDocument, BuilderBlockType } from "./types";

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function createBlock(type: BuilderBlockType, partial?: Partial<BuilderBlock>): BuilderBlock {
  const id = partial?.id || uid();
  const base: BuilderBlock = {
    id,
    type,
    name: type[0].toUpperCase() + type.slice(1),
    props: { style: {} },
    children: [],
  };

  if (type === "section") {
    base.props.style = {
      minHeight: "160px",
      padding: "48px 56px",
      margin: "0 0 20px 0",
      background: "linear-gradient(145deg, #ffffff 0%, #f4f7fb 100%)",
      borderRadius: "18px",
      border: "1px solid #e6ebf3",
      boxShadow: "0 12px 32px rgba(19, 36, 65, 0.08)",
    };
  }

  if (type === "heading") {
    base.name = "Heading";
    base.props.text = "A serious builder for serious websites";
    base.props.style = {
      margin: "0 0 12px 0",
      color: "#0f172a",
      fontSize: "48px",
      fontWeight: "700",
      lineHeight: "1.1",
      letterSpacing: "-0.02em",
      textAlign: "left",
    };
    base.props.animation = {
      entrance: "fade-up",
      durationMs: 520,
      delayMs: 40,
      easing: "ease-out",
      hoverLift: 0,
      hoverScale: 1,
    };
    base.props.layout = {
      desktop: { colStart: 1, colSpan: 7, rowStart: 1, rowSpan: 7 },
      tablet: { colStart: 1, colSpan: 8, rowStart: 1, rowSpan: 6 },
      mobile: { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 6 },
    };
  }

  if (type === "text") {
    base.name = "Paragraph";
    base.props.text =
      "Build and iterate in one fluid surface. Drag, style, animate, and ship without context switching.";
    base.props.style = {
      margin: "0",
      color: "#334155",
      fontSize: "17px",
      lineHeight: "1.7",
      textAlign: "left",
    };
    base.props.animation = {
      entrance: "fade",
      durationMs: 540,
      delayMs: 90,
      easing: "ease-out",
      hoverLift: 0,
      hoverScale: 1,
    };
    base.props.layout = {
      desktop: { colStart: 1, colSpan: 7, rowStart: 8, rowSpan: 6 },
      tablet: { colStart: 1, colSpan: 8, rowStart: 7, rowSpan: 5 },
      mobile: { colStart: 1, colSpan: 4, rowStart: 7, rowSpan: 6 },
    };
  }

  if (type === "button") {
    base.name = "Button";
    base.props.text = "Start building";
    base.props.href = "#";
    base.props.style = {
      margin: "22px 0 0 0",
      background: "#0f172a",
      color: "#f8fafc",
      borderRadius: "999px",
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "600",
      letterSpacing: "0.01em",
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.25)",
    };
    base.props.animation = {
      entrance: "zoom",
      durationMs: 480,
      delayMs: 120,
      easing: "ease-out",
      hoverLift: 1,
      hoverScale: 1.015,
    };
    base.props.layout = {
      desktop: { colStart: 1, colSpan: 4, rowStart: 14, rowSpan: 4 },
      tablet: { colStart: 1, colSpan: 4, rowStart: 12, rowSpan: 4 },
      mobile: { colStart: 1, colSpan: 4, rowStart: 13, rowSpan: 4 },
    };
  }

  if (type === "image") {
    base.name = "Image";
    base.props.src = "https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=1800&q=80";
    base.props.alt = "Workspace";
    base.props.style = {
      margin: "20px 0 0 0",
      width: "100%",
      borderRadius: "16px",
      minHeight: "280px",
      boxShadow: "0 12px 36px rgba(15, 23, 42, 0.16)",
    };
    base.props.layout = {
      desktop: { colStart: 8, colSpan: 5, rowStart: 1, rowSpan: 16 },
      tablet: { colStart: 1, colSpan: 8, rowStart: 1, rowSpan: 12 },
      mobile: { colStart: 1, colSpan: 4, rowStart: 1, rowSpan: 10 },
    };
  }

  if (type === "spacer") {
    base.name = "Spacer";
    base.props.style = {
      minHeight: "32px",
    };
  }

  return { ...base, ...partial, id };
}

export function createStarterDocument(): BuilderDocument {
  const section = createBlock("section");
  const heading = createBlock("heading");
  const text = createBlock("text");
  const button = createBlock("button");

  section.children = [heading.id, text.id, button.id];

  return {
    version: 1,
    rootIds: [section.id],
    nodes: {
      [section.id]: section,
      [heading.id]: heading,
      [text.id]: text,
      [button.id]: button,
    },
  };
}

export function createNewBlock(type: BuilderBlockType): BuilderBlock {
  return createBlock(type);
}
