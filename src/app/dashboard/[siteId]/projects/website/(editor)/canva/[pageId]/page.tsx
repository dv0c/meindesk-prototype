"use client"

import type React from "react"
import { use, useEffect, useState } from "react"
import { useBuilderStore } from "@/lib/store"
import { Sidebar } from "./components/editor/sidebar"
import { Canvas } from "./components/editor/canvas"
import { ContextMenu } from "./components/editor/context-menu"
import { LayersPanel } from "./components/editor/layers-panel"
import { Button } from "./components/ui/button"
import { createNode, generateNodeId } from "@/lib/component-registry"
import type { ComponentDefinition, LayoutNode } from "@/lib/types"
import { Save, Eye, Home, Undo, Redo, Smartphone, Monitor, Tablet, Layers, ArrowLeft, ChevronLeft, SidebarClose, Box } from "lucide-react"
import Link from "next/link"
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

// Helper: find node’s parent recursively
function findNodeParent(id: string, nodes: LayoutNode[]): { parent: LayoutNode | null; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.children) {
      const childIndex = node.children.findIndex((c) => c.id === id)
      if (childIndex !== -1) return { parent: node, index: childIndex }

      const result = findNodeParent(id, node.children)
      if (result) return result
    }
  }

  const rootIndex = nodes.findIndex((n) => n.id === id)
  if (rootIndex !== -1) return { parent: null, index: rootIndex }

  return null
}

