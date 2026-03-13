// Purpose: Pure immutable tree operations used by the editor store and tests.

import { v4 as uuidv4 } from "uuid";
import {
  BREAKPOINT_ORDER,
  Breakpoint,
  ElementNode,
  ElementType,
  ResponsiveStyleMap,
  StyleProps,
} from "@/types/types";

const EMPTY_STYLES: ResponsiveStyleMap = {
  desktop: {},
  tablet: {},
  mobile: {},
};

function makeStyles(style: StyleProps): ResponsiveStyleMap {
  return {
    desktop: style,
    tablet: {},
    mobile: {},
  };
}

export function defaultElementNode(type: ElementType): ElementNode {
  const base = {
    id: uuidv4(),
    type,
    props: {},
    attrs: {},
    styles: { ...EMPTY_STYLES },
    interactions: [],
    children: [],
  } satisfies ElementNode;

  switch (type) {
    case "section":
      return {
        ...base,
        props: { content: "Section" },
        styles: makeStyles({
          display: "block",
          minHeight: "120px",
          padding: "24px",
          margin: "0",
          position: "relative",
          border: "1px solid rgba(59,130,246,0.15)",
        }),
      };
    case "container":
      return {
        ...base,
        props: { content: "Container" },
        styles: makeStyles({
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "24px",
          display: "block",
          position: "relative",
        }),
      };
    case "div":
      return {
        ...base,
        props: { content: "Div" },
        styles: makeStyles({
          minHeight: "40px",
          padding: "8px",
          position: "relative",
        }),
      };
    case "text":
      return {
        ...base,
        props: { content: "Text" },
        styles: makeStyles({
          fontSize: "16px",
          lineHeight: "1.5",
          color: "#d8e4f2",
          margin: "0",
        }),
      };
    case "h1":
      return {
        ...base,
        props: { content: "Heading" },
        styles: makeStyles({
          fontSize: "40px",
          lineHeight: "1.1",
          fontWeight: "700",
          color: "#f4f8ff",
          margin: "0 0 16px 0",
        }),
      };
    case "image":
      return {
        ...base,
        props: {
          src: "/placeholder.png",
          alt: "Image",
        },
        styles: makeStyles({
          width: "320px",
          height: "220px",
          objectFit: "cover",
          borderRadius: "12px",
        }),
      };
    case "button":
      return {
        ...base,
        props: { content: "Button" },
        styles: makeStyles({
          display: "inline-block",
          padding: "12px 20px",
          background: "#2f90ff",
          color: "#ffffff",
          borderRadius: "10px",
          border: "0",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
        }),
      };
    case "link":
      return {
        ...base,
        props: { content: "Link", href: "#" },
        styles: makeStyles({
          color: "#4aa5ff",
          textDecoration: "none",
          display: "inline-block",
        }),
      };
    case "spacer":
      return {
        ...base,
        props: {},
        styles: makeStyles({
          width: "100%",
          height: "24px",
          display: "block",
        }),
      };
    default:
      return base;
  }
}

export function deepCloneNode(node: ElementNode): ElementNode {
  return {
    ...node,
    attrs: { ...node.attrs },
    props: { ...node.props },
    interactions: node.interactions.map((it) => ({ ...it })),
    styles: {
      desktop: { ...node.styles.desktop },
      tablet: { ...node.styles.tablet },
      mobile: { ...node.styles.mobile },
    },
    children: node.children.map(deepCloneNode),
  };
}

export function findNode(root: ElementNode, id: string): ElementNode | null {
  if (root.id === id) {
    return root;
  }
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) {
      return found;
    }
  }
  return null;
}

export function findParentId(root: ElementNode, id: string): string | null {
  for (const child of root.children) {
    if (child.id === id) {
      return root.id;
    }
    const nested = findParentId(child, id);
    if (nested) {
      return nested;
    }
  }
  return null;
}

export function mapNode(root: ElementNode, id: string, fn: (node: ElementNode) => ElementNode): ElementNode {
  if (root.id === id) {
    return fn(deepCloneNode(root));
  }
  return {
    ...root,
    children: root.children.map((child) => mapNode(child, id, fn)),
  };
}

