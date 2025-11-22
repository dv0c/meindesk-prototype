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
import { Save, Eye, Home, Undo, Redo, Smartphone, Monitor, Tablet, Layers } from "lucide-react"
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
  const { id: tenantId, pageId } = use(params as any) as any
  const [pageName, setPageName] = useState<string>("Sample Page")
  const [isSaving, setSaving] = useState(false)
  const [activeDragItem, setActiveDragItem] = useState<ComponentDefinition | null>(null)
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)
  const [showLayersPanel, setShowLayersPanel] = useState(false)

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
  } = useBuilderStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  useEffect(() => {
    loadPage()
  }, [])

  async function loadPage() {
    try {
      const response = await fetch(`/api/team/${tenantId}/pages/${pageId}`)
      if (response.ok) {
        const page = await response.json()
        setCurrentPage(page)
        setPageName(page.title)
      }
    } catch (error) {
      console.error("Failed to load page:", error)
      toast.error("Failed to load page")
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

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-muted/10 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b bg-background flex items-center justify-between px-5 pb-5 z-30 shrink-0">
          {/* Left: Page title */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold">{pageName}</h1>
              <span className="text-sm text-muted-foreground">Draft</span>
            </div>
          </div>

          {/* Center: Device toggle */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-muted/50 rounded-md p-1 border shadow-sm">
            <Button
              variant={deviceMode === "desktop" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDeviceMode("desktop")}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceMode === "tablet" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDeviceMode("tablet")}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={deviceMode === "mobile" ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDeviceMode("mobile")}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant={showLayersPanel ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowLayersPanel(!showLayersPanel)}
            >
              <Layers className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Redo className="h-4 w-4" />
            </Button>
            <div className="h-6 w-px bg-border mx-2" />
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
        </header>


        <div className="flex-1 flex overflow-hidden">
          <Sidebar onAddComponent={handleAddComponent} onUpdateNode={handleUpdateNode} onDeleteNode={handleDeleteNode} />

          <div className="flex-1 bg-muted/10 overflow-hidden flex flex-col relative">
            <div className="absolute inset-0 p-8 overflow-auto flex justify-center">
              <div
                className={`bg-background shadow-sm border min-h-fit transition-all duration-300 ${deviceMode === "mobile"
                  ? "w-[375px]"
                  : deviceMode === "tablet"
                    ? "w-[768px]"
                    : "w-full max-w-[1200px]"
                  }`}
              >
                <Canvas
                  nodes={nodes}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={selectNode}
                  onContextMenu={handleContextMenu}
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
          />
        )}

        <DragOverlay>
          {activeDragItem ? (
            <Button variant="secondary" className="cursor-grabbing opacity-80 shadow-xl border-2 border-primary">
              {activeDragItem.name}
            </Button>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}
