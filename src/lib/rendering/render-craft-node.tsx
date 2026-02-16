import React from "react"

type SerializedNode = {
  type?: string | { resolvedName?: string }
  props?: Record<string, any>
  nodes?: string[]
  linkedNodes?: Record<string, string>
}

type CraftState = {
  ROOT?: SerializedNode
  nodes?: Record<string, SerializedNode>
  [key: string]: any
}

type RenderProps = {
  state: CraftState
  className?: string
}

const SUPPORTED = new Set([
  "Container",
  "Section",
  "Grid",
  "Box",
  "Stack",
  "Spacer",
  "Divider",
  "Heading",
  "Text",
  "Button",
  "Image",
])

function getNodesMap(state: CraftState): Record<string, SerializedNode> {
  if (state.nodes && typeof state.nodes === "object") return state.nodes
  const copy = { ...state }
  return copy as Record<string, SerializedNode>
}

function getNodeName(node: SerializedNode): string {
  const raw = node?.type
  if (typeof raw === "string") return raw
  return raw?.resolvedName || "Unknown"
}

function responsiveClass(hiddenOn?: string[]) {
  if (!hiddenOn || !hiddenOn.length) return ""
  return [
    hiddenOn.includes("mobile") ? "max-md:hidden" : "",
    hiddenOn.includes("tablet") ? "md:max-lg:hidden" : "",
    hiddenOn.includes("desktop") ? "lg:hidden" : "",
  ]
    .filter(Boolean)
    .join(" ")
}

function renderStyle(props?: Record<string, any>): React.CSSProperties {
  const style = { ...(props?.style || {}), ...(props?.blockStyle || {}) }
  const sizeKeys = ["width", "height", "minHeight", "maxWidth", "minWidth", "maxHeight"]
  sizeKeys.forEach((key) => {
    if (props?.[key] !== undefined && style[key] === undefined) style[key] = props[key]
  })
  return style
}

function renderNode(nodes: Record<string, SerializedNode>, nodeId: string): React.ReactNode {
  const node = nodes[nodeId]
  if (!node) return null

  const props = node.props || {}
  const name = getNodeName(node)
  const childIds = [...(node.nodes || []), ...Object.values(node.linkedNodes || {})]
  const children = childIds.map((id) => <React.Fragment key={id}>{renderNode(nodes, id)}</React.Fragment>)
  const className = [props.className || "", responsiveClass(props.responsive?.hiddenOn)].filter(Boolean).join(" ")
  const style = renderStyle(props)

  if (name === "Container" || name === "Section" || name === "Box" || name === "Stack") {
    const Tag = name === "Section" ? "section" : "div"
    return React.createElement(Tag, { className, style }, children)
  }

  if (name === "Grid") {
    const columns = Number(props.columns || 2)
    const rows = Number(props.rows || 0)
    return (
      <div
        className={className}
        style={{
          ...style,
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))`,
          gridTemplateRows: rows > 0 ? `repeat(${rows}, minmax(0, 1fr))` : undefined,
        }}
      >
        {children}
      </div>
    )
  }

  if (name === "Spacer") {
    const height = props.height || style.height || 24
    return <div className={className} style={{ ...style, height }} />
  }

  if (name === "Divider") {
    return <hr className={className} style={style} />
  }

  if (name === "Heading") {
    const level = (props.level || "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    const text = props.text || ""
    return React.createElement(level, { className, style }, text)
  }

  if (name === "Text") {
    return (
      <p className={className} style={style}>
        {props.text || ""}
      </p>
    )
  }

  if (name === "Button") {
    return (
      <a className={className} style={style} href={props.url || "#"}>
        {props.text || "Button"}
      </a>
    )
  }

  if (name === "Image") {
    return (
      <img
        className={className}
        style={style}
        src={props.src || ""}
        alt={props.alt || "image"}
      />
    )
  }

  // Unsupported node in static renderer
  return null
}

export function canRenderCraftTreeStatic(state: CraftState): boolean {
  const nodes = getNodesMap(state)
  const list = Object.values(nodes)
  for (const node of list) {
    const name = getNodeName(node)
    if (name === "ROOT") continue
    if (!SUPPORTED.has(name)) return false
  }
  return true
}

export function RenderCraftTree({ state, className }: RenderProps) {
  const nodes = getNodesMap(state)
  const root = nodes.ROOT || state.ROOT
  if (!root) return null
  const rootChildren = root.nodes || []

  return (
    <div className={className}>
      {rootChildren.map((id) => (
        <React.Fragment key={id}>{renderNode(nodes, id)}</React.Fragment>
      ))}
    </div>
  )
}