export default function EditorPage({ params }: { params: { siteId: string; pageId: string } }) {
  const { siteId: tenantId, pageId } = use(params as any) as any
  const [pageName, setPageName] = useState<string>("Sample Page")
  const [pageSlug, setPageSlug] = useState<string>()
  const [isSaving, setSaving] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeDragItem, setActiveDragItem] = useState<ComponentDefinition | null>(null)
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)
  const [showLayersPanel, setShowLayersPanel] = useState(false)
  const [loading, setLoading] = useState(true) // <--- Loading state
  const [validComponentNames, setValidComponentNames] = useState<string[]>([])

  const {
    nodes,
    selectedNodeId,
    addNode,
    updateNode,
    removeNode,
    selectNode,
    setCurrentPage,
    clearCanvas,
    findNode,
    moveNode,
    updateWebsiteSettings,
    websiteSettings,
  } = useBuilderStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  useEffect(() => {
    async function init() {
      await loadPage() // Wait for page to load first
      await loadSettings() // Then load settings
      loadComponents() // Components can load in parallel
    }
    init()
  }, [])

  async function loadComponents() {
    try {
      const { getAvailableComponents } = await import("@/lib/component-registry")
      const components = await getAvailableComponents(tenantId as string)
      setValidComponentNames(components.map(c => c.name))
    } catch (error) {
      console.error("Failed to load components:", error)
    }
  }

  async function loadPage() {
    setLoading(true)
    try {
      const response = await fetch(`/api/team/${tenantId}/pages/${pageId}`)
      if (response.ok) {
        const page = await response.json()
        setCurrentPage(page)
        setPageName(page.title)
        setPageSlug(page.slug)
      }
    } catch (error) {
      console.error("Failed to load page:", error)
      toast.error("Failed to load page")
    } finally {
      setLoading(false)
    }
  }

  async function loadSettings() {
    try {
      // Fetch site info to get name and description
      const siteResponse = await fetch(`/api/team/${tenantId}/sites/${tenantId}`)
      let siteName = 'Website'
      let siteDescription = 'Built with Prototype Meindesk'

      if (siteResponse.ok) {
        const siteData = await siteResponse.json()
        siteName = siteData.title || siteName
        siteDescription = siteData.description || siteDescription
      }

      // Fetch settings
      const response = await fetch(`/api/v1/${tenantId}/settings`)
      if (response.ok) {
        const settings = await response.json()

        // Use site name and description as defaults if not set in settings
        const settingsWithDefaults = {
          ...settings,
          title: settings.title || siteName,
          description: settings.description || siteDescription,
        }

        updateWebsiteSettings(settingsWithDefaults)
      } else {
        // If no settings exist, initialize with site info
        updateWebsiteSettings({
          title: siteName,
          description: siteDescription,
        })
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch(`/api/team/${tenantId}/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: pageName,
          tenantId,
          layout: nodes,
          slug: pageSlug
        }),
      })

      if (response.ok) toast.success("Page saved successfully")
      else throw new Error("Failed to save")
    } catch (error) {
      console.error("Failed to save page:", error)
      toast.error("Failed to save page")
    } finally {
      setSaving(false)
    }
  }

  function handleAddComponent(component: ComponentDefinition) {
    const node = createNode(component.name, component)
    addNode(node)
    toast(`Component Added`, {
      description: `${component.name} has been added to the canvas`,
    })
  }

  function handleUpdateNode(updates: Partial<LayoutNode>) {
    if (selectedNodeId) updateNode(selectedNodeId, updates)
  }

  function handleDeleteNode() {
    if (selectedNodeId) {
      removeNode(selectedNodeId)
      selectNode(null)
      toast("Component Deleted", { description: "Component has been removed from the canvas" })
    }
  }

  function handleDragStart(event: any) {
    const { active } = event
    if (active.data.current?.type === "palette-item") setActiveDragItem(active.data.current.component)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveDragItem(null)
    if (!over) return

    // Adding new component
    if (active.data.current?.type === "palette-item") {
      const component = active.data.current.component as ComponentDefinition
      const newNode = createNode(component.name, component)
      let parentId: string | null = null
      let index = 0

      if (over.id === "canvas-root") {
        parentId = null
        index = nodes.length
      } else {
        const overId = over.id as string
        const overNode = findNode(overId, nodes)
        const isContainer = over.data.current?.isContainer || (overNode && overNode.children !== undefined)

        if (isContainer) {
          parentId = overId
          index = overNode?.children?.length || 0
        } else {
          const parentInfo = findNodeParent(overId, nodes)
          if (parentInfo) {
            parentId = parentInfo.parent ? parentInfo.parent.id : null
            index = parentInfo.index + 1
          } else {
            parentId = null
            index = nodes.length
          }
        }
      }

      addNode(newNode, parentId as string)
      toast("Component Added", { description: `${component.name} has been added to the canvas` })
    }

    // Moving existing component
    else if (active.id !== over.id) {
      const activeId = active.id as string
      const overId = over.id as string
      if (activeId === overId) return

      let newParentId: string | null = null
      let newIndex = 0

      if (overId === "canvas-root") {
        newParentId = null
        newIndex = nodes.length
      } else {
        const overNode = findNode(overId, nodes)
        const isContainer = over.data.current?.isContainer || (overNode && overNode.children !== undefined)
        const isEmptyContainer = isContainer && overNode?.children?.length === 0

        if (isEmptyContainer) {
          newParentId = overId
          newIndex = 0
        } else {
          const parentInfo = findNodeParent(overId, nodes)
          if (parentInfo) {
            newParentId = parentInfo.parent ? parentInfo.parent.id : null
            newIndex = parentInfo.index
          }
        }
      }

      moveNode(activeId, newParentId, newIndex)
    }
  }

  function handleContextMenu(e: React.MouseEvent, nodeId: string) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId })
    selectNode(nodeId)
  }

  function handleDuplicateNode() {
    if (!contextMenu) return
    const node = findNode(contextMenu.nodeId, nodes)
    if (!node) return

    function cloneNode(original: LayoutNode): LayoutNode {
      return {
        ...original,
        id: generateNodeId(),
        children: original.children?.map(cloneNode),
      }
    }

    const clonedNode = cloneNode(node)
    const parentInfo = findNodeParent(contextMenu.nodeId, nodes)
    if (parentInfo && parentInfo.parent) {
      const parent = parentInfo.parent
      const newChildren = [...(parent.children || [])]
      newChildren.splice(parentInfo.index + 1, 0, clonedNode)
      updateNode(parent.id, { children: newChildren })
    } else {
      const rootIndex = nodes.findIndex((n) => n.id === contextMenu.nodeId)
      const newNodes = [...nodes]
      newNodes.splice(rootIndex + 1, 0, clonedNode)
      useBuilderStore.setState({ nodes: newNodes })
    }

    toast("Component Duplicated", { description: "Component has been duplicated" })
  }

  function handleMoveNodeUp() {
    if (!contextMenu) return
    const parentInfo = findNodeParent(contextMenu.nodeId, nodes)
    if (!parentInfo || parentInfo.index === 0) return

    if (parentInfo.parent) {
      const newChildren = [...(parentInfo.parent.children || [])]
      const [movedNode] = newChildren.splice(parentInfo.index, 1)
      newChildren.splice(parentInfo.index - 1, 0, movedNode)
      updateNode(parentInfo.parent.id, { children: newChildren })
    } else {
      const newNodes = [...nodes]
      const [movedNode] = newNodes.splice(parentInfo.index, 1)
      newNodes.splice(parentInfo.index - 1, 0, movedNode)
      useBuilderStore.setState({ nodes: newNodes })
    }
  }

  function handleMoveNodeDown() {
    if (!contextMenu) return
    const parentInfo = findNodeParent(contextMenu.nodeId, nodes)
    if (!parentInfo) return
    const siblings = parentInfo.parent ? parentInfo.parent.children || [] : nodes
    if (parentInfo.index >= siblings.length - 1) return

    if (parentInfo.parent) {
      const newChildren = [...siblings]
      const [movedNode] = newChildren.splice(parentInfo.index, 1)
      newChildren.splice(parentInfo.index + 1, 0, movedNode)
      updateNode(parentInfo.parent.id, { children: newChildren })
    } else {
      const newNodes = [...nodes]
      const [movedNode] = newNodes.splice(parentInfo.index, 1)
      newNodes.splice(parentInfo.index + 1, 0, movedNode)
      useBuilderStore.setState({ nodes: newNodes })
    }
  }

  async function handleAddChildToNode(parentId: string, componentType: string) {
    console.log("handleAddChildToNode:", parentId, componentType)
    const parentNode = findNode(parentId, nodes)
    if (!parentNode || parentNode.children === undefined) {
      console.error("Cannot add child: parent not found or is not a container")
      return
    }

    try {
      // Fetch the component definition
      const { getAvailableComponents } = await import("@/lib/component-registry")
      const components = await getAvailableComponents(tenantId)
      const componentDef = components.find(c => c.name === componentType)

      if (!componentDef) {
        console.error("Component definition not found:", componentType)
        return
      }

      // Create the new component node
      const newNode = createNode(componentType, componentDef)

      // Add the new node as a child
      const updatedChildren = [...(parentNode.children || []), newNode]
      updateNode(parentId, { children: updatedChildren })

      toast("Component Added", {
        description: `${componentType} has been added as a child`
      })
    } catch (error) {
      console.error("Failed to add child component:", error)
      toast.error("Failed to add component")
    }
  }

  // ----------------- Loading Skeleton -----------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-muted/10">
        <div className="w-full max-w-[1200px] p-6 animate-pulse">
          <div className="h-8 w-1/4 bg-muted rounded mb-6"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-3">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-40 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
            <div className="space-y-3">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ----------------- Main Editor -----------------
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-muted/10 overflow-hidden">
        {/* Top Bar */}
        {/* Modern Top Navbar with Glassmorphism */}
        <header className="h-16 border-b backdrop-blur-xl bg-background/80 shadow-sm flex items-center justify-between px-6 z-30 shrink-0">
          {/* Left: Page title */}
          <div className="flex items-center gap-4">
            <Button onClick={() => history.back()} variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 w-px bg-border/50" />
            <div className="flex items-center gap-3">
              <Input size={pageName.length || 8} maxLength={30} onChange={(e) => setPageName(e.target.value)} value={pageName || ""} placeholder="Untitled" className="h-9 bg-transparent border-none font-semibold text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-0" />
              <span className="px-2 py-1 text-xs font-medium bg-muted/80 text-muted-foreground rounded-full">Draft</span>
            </div>
          </div>

          {/* Center: Device toggle */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-muted/50 rounded-full p-1 border shadow-sm backdrop-blur-sm">
            <Button
              variant={deviceMode === "desktop" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-full transition-all"
              title="Desktop View"
              onClick={() => setDeviceMode("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceMode === "tablet" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-full transition-all"
              title="Tablet View"
              onClick={() => setDeviceMode("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceMode === "mobile" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-full transition-all"
              title="Mobile View"
              onClick={() => setDeviceMode("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant={showSidebar ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSidebar(!showSidebar)}
              title="Toggle Sidebar"
            >
              <SidebarClose className="h-4 w-4" />
            </Button>
            <Button
              variant={showLayersPanel ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowLayersPanel(!showLayersPanel)}
            >
              <Layers className="h-4 w-4" />
            </Button>

            {/* <Button variant="ghost" size="icon" className="h-8 w-8">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Redo className="h-4 w-4" />
            </Button> */}
            <div className="h-8 w-px bg-border/50 mx-2" />

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                Clear
              </Button>
              <Link href={`/preview/${pageId}`} target="_blank">
                <Button variant="secondary" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </Link>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Update"}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex h-full overflow-hidden">
          {showSidebar && (
            <Sidebar
              onAddComponent={handleAddComponent}
              onUpdateNode={handleUpdateNode}
              onDeleteNode={handleDeleteNode}
              siteId={tenantId}
            />
          )}
          <div className="flex-1 h-full overflow-hidden flex flex-col relative">
            <div className="overflow-auto h-full bg-zinc-50 dark:bg-zinc-900">
              {/* Inject Global Settings */}
              <style dangerouslySetInnerHTML={{
                __html: `
                  .canvas-preview {
                    ${websiteSettings.theme.backgroundColor ? `background-color: ${websiteSettings.theme.backgroundColor};` : ''}
                    ${websiteSettings.theme.textColor ? `color: ${websiteSettings.theme.textColor};` : ''}
                    ${websiteSettings.theme.fontFamily ? `font-family: '${websiteSettings.theme.fontFamily}', sans-serif;` : ''}
                  }
                  .canvas-preview * {
                    ${websiteSettings.theme.fontFamily ? `font-family: '${websiteSettings.theme.fontFamily}', sans-serif;` : ''}
                  }
                  ${websiteSettings.globalCss || ''}
                `
              }} />
              <div
                onClickCapture={(e) => {
                  const target = e.target as HTMLElement
                  if (target.closest("a")) {
                    e.preventDefault()
                  }
                }}
                className={`canvas-preview shadow-lg h-fit transition-all duration-300 ${nodes.length ? "min-h-full h-fit" : "h-full"} ${deviceMode === "mobile"
                  ? "w-[375px] mx-auto"
                  : deviceMode === "tablet"
                    ? "w-3xl mx-auto"
                    : "w-full max-w-full"
                  }`}
              >
                <Canvas
                  nodes={nodes}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={selectNode}
                  onContextMenu={handleContextMenu}
                  validComponentNames={validComponentNames}
                />
              </div>
            </div>
          </div>
        </div>

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onEdit={() => selectNode(contextMenu.nodeId)}
            onDuplicate={handleDuplicateNode}
            onDelete={() => {
              removeNode(contextMenu.nodeId)
              selectNode(null)
            }}
            onMoveUp={handleMoveNodeUp}
            onMoveDown={handleMoveNodeDown}
          />
        )}

        {showLayersPanel && (
          <LayersPanel
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={selectNode}
            onMoveNode={moveNode}
            onClose={() => setShowLayersPanel(false)}
            onDeleteNode={(id) => {
              removeNode(id)
              selectNode(null)
              toast("Component Deleted", {
                description: "Component has been removed from the canvas"
              })
            }}
            onDuplicateNode={(id) => {
              const node = findNode(id, nodes)
              if (!node) return

              function cloneNode(original: LayoutNode): LayoutNode {
                return {
                  ...original,
                  id: generateNodeId(),
                  children: original.children?.map(cloneNode),
                }
              }

              const clonedNode = cloneNode(node)
              const parentInfo = findNodeParent(id, nodes)
              if (parentInfo && parentInfo.parent) {
                const parent = parentInfo.parent
                const newChildren = [...(parent.children || [])]
                newChildren.splice(parentInfo.index + 1, 0, clonedNode)
                updateNode(parent.id, { children: newChildren })
              } else {
                const rootIndex = nodes.findIndex((n) => n.id === id)
                const newNodes = [...nodes]
                newNodes.splice(rootIndex + 1, 0, clonedNode)
                useBuilderStore.setState({ nodes: newNodes })
              }

              toast("Component Duplicated", {
                description: "Component has been duplicated"
              })
            }}
            onMoveNodeUp={(id) => {
              const parentInfo = findNodeParent(id, nodes)
              if (!parentInfo || parentInfo.index === 0) return

              if (parentInfo.parent) {
                const newChildren = [...(parentInfo.parent.children || [])]
                const [movedNode] = newChildren.splice(parentInfo.index, 1)
                newChildren.splice(parentInfo.index - 1, 0, movedNode)
                updateNode(parentInfo.parent.id, { children: newChildren })
              } else {
                const newNodes = [...nodes]
                const [movedNode] = newNodes.splice(parentInfo.index, 1)
                newNodes.splice(parentInfo.index - 1, 0, movedNode)
                useBuilderStore.setState({ nodes: newNodes })
              }
            }}
            onMoveNodeDown={(id) => {
              const parentInfo = findNodeParent(id, nodes)
              if (!parentInfo) return
              const siblings = parentInfo.parent ? parentInfo.parent.children || [] : nodes
              if (parentInfo.index >= siblings.length - 1) return

              if (parentInfo.parent) {
                const newChildren = [...siblings]
                const [movedNode] = newChildren.splice(parentInfo.index, 1)
                newChildren.splice(parentInfo.index + 1, 0, movedNode)
                updateNode(parentInfo.parent.id, { children: newChildren })
              } else {
                const newNodes = [...nodes]
                const [movedNode] = newNodes.splice(parentInfo.index, 1)
                newNodes.splice(parentInfo.index + 1, 0, movedNode)
                useBuilderStore.setState({ nodes: newNodes })
              }
            }}
            onAddChildToNode={handleAddChildToNode}
          />
        )}

        <DragOverlay dropAnimation={null}>
          {activeDragItem ? (
            <div className="flex flex-col items-center justify-center p-3 h-24 w-36 border-2 border-primary rounded-md bg-card shadow-xl cursor-grabbing">
              <Box className="h-6 w-6 mb-2 text-muted-foreground" />
              <span className="text-xs text-center font-medium leading-tight">{activeDragItem.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}
