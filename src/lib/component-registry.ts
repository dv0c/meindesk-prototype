import type { ComponentDefinition } from "./types"

// Component registry cache
let componentCache: ComponentDefinition[] | null = null

export async function getAvailableComponents(siteId?: string): Promise<ComponentDefinition[]> {
  // If we want to support caching with siteId, we'd need a map. 
  // For now, let's keep it simple: if siteId is provided, we fetch fresh.
  // Or we can simple invalidate cache if we want.

  // A simple strategy: append siteId to query
  try {
    const url = siteId
      ? `/api/canva/components?siteId=${siteId}`
      : `/api/canva/components`

    const response = await fetch(url)
    const components = await response.json()
    componentCache = components // Note: this effectively caches the last fetched set
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
    themeName: component.themeName, // Include theme name if present
  }
}
