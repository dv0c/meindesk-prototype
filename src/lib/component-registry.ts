import type { ComponentDefinition } from "./types"

// Component registry cache
let componentCache: ComponentDefinition[] | null = null

export async function getAvailableComponents(): Promise<ComponentDefinition[]> {
  if (componentCache) {
    return componentCache
  }

  try {
    const response = await fetch("/api/components")
    const components = await response.json()
    componentCache = components
    return components
  } catch (error) {
    console.error("Failed to fetch components:", error)
    return []
  }
}

export function clearComponentCache() {
  componentCache = null
}

// Generate a unique ID for nodes
export function generateNodeId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Create a new node with default props
export function createNode(type: string, component: ComponentDefinition): import("./types").LayoutNode {
  const props: Record<string, any> = {}

  // Set default values for all props
  component.props.forEach((prop) => {
    props[prop.name] = prop.defaultValue
  })

  return {
    id: generateNodeId(),
    type,
    props,
    children: component.allowChildren ? [] : undefined,
  }
}
