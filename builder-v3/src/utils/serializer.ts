// Purpose: Project serialization, validation, and initial schema seeding utilities.

import { v4 as uuidv4 } from "uuid";
import {
  Breakpoint,
  ElementNode,
  ProjectSchema,
  ResponsiveStyleMap,
  StyleProps,
} from "@/types/types";

const VALID_BREAKPOINTS: Breakpoint[] = ["desktop", "tablet", "mobile"];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asStyleMap(value: unknown): ResponsiveStyleMap {
  const empty = { desktop: {}, tablet: {}, mobile: {} };
  if (!isObject(value)) {
    return empty;
  }
  return {
    desktop: isObject(value.desktop) ? (value.desktop as StyleProps) : {},
    tablet: isObject(value.tablet) ? (value.tablet as StyleProps) : {},
    mobile: isObject(value.mobile) ? (value.mobile as StyleProps) : {},
  };
}

function normalizeNode(node: unknown): ElementNode | null {
  if (!isObject(node) || typeof node.type !== "string") {
    return null;
  }

  const rawId = typeof node.id === "string" ? node.id : uuidv4();
  const props = (isObject(node.props) ? { ...(node.props as Record<string, unknown>) } : {}) as ElementNode["props"];
  const attrs = isObject(node.attrs) ? { ...node.attrs } : {};

  if (!attrs.htmlId && rawId && !rawId.includes("-")) {
    attrs.htmlId = rawId;
  }

  const styles = asStyleMap(node.styles);
  const nodeProps = isObject(node.props) ? (node.props as Record<string, unknown>) : undefined;
  if (nodeProps && isObject(nodeProps.style)) {
    styles.desktop = { ...(nodeProps.style as StyleProps), ...styles.desktop };
  }

  const childrenRaw = Array.isArray(node.children) ? node.children : [];
  const children = childrenRaw
    .map((child) => normalizeNode(child))
    .filter((child): child is ElementNode => child !== null);

  const interactions: ElementNode["interactions"] = [];
  if (Array.isArray(node.interactions)) {
    for (const entry of node.interactions) {
      if (!isObject(entry) || typeof entry.type !== "string") {
        continue;
      }
      interactions.push({
        id: typeof entry.id === "string" ? entry.id : uuidv4(),
        type: entry.type as ElementNode["interactions"][number]["type"],
        targetId: typeof entry.targetId === "string" ? entry.targetId : undefined,
        href: typeof entry.href === "string" ? entry.href : undefined,
        durationMs: typeof entry.durationMs === "number" ? entry.durationMs : undefined,
        easing: typeof entry.easing === "string" ? entry.easing : undefined,
        scale: typeof entry.scale === "number" ? entry.scale : undefined,
      });
    }
  }

  return {
    id: uuidv4(),
    type: node.type as ElementNode["type"],
    props,
    attrs,
    styles,
    interactions,
    children,
  };
}

export function validateProjectSchema(input: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!isObject(input)) {
    errors.push("Project payload must be an object.");
    return { valid: false, errors };
  }
  if (typeof input.id !== "string") {
    errors.push("Project id must be a string.");
  }
  if (typeof input.name !== "string") {
    errors.push("Project name must be a string.");
  }
  if (!Array.isArray(input.pages)) {
    errors.push("Project pages must be an array.");
  }
  return { valid: errors.length === 0, errors };
}

export function normalizeProject(input: unknown): ProjectSchema | null {
  const validation = validateProjectSchema(input);
  if (!validation.valid || !isObject(input) || !Array.isArray(input.pages)) {
    return null;
  }

  const pages = input.pages
    .map((page) => {
      if (!isObject(page) || !isObject(page.root)) {
        return null;
      }
      const root = normalizeNode(page.root);
      if (!root) {
        return null;
      }

      const breakpoints = Array.isArray(page.breakpoints)
        ? page.breakpoints.filter((bp) => VALID_BREAKPOINTS.includes(bp as Breakpoint))
        : ["desktop", "tablet", "mobile"];

      return {
        id: typeof page.id === "string" ? page.id : uuidv4(),
        title: typeof page.title === "string" ? page.title : "Page",
        breakpoints: breakpoints.length > 0 ? (breakpoints as Breakpoint[]) : ["desktop", "tablet", "mobile"],
        root,
      };
    })
    .filter((page): page is ProjectSchema["pages"][number] => page !== null);

  if (pages.length === 0) {
    return null;
  }

  return {
    id: input.id as string,
    name: input.name as string,
    createdAt: typeof input.createdAt === "string" ? input.createdAt : new Date().toISOString(),
    pages,
  };
}

export function serializeProject(project: ProjectSchema): string {
  return JSON.stringify(project, null, 2);
}

export function loadProject(payload: string | unknown): ProjectSchema | null {
  try {
    const parsed = typeof payload === "string" ? (JSON.parse(payload) as unknown) : payload;
    return normalizeProject(parsed);
  } catch {
    return null;
  }
}

export function createInitialProject(): ProjectSchema {
  const template = {
    id: "default",
    name: "New Project",
    createdAt: new Date().toISOString(),
    pages: [
      {
        id: "home",
        title: "Home",
        breakpoints: ["desktop", "tablet", "mobile"],
        root: {
          id: "root",
          type: "section",
          props: {
            style: {
              display: "block",
              padding: "0",
              margin: "0",
            },
          },
          children: [
            {
              id: "container-1",
              type: "container",
              props: {
                style: {
                  maxWidth: "1100px",
                  margin: "0 auto",
                  padding: "24px",
                },
              },
              children: [
                {
                  id: "heading-1",
                  type: "h1",
                  props: {
                    content: "Hello Builder",
                    style: {
                      fontSize: "40px",
                      color: "#f4f8ff",
                    },
                  },
                  children: [],
                },
                {
                  id: "btn-1",
                  type: "button",
                  props: {
                    content: "Click me",
                    style: {
                      padding: "12px 20px",
                    },
                  },
                  children: [],
                },
              ],
            },
          ],
        },
      },
    ],
  };

  const normalized = normalizeProject(template);
  if (!normalized) {
    throw new Error("Failed to create initial project.");
  }
  return normalized;
}