export function insertNode(root: ElementNode, parentId: string, node: ElementNode, index?: number): ElementNode {
  return mapNode(root, parentId, (parent) => {
    const children = [...parent.children, deepCloneNode(node)];
    if (typeof index === "number" && index >= 0 && index < children.length) {
      const inserted = children.pop();
      if (inserted) {
        children.splice(index, 0, inserted);
      }
    }
    return { ...parent, children };
  });
}

export function removeNode(root: ElementNode, id: string): { root: ElementNode; removed: ElementNode | null } {
  if (root.id === id) {
    return { root, removed: null };
  }

  let removed: ElementNode | null = null;
  const visit = (node: ElementNode): ElementNode => {
    const nextChildren: ElementNode[] = [];
    for (const child of node.children) {
      if (child.id === id) {
        removed = deepCloneNode(child);
      } else {
        nextChildren.push(visit(child));
      }
    }
    return { ...node, children: nextChildren };
  };

  return { root: visit(root), removed };
}

function isDescendant(node: ElementNode, candidateParentId: string): boolean {
  if (node.id === candidateParentId) {
    return true;
  }
  return node.children.some((child) => isDescendant(child, candidateParentId));
}

export function moveNode(
  root: ElementNode,
  nodeId: string,
  targetParentId: string,
  targetIndex?: number,
): ElementNode {
  const movingNode = findNode(root, nodeId);
  const targetParent = findNode(root, targetParentId);
  if (!movingNode || !targetParent || nodeId === root.id) {
    return root;
  }
  if (isDescendant(movingNode, targetParentId)) {
    return root;
  }

  const removed = removeNode(root, nodeId);
  if (!removed.removed) {
    return root;
  }
  return insertNode(removed.root, targetParentId, removed.removed, targetIndex);
}

export function deleteNode(root: ElementNode, id: string): ElementNode {
  if (root.id === id) {
    return root;
  }
  return removeNode(root, id).root;
}

export function duplicateNode(root: ElementNode, id: string): ElementNode {
  const parentId = findParentId(root, id);
  const node = findNode(root, id);
  if (!parentId || !node) {
    return root;
  }

  const duplicateWithFreshIds = (source: ElementNode): ElementNode => ({
    ...deepCloneNode(source),
    id: uuidv4(),
    attrs: {
      ...source.attrs,
      htmlId: source.attrs.htmlId ? `${source.attrs.htmlId}-copy` : undefined,
    },
    children: source.children.map(duplicateWithFreshIds),
  });

  const parent = findNode(root, parentId);
  if (!parent) {
    return root;
  }

  const index = parent.children.findIndex((child) => child.id === id);
  const clone = duplicateWithFreshIds(node);
  return insertNode(root, parentId, clone, index + 1);
}

export function updateNodeProps(root: ElementNode, id: string, patch: Record<string, string>): ElementNode {
  return mapNode(root, id, (node) => ({
    ...node,
    props: {
      ...node.props,
      ...patch,
    },
  }));
}

export function updateNodeAttrs(root: ElementNode, id: string, patch: Record<string, string>): ElementNode {
  return mapNode(root, id, (node) => ({
    ...node,
    attrs: {
      ...node.attrs,
      ...patch,
    },
  }));
}

export function updateNodeStyle(
  root: ElementNode,
  id: string,
  breakpoint: Breakpoint,
  patch: Record<string, string>,
): ElementNode {
  return mapNode(root, id, (node) => ({
    ...node,
    styles: {
      ...node.styles,
      [breakpoint]: {
        ...node.styles[breakpoint],
        ...patch,
      },
    },
  }));
}

export function resolveStyles(node: ElementNode, breakpoint: Breakpoint): StyleProps {
  const merged: StyleProps = { ...(node.props.style ?? {}), ...node.styles.desktop };
  for (const bp of BREAKPOINT_ORDER) {
    if (bp === "desktop") {
      continue;
    }
    Object.assign(merged, node.styles[bp]);
    if (bp === breakpoint) {
      break;
    }
  }
  return merged;
}

export function setNodeInteractions(root: ElementNode, id: string, interactions: ElementNode["interactions"]): ElementNode {
  return mapNode(root, id, (node) => ({
    ...node,
    interactions: interactions.map((it) => ({ ...it })),
  }));
}

export function flattenTree(root: ElementNode): ElementNode[] {
  const nodes: ElementNode[] = [root];
  for (const child of root.children) {
    nodes.push(...flattenTree(child));
  }
  return nodes;
}
