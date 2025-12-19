"use client"

import type React from "react"
import { use, useEffect, useState, useRef, useCallback } from "react"
import { useBuilderStore } from "@/lib/store"
import { Sidebar } from "./components/editor/sidebar"
import { Canvas } from "./components/editor/canvas"
import { ContextMenu } from "./components/editor/context-menu"
import { LayersPanel } from "./components/editor/layers-panel"
import { SaveSnippetDialog } from "./components/editor/save-snippet-dialog"
import { EditSnippetDialog } from "./components/editor/edit-snippet-dialog"
import { Button } from "./components/ui/button"
import { createNode, generateNodeId } from "@/lib/component-registry"
import type { ComponentDefinition, LayoutNode } from "@/lib/types"
import { Save, Eye, Home, Undo, Redo, Smartphone, Monitor, Tablet, Layers, ArrowLeft, ChevronLeft, SidebarClose, Box, FileEdit } from "lucide-react"
import Link from "next/link"
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  closestCenter,
  type CollisionDetection,
} from "@dnd-kit/core"
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { SnippetsProvider } from "./components/editor/snippets-context"

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
  const [activeDrag, setActiveDrag] = useState<{
    type: 'new' | 'existing';
    item: ComponentDefinition | LayoutNode;
  } | null>(null)
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)
  const [showLayersPanel, setShowLayersPanel] = useState(false)
  const [loading, setLoading] = useState(true) // <--- Loading state
  const [componentsLoading, setComponentsLoading] = useState(true) // <--- Components loading state
  const [validComponentNames, setValidComponentNames] = useState<string[]>([])
  const [dragOverId, setDragOverId] = useState<string | null>(null) // Track hover position during drag

  // Snippet state
  const [showSaveSnippetDialog, setShowSaveSnippetDialog] = useState(false)
  const [snippetContent, setSnippetContent] = useState<LayoutNode[]>([])
  const [showEditSnippetDialog, setShowEditSnippetDialog] = useState(false)
  const [editSnippetId, setEditSnippetId] = useState<string | null>(null)
  const [snippetToReplaceNodeId, setSnippetToReplaceNodeId] = useState<string | null>(null)
  const snippetsPanelRef = useRef<{ refresh: () => void } | null>(null)

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

  // Custom collision detection: tries pointerWithin first, then rect, then closestCenter
  const customCollisionDetection: CollisionDetection = (args) => {
    // First try pointer-based detection for precision
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }
    // Then try rect intersection
    const rectCollisions = rectIntersection(args)
    if (rectCollisions.length > 0) {
      return rectCollisions
    }
    // Final fallback to closestCenter (works well with sortable contexts)
    return closestCenter(args)
  }

  useEffect(() => {
    async function init() {
      await loadPage() // Wait for page to load first
      await loadSettings() // Then load settings
      loadComponents() // Components can load in parallel
    }
    init()
  }, [])

  async function loadComponents() {
    setComponentsLoading(true)
    try {
      const { getAvailableComponents } = await import("@/lib/component-registry")
      const components = await getAvailableComponents(tenantId as string)
      setValidComponentNames(components.map(c => c.name))
    } catch (error) {
      console.error("Failed to load components:", error)
    } finally {
      setComponentsLoading(false)
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

  // Update snippet content - save to snippet database
  async function handleUpdateSnippetContent(snippetId: string, contentNodeId: string, updates: Partial<LayoutNode>) {
    try {
      // Fetch current snippet data
      const response = await fetch(`/api/v1/${tenantId}/snippets/${snippetId}`)
      if (!response.ok) throw new Error("Failed to fetch snippet")

      const snippet = await response.json()
      const snippetContent = snippet.content as LayoutNode[]

      // Find and update the node in snippet content
      function updateNodeInTree(nodes: LayoutNode[]): LayoutNode[] {
        return nodes.map(node => {
          if (node.id === contentNodeId) {
            return { ...node, ...updates }
          }
          if (node.children) {
            return { ...node, children: updateNodeInTree(node.children) }
          }
          return node
        })
      }

      const updatedContent = updateNodeInTree(snippetContent)

      // Save updated content to database
      const saveResponse = await fetch(`/api/v1/${tenantId}/snippets/${snippetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: updatedContent }),
      })

      if (!saveResponse.ok) throw new Error("Failed to save snippet")

      toast.success("Snippet updated", { description: "Changes saved to snippet" })

      // Trigger snippets refresh to propagate changes
      window.dispatchEvent(new CustomEvent("snippets-refresh"))
    } catch (error) {
      console.error("Failed to update snippet content:", error)
      toast.error("Failed to update snippet")
    }
  }

  function handleDeleteNode() {
    if (selectedNodeId) {
      removeNode(selectedNodeId)
      selectNode(null)
      toast("Component Deleted", { description: "Component has been removed from the canvas" })
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    const type = active.data.current?.type

    if (type === "palette-item") {
      setActiveDrag({ type: 'new', item: active.data.current?.component })
    } else if (type === "snippet-item") {
      // Dragging snippet from sidebar - store snippet info
      setActiveDrag({ type: 'new', item: { name: active.data.current?.snippet?.name || 'Snippet', type: 'SnippetRef' } as any })
    } else if (active.data.current?.component) {
      // Dragging existing component on canvas
      setActiveDrag({ type: 'existing', item: active.data.current.component })
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event
    setDragOverId(over?.id as string | null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveDrag(null)
    setDragOverId(null)
    if (!over) {
      return
    }

    const dataType = active.data.current?.type

    // Helper to get actual node ID (strips droppable- prefix if present)
    const getNodeId = (id: string): string => {
      if (id.startsWith('droppable-')) {
        return id.replace('droppable-', '')
      }
      return id
    }

    // Helper to check if drop occurred within the canvas area
    // Trust the collision detection - if we have a valid 'over' target that starts with
    // 'canvas-root' or 'droppable-', it's a valid canvas drop
    const isDropWithinCanvas = (): boolean => {
      const overId = over?.id as string
      if (!overId) return false

      // Valid canvas targets
      if (overId === 'canvas-root') return true
      if (overId.startsWith('droppable-')) return true

      // Check if it's a sortable node on canvas 
      const node = findNode(overId, nodes)
      if (node) return true

      return false
    }

    // Adding new component from sidebar (palette-item)
    if (dataType === "palette-item") {
      console.log('[DragEnd] Palette item drop:', { overId: over.id, isWithinCanvas: isDropWithinCanvas() })

      // Only add if drop occurred within the canvas area
      if (!isDropWithinCanvas()) {
        console.log('[DragEnd] Drop outside canvas, ignoring')
        return // User cancelled by dropping outside canvas
      }

      const component = active.data.current?.component as ComponentDefinition
      const newNode = createNode(component.name, component)
      let parentId: string | null = null

      if (over.id === "canvas-root") {
        parentId = null
        console.log('[DragEnd] Adding to canvas root')
      } else {
        const overId = getNodeId(over.id as string)
        const overNode = findNode(overId, nodes)

        console.log('[DragEnd] Drop target:', { overId, overNode: !!overNode, overData: over.data.current })

        // If node not found but it's a droppable- ID, add to root
        if (!overNode) {
          console.log('[DragEnd] Node not found, adding to root')
          parentId = null
        } else {
          const isContainer = over.data.current?.isContainer || (overNode && overNode.children !== undefined)

          if (isContainer) {
            parentId = overId
          } else {
            const parentInfo = findNodeParent(overId, nodes)
            parentId = parentInfo?.parent?.id || null
          }
        }
      }

      addNode(newNode, parentId || undefined)
      toast("Component Added", { description: `${component.name} has been added to the canvas` })
    }

    // Adding snippet from sidebar (snippet-item)
    else if (dataType === "snippet-item") {
      console.log('[DragEnd] Snippet item drop:', { overId: over.id, isWithinCanvas: isDropWithinCanvas() })

      // Only add if drop occurred within the canvas area
      if (!isDropWithinCanvas()) {
        console.log('[DragEnd] Snippet drop outside canvas, ignoring')
        return // User cancelled by dropping outside canvas
      }

      const snippet = active.data.current?.snippet
      const refNode: LayoutNode = {
        id: generateNodeId(),
        type: "SnippetRef",
        snippetId: snippet.id,
        props: {},
      }

      let parentId: string | null = null
      if (over.id === "canvas-root") {
        parentId = null
        console.log('[DragEnd] Snippet adding to canvas root')
      } else {
        const overId = getNodeId(over.id as string)
        const overNode = findNode(overId, nodes)

        console.log('[DragEnd] Snippet drop target:', { overId, overNode: !!overNode })

        // If node not found but it's a droppable- ID, add to root
        if (!overNode) {
          console.log('[DragEnd] Snippet node not found, adding to root')
          parentId = null
        } else {
          const isContainer = over.data.current?.isContainer || (overNode && overNode.children !== undefined)

          if (isContainer) {
            parentId = overId
          } else {
            const parentInfo = findNodeParent(overId, nodes)
            parentId = parentInfo?.parent?.id || null
          }
        }
      }

      addNode(refNode, parentId || undefined)
      toast("Snippet Added", { description: `"${snippet.name}" has been added to the canvas` })
    }

    // Moving/reordering existing component (including snippets on canvas)
    else if (active.id !== over.id) {
      console.log('[DragEnd] Moving existing component:', { activeId: active.id, overId: over.id })

      const activeId = active.id as string
      const overId = over.id as string

      let newParentId: string | null = null
      let newIndex = 0

      if (overId === "canvas-root") {
        // Drop to root level - add at end
        newParentId = null
        newIndex = nodes.length
        console.log('[DragEnd] Moving to canvas root at index:', newIndex)
      } else {
        const cleanOverId = getNodeId(overId)
        const overNode = findNode(cleanOverId, nodes)
        const isContainer = over.data.current?.isContainer || (overNode && overNode.children !== undefined)

        console.log('[DragEnd] Move target:', { cleanOverId, overNode: !!overNode, isContainer })

        if (isContainer) {
          // Drop inside container
          newParentId = cleanOverId
          newIndex = overNode?.children?.length || 0
          console.log('[DragEnd] Moving into container:', { newParentId, newIndex })
        } else {
          // Drop as sibling - determine if before or after based on pointer position
          const parentInfo = findNodeParent(cleanOverId, nodes)
          if (parentInfo) {
            newParentId = parentInfo.parent?.id || null

            // Figure out if we should insert before or after the target
            // by checking the pointer position relative to the target element
            const targetElement = document.querySelector(`[data-node-id="${cleanOverId}"]`)
            if (targetElement) {
              const rect = targetElement.getBoundingClientRect()
              const activatorEvent = event.activatorEvent as PointerEvent
              const pointerY = activatorEvent.clientY + (event.delta?.y || 0)
              const targetMiddle = rect.top + rect.height / 2

              // If pointer is above middle, insert before; otherwise insert after
              if (pointerY < targetMiddle) {
                newIndex = parentInfo.index // Insert BEFORE (same index pushes target down)
                console.log('[DragEnd] Moving BEFORE target:', { newParentId, newIndex, pointerY, targetMiddle })
              } else {
                newIndex = parentInfo.index + 1 // Insert AFTER
                console.log('[DragEnd] Moving AFTER target:', { newParentId, newIndex, pointerY, targetMiddle })
              }
            } else {
              // Fallback: insert after
              newIndex = parentInfo.index + 1
              console.log('[DragEnd] Moving as sibling (fallback):', { newParentId, newIndex })
            }
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

  // Snippet handlers
  function handleSaveAsSnippet() {
    if (!contextMenu) return
    const node = findNode(contextMenu.nodeId, nodes)
    if (!node) return

    // Set the content to save (wrap single node in array)
    setSnippetContent([node])
    setSnippetToReplaceNodeId(contextMenu.nodeId)
    setShowSaveSnippetDialog(true)
  }

  // Insert a linked snippet reference
  function handleInsertSnippet(snippetId: string, snippetName: string) {
    // Create a SnippetRef node that references the snippet
    const refNode: LayoutNode = {
      id: generateNodeId(),
      type: "SnippetRef",
      snippetId: snippetId,
      props: {},
    }
    addNode(refNode)
    toast.success(`Linked snippet "${snippetName}" added`)
  }

  // Unlink a snippet - convert to independent copy
  function handleUnlinkSnippet(nodeId: string, snippetContent: LayoutNode[]) {
    // Remove the SnippetRef node
    removeNode(nodeId)

    // Add the actual content as independent nodes with new IDs
    function cloneWithNewIds(nodes: LayoutNode[]): LayoutNode[] {
      return nodes.map(node => ({
        ...node,
        id: generateNodeId(),
        children: node.children ? cloneWithNewIds(node.children) : undefined,
      }))
    }

    const clonedContent = cloneWithNewIds(snippetContent)
    clonedContent.forEach(node => addNode(node))

    toast.success("Snippet unlinked - now an independent copy")
  }

  function handleSnippetSaved(snippetId: string, snippetName: string) {
    // Trigger snippets refresh to load the new snippet into context
    window.dispatchEvent(new CustomEvent('snippets-refresh'))

    // Small delay to ensure snippets are loaded before replacing
    setTimeout(() => {
      if (snippetToReplaceNodeId) {
        // Find position of original node before removing it
        const position = findNodeParent(snippetToReplaceNodeId, nodes)

        if (position) {
          // Create SnippetRef node
          const refNode: LayoutNode = {
            id: generateNodeId(),
            type: "SnippetRef",
            snippetId: snippetId,
            props: {},
          }

          if (position.parent) {
            // Insert as child of parent at same index
            const newChildren = [...(position.parent.children || [])]
            // Remove original node
            newChildren.splice(position.index, 1)
            // Insert SnippetRef at same position
            newChildren.splice(position.index, 0, refNode)
            updateNode(position.parent.id, { children: newChildren })
          } else {
            // Insert at root level at same index
            const newNodes = [...nodes]
            // Remove original node
            newNodes.splice(position.index, 1)
            // Insert SnippetRef at same position
            newNodes.splice(position.index, 0, refNode)
            useBuilderStore.setState({ nodes: newNodes })
          }

          toast.success(`Component replaced with linked snippet "${snippetName}"`)
        } else {
          // Fallback: just remove the original and add snippet at the end
          removeNode(snippetToReplaceNodeId)
          const refNode: LayoutNode = {
            id: generateNodeId(),
            type: "SnippetRef",
            snippetId: snippetId,
            props: {},
          }
          addNode(refNode)
          toast.success(`Linked snippet "${snippetName}" created`)
        }
      }

      // Reset state
      setSnippetContent([])
      setSnippetToReplaceNodeId(null)
    }, 300) // Wait for snippets to refresh
  }

  // ----------------- Loading Skeleton -----------------
  if (loading || componentsLoading) {
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
    <SnippetsProvider siteId={tenantId}>
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
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
                <div>
                  <Input size={pageName.length || 8} maxLength={30} onChange={(e) => setPageName(e.target.value)} value={pageName || ""} placeholder="Untitled" className="h-9  bg-transparent border-none font-semibold text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-2" />
                </div>
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
                onUpdateSnippetContent={handleUpdateSnippetContent}
                onDeleteNode={handleDeleteNode}
                onInsertSnippet={handleInsertSnippet}
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
                    onDuplicate={handleDuplicateNode}
                    onDelete={(id) => {
                      removeNode(id)
                      selectNode(null)
                    }}
                    validComponentNames={validComponentNames}
                    activeId={activeDrag ? (activeDrag.type === 'existing' ? (activeDrag.item as LayoutNode).id : 'new-item') : null}
                    overId={dragOverId}
                    onAddAtIndex={(index) => {
                      // Open sidebar or show component picker at specific index
                      // For now, we'll toggle the sidebar
                      setShowSidebar(true)
                    }}
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
              onSaveAsSnippet={handleSaveAsSnippet}
              isSnippetRef={findNode(contextMenu.nodeId, nodes)?.type === "SnippetRef"}
              onUnlinkSnippet={() => {
                const node = findNode(contextMenu.nodeId, nodes)
                if (node?.type === "SnippetRef" && node.snippetId) {
                  // Get the snippet content from context
                  const { getSnippet } = require('./components/editor/snippets-context')
                  // We need to use the context, so let's get it directly from the provider
                  // Find snippet in the snippets context
                  const snippetContent = findNode(contextMenu.nodeId, nodes)

                  // For now, we'll need to fetch the snippet content
                  fetch(`/api/v1/${tenantId}/snippets/${node.snippetId}`)
                    .then(res => res.json())
                    .then(snippet => {
                      if (snippet?.content) {
                        handleUnlinkSnippet(contextMenu.nodeId, snippet.content)
                      } else {
                        toast.error("Failed to unlink snippet")
                      }
                    })
                    .catch(() => {
                      toast.error("Failed to unlink snippet")
                    })
                }
              }}
              onEditSnippet={() => {
                const node = findNode(contextMenu.nodeId, nodes)
                if (node?.type === "SnippetRef" && node.snippetId) {
                  // Navigate to full snippet editor
                  window.open(`/dashboard/${tenantId}/projects/website/snippets/${node.snippetId}/edit`, '_blank')
                }
              }}
            />
          )}

          {/* Save Snippet Dialog */}
          <SaveSnippetDialog
            open={showSaveSnippetDialog}
            onOpenChange={setShowSaveSnippetDialog}
            siteId={tenantId}
            content={snippetContent}
            onSaved={handleSnippetSaved}
          />

          {/* Edit Snippet Dialog */}
          {editSnippetId && (
            <EditSnippetDialog
              open={showEditSnippetDialog}
              onOpenChange={setShowEditSnippetDialog}
              snippetId={editSnippetId}
              siteId={tenantId}
              onSaved={() => {
                setShowEditSnippetDialog(false)
                setEditSnippetId(null)
              }}
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

          <DragOverlay
            modifiers={[snapCenterToCursor]}
            dropAnimation={{
              duration: 200,
              easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {activeDrag ? (
              <div className="flex flex-col items-center justify-center p-3 h-20 w-32 border-2 border-primary rounded-lg bg-card shadow-xl cursor-grabbing transition-transform">
                <Box className="h-5 w-5 mb-1.5 text-primary" />
                <span className="text-xs text-center font-medium leading-tight">
                  {activeDrag.type === 'new'
                    ? (activeDrag.item as ComponentDefinition).name
                    : (activeDrag.item as LayoutNode).type}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </DndContext>
    </SnippetsProvider>
  )
}
