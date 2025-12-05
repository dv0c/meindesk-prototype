"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { LayoutNode, ComponentDefinition } from "@/lib/types"
import { ChevronRight, ChevronDown, X, GripVertical, Plus, Copy, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { getAvailableComponents } from "@/lib/component-registry"

interface LayersPanelProps {
  nodes: LayoutNode[]
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
  onMoveNode: (nodeId: string, newParentId: string | null, index: number) => void
  onClose: () => void
  onDeleteNode?: (id: string) => void
  onDuplicateNode?: (id: string) => void
  onMoveNodeUp?: (id: string) => void
  onMoveNodeDown?: (id: string) => void
  onAddChildToNode?: (parentId: string, componentType: string) => void
}

function AddChildDropdown({ parentId, onAddChild }: { parentId: string; onAddChild: (type: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [components, setComponents] = useState<ComponentDefinition[]>([])

  useEffect(() => {
    getAvailableComponents().then(setComponents)
  }, [])

  if (!isOpen) {
    return (
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-accent rounded"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(true)
        }}
        title="Add child component"
      >
        <Plus className="h-3 w-3 text-muted-foreground" />
      </button>
    )
  }

  return (
    <div className="absolute right-full top-0 mr-1 z-[60] min-w-[200px]" onClick={(e) => e.stopPropagation()}>
      <div className="bg-popover border rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
        <div className="p-2 border-b sticky top-0 bg-popover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Add Component</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="py-1">
          {components.map((comp) => (
            <button
              key={comp.name}
              className="w-full px-3 py-1.5 text-xs hover:bg-accent flex flex-col items-start text-left"
              onClick={(e) => {
                e.stopPropagation()
                console.log("[v0] AddChildDropdown: Adding child", comp.name, "to parent", parentId)
                onAddChild(comp.name)
                setIsOpen(false)
              }}
            >
              <span className="font-medium">{comp.name}</span>
              <span className="text-[10px] text-muted-foreground">{comp.category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SortableLayerItem({
  node,
  level = 0,
  parentId = null,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  onMoveNodeUp,
  onMoveNodeDown,
  onAddChildToNode,
  isOver,
  isDraggingGlobal,
}: {
  node: LayoutNode
  level?: number
  parentId?: string | null
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
  onDeleteNode?: (id: string) => void
  onDuplicateNode?: (id: string) => void
  onMoveNodeUp?: (id: string) => void
  onMoveNodeDown?: (id: string) => void
  onAddChildToNode?: (parentId: string, componentType: string) => void
  isOver?: boolean
  isDraggingGlobal?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const hasChildren = node.children && node.children.length > 0
  const canHaveChildren = node.children !== undefined

  const { attributes, listeners, setNodeRef, transform, transition, isDragging, over } = useSortable({
    id: node.id,
    data: {
      node,
      parentId,
      type: "layer-item",
      isContainer: canHaveChildren,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isDropTarget = isOver || (over?.id === node.id && canHaveChildren && isDraggingGlobal)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    let x = e.clientX
    let y = e.clientY
    const menuWidth = 200
    const menuHeight = 250

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10
    }

    setContextMenu({ x, y })
    onSelectNode(node.id)
  }

  useEffect(() => {
    if (!contextMenu) return

    const handleClick = () => setContextMenu(null)
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null)
    }

    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [contextMenu])

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "group flex items-center gap-1 py-1.5 px-2 hover:bg-accent cursor-pointer text-sm relative rounded-sm transition-all",
          selectedNodeId === node.id && "bg-accent",
          isDropTarget && "ring-2 ring-primary bg-primary/5",
          canHaveChildren && isDraggingGlobal && "ring-1 ring-dashed ring-primary/30",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectNode(node.id)}
        onContextMenu={handleContextMenu}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            className="p-0 h-4 w-4 flex items-center justify-center hover:bg-accent/50 rounded"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>

        {/* Node Type */}
        <span className="flex-1 truncate font-medium">{node.type}</span>

        {canHaveChildren && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {hasChildren ? `${node.children!.length}` : "0"}
          </span>
        )}

        {/* Add Child Button */}
        {canHaveChildren && (
          <div className="relative">
            <AddChildDropdown
              parentId={node.id}
              onAddChild={(type) => {
                console.log("[v0] LayerItem: onAddChild callback triggered for type:", type)
                onAddChildToNode?.(node.id, type)
              }}
            />
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[9999]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="bg-popover border rounded-lg shadow-xl overflow-hidden">
            <div className="py-1 min-w-[200px]">
              <button
                className="w-full px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 text-left"
                onClick={(e) => {
                  e.stopPropagation()
                  console.log("[v0] Context menu: Duplicate clicked for node:", node.id)
                  onDuplicateNode?.(node.id)
                  setContextMenu(null)
                }}
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
              <button
                className="w-full px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 text-left"
                onClick={(e) => {
                  e.stopPropagation()
                  console.log("[v0] Context menu: Move up clicked for node:", node.id)
                  onMoveNodeUp?.(node.id)
                  setContextMenu(null)
                }}
              >
                <ArrowUp className="h-4 w-4" />
                Move Up
              </button>
              <button
                className="w-full px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 text-left"
                onClick={(e) => {
                  e.stopPropagation()
                  console.log("[v0] Context menu: Move down clicked for node:", node.id)
                  onMoveNodeDown?.(node.id)
                  setContextMenu(null)
                }}
              >
                <ArrowDown className="h-4 w-4" />
                Move Down
              </button>
              <div className="border-t my-1" />
              <button
                className="w-full px-3 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2 text-left"
                onClick={(e) => {
                  e.stopPropagation()
                  console.log("[v0] Context menu: Delete clicked for node:", node.id)
                  onDeleteNode?.(node.id)
                  setContextMenu(null)
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <SortableLayerItem
              key={child.id}
              node={child}
              level={level + 1}
              parentId={node.id}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              onDeleteNode={onDeleteNode}
              onDuplicateNode={onDuplicateNode}
              onMoveNodeUp={onMoveNodeUp}
              onMoveNodeDown={onMoveNodeDown}
              onAddChildToNode={onAddChildToNode}
              isDraggingGlobal={isDraggingGlobal}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function LayersPanel({
  nodes,
  selectedNodeId,
  onSelectNode,
  onMoveNode,
  onClose,
  onDeleteNode,
  onDuplicateNode,
  onMoveNodeUp,
  onMoveNodeDown,
  onAddChildToNode,
}: LayersPanelProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 300, y: 80 })
  const [isPanelDragging, setIsPanelDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragStart = (event: any) => {
    console.log("[v0] Drag started:", event.active.id)
    setActiveId(event.active.id)
  }

  const handleDragOver = (event: any) => {
    setOverId(event.over?.id || null)
  }

  const handleDragEnd = (event: any) => {
    console.log("[v0] Drag ended:", event.active.id, "->", event.over?.id)
    const { active, over } = event

    setActiveId(null)
    setOverId(null)

    if (!over || active.id === over.id) {
      console.log("[v0] No valid drop target")
      return
    }

    const activeData = active.data.current
    const overData = over.data.current

    // Find where the dragged item should go
    let newParentId: string | null = null
    let newIndex = 0

    // If dropped on a container, make it a child
    if (overData?.isContainer) {
      console.log("[v0] Dropped on container:", over.id)
      newParentId = over.id as string
      const overNode = findNodeById(nodes, over.id as string)
      newIndex = overNode?.children?.length || 0
    } else {
      // If dropped on a non-container, insert at same level
      console.log("[v0] Dropped on non-container, inserting at same level")
      const overParentInfo = findParentAndIndex(nodes, over.id as string)
      newParentId = overParentInfo.parentId
      newIndex = overParentInfo.index + 1
    }

    console.log("[v0] Moving node to parentId:", newParentId, "index:", newIndex)
    onMoveNode(active.id as string, newParentId, newIndex)
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setOverId(null)
  }

  // Helper to find a node by ID recursively
  const findNodeById = (nodeList: LayoutNode[], id: string): LayoutNode | null => {
    for (const node of nodeList) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  // Helper to find parent and index of a node
  const findParentAndIndex = (
    nodeList: LayoutNode[],
    id: string,
    parentId: string | null = null,
  ): { parentId: string | null; index: number } => {
    for (let i = 0; i < nodeList.length; i++) {
      if (nodeList[i].id === id) {
        return { parentId, index: i }
      }
      if (nodeList[i].children) {
        const result = findParentAndIndex(nodeList[i].children!, id, nodeList[i].id)
        if (result.parentId !== null || result.index !== -1) {
          return result
        }
      }
    }
    return { parentId: null, index: -1 }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanelDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  useEffect(() => {
    if (!isPanelDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }

    const handleMouseUp = () => {
      setIsPanelDragging(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isPanelDragging, dragStart])

  return (
    <div
      className="fixed z-[100] bg-background border rounded-lg shadow-2xl w-72 max-h-[600px] flex flex-col"
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="flex items-center justify-between p-3 border-b cursor-move bg-muted/30 select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Layers</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-2">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
            <p className="text-sm text-muted-foreground">No layers yet</p>
            <p className="text-xs text-muted-foreground mt-1">Drag components from the sidebar</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={getAllNodeIds(nodes)} strategy={verticalListSortingStrategy}>
              {nodes.map((node) => (
                <SortableLayerItem
                  key={node.id}
                  node={node}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onDeleteNode={onDeleteNode}
                  onDuplicateNode={onDuplicateNode}
                  onMoveNodeUp={onMoveNodeUp}
                  onMoveNodeDown={onMoveNodeDown}
                  onAddChildToNode={onAddChildToNode}
                  isOver={overId === node.id}
                  isDraggingGlobal={!!activeId}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

// Helper to get all node IDs for sortable context
function getAllNodeIds(nodes: LayoutNode[]): string[] {
  const ids: string[] = []
  const traverse = (nodeList: LayoutNode[]) => {
    for (const node of nodeList) {
      ids.push(node.id)
      if (node.children) {
        traverse(node.children)
      }
    }
  }
  traverse(nodes)
  return ids
}
