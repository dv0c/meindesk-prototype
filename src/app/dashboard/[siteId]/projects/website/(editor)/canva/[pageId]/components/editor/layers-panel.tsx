"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import type { LayoutNode, ComponentDefinition } from "@/lib/types"
import {
  ChevronRight,
  ChevronDown,
  X,
  GripVertical,
  Plus,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type DragCancelEvent,
  type DropAnimation
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { getAvailableComponents } from "@/lib/component-registry"
import { useSnippets } from "./snippets-context"

// --- Types ---

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

type FlattenedItem = {
  id: string
  parentId: string | null
  depth: number
  index: number
  node: LayoutNode
}

interface DragState {
  activeId: string | null
  overId: string | null
  offsetLeft: number
  currentPosition: {
    parentId: string | null
    index: number
    depth: number
  } | null
}

const INDENTATION_WIDTH = 20

// --- Utilities ---

function flattenTree(
  nodes: LayoutNode[],
  parentId: string | null = null,
  depth = 0,
  openState: Record<string, boolean>
): FlattenedItem[] {
  const result: FlattenedItem[] = []

  nodes.forEach((node, index) => {
    result.push({
      id: node.id,
      parentId,
      depth,
      index,
      node
    })

    if (node.children && node.children.length > 0 && openState[node.id]) {
      result.push(...flattenTree(node.children, node.id, depth + 1, openState))
    }
  })

  return result
}

function findItemDeep(nodes: LayoutNode[], id: string): LayoutNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findItemDeep(node.children, id)
      if (found) return found
    }
  }
  return null
}

// --- Components ---

// Helper component to show proper name for layers
function LayerNodeName({ node }: { node: LayoutNode }) {
  const { getSnippet } = useSnippets()

  if (node.type === "SnippetRef" && node.snippetId) {
    const snippet = getSnippet(node.snippetId)
    if (snippet) {
      return (
        <span className="flex-1 truncate font-medium text-sm select-none flex items-center gap-1">
          <span className="text-purple-600 dark:text-purple-400">🔗</span>
          {snippet.name}
        </span>
      )
    }
    return (
      <span className="flex-1 truncate font-medium text-sm select-none text-orange-500">
        📦 Missing Snippet
      </span>
    )
  }

  return <span className="flex-1 truncate font-medium text-sm select-none">{node.type}</span>
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
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-primary/10 rounded-full"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(true)
        }}
        title="Add child component"
      >
        <Plus className="h-3.5 w-3.5 text-primary" />
      </button>
    )
  }

  return (
    <div className="absolute right-full top-0 mr-2 z-60 min-w-[220px]" onClick={(e) => e.stopPropagation()}>
      <div className="bg-popover/95 backdrop-blur-xl border rounded-xl shadow-2xl max-h-[320px] overflow-hidden">
        <div className="p-3 border-b sticky top-0 bg-popover/95 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Add Component</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="py-1.5 px-1.5 overflow-y-auto max-h-[260px]">
          {components.map((comp) => (
            <button
              key={comp.name}
              className="w-full px-3 py-2 text-xs hover:bg-accent/50 rounded-lg flex flex-col items-start text-left transition-colors group"
              onClick={(e) => {
                e.stopPropagation()
                onAddChild(comp.name)
                setIsOpen(false)
              }}
            >
              <span className="font-semibold group-hover:text-primary transition-colors">{comp.name}</span>
              <span className="text-[10px] text-muted-foreground">{comp.category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface LayerItemProps {
  node: LayoutNode
  depth: number
  isExpanded: boolean
  hasChildren: boolean
  onToggleExpand: () => void
  onSelect: () => void
  isSelected: boolean
  isDragging: boolean
  dragOverlay?: boolean
  style?: React.CSSProperties
  handleProps?: any
  // Context menu & actions
  onDuplicate?: () => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onIndent?: () => void
  onOutdent?: () => void
  onAddChild?: (type: string) => void
}

const LayerItem = React.forwardRef<HTMLDivElement, LayerItemProps>(({
  node,
  depth,
  isExpanded,
  hasChildren,
  onToggleExpand,
  onSelect,
  isSelected,
  isDragging,
  dragOverlay,
  style,
  handleProps,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onIndent,
  onOutdent,
  onAddChild
}, ref) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const x = e.clientX
    const y = e.clientY
    setContextMenu({ x, y })
    onSelect()
  }

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener("click", close)
    return () => window.removeEventListener("click", close)
  }, [contextMenu])

  return (
    <div
      ref={ref}
      style={{
        ...style,
        paddingLeft: `${depth * INDENTATION_WIDTH + 10}px`
      }}
      className={cn(
        "group flex items-center gap-2 py-2 px-2.5 cursor-pointer text-sm relative rounded-lg transition-all duration-200 box-border",
        isSelected && "bg-primary/10 border border-primary/20 shadow-sm",
        isDragging && "opacity-50",
        !isDragging && !isSelected && "hover:bg-accent/50 hover:scale-[1.01]"
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onContextMenu={handleContextMenu}
      data-layer-id={node.id}
    >
      {/* Expand/Collapse */}
      <button
        className={cn(
          "p-0.5 h-5 w-5 flex items-center justify-center rounded-md transition-colors",
          hasChildren ? "hover:bg-accent" : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => {
          e.stopPropagation()
          onToggleExpand()
        }}
      >
        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>

      {/* Drag Handle */}
      {/* If it's an overlay, we don't need handle props because the whole thing is moving */}
      <div
        {...handleProps}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-primary/10 rounded-md transition-all duration-200 group/drag"
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground group-hover/drag:text-primary transition-colors" />
      </div>

      {/* Content */}
      <LayerNodeName node={node} />

      {node.children && node.children.length > 0 && (
        <span className="text-[10px] font-semibold text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-full ml-auto">
          {node.children.length}
        </span>
      )}

      {/* Directional Actions (Hover) */}
      {!dragOverlay && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity px-1">
          {onOutdent && (
            <button onClick={(e) => { e.stopPropagation(); onOutdent() }} className="p-1 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary" title="Outdent">
              <ArrowLeft className="h-3 w-3" />
            </button>
          )}
          {onIndent && (
            <button onClick={(e) => { e.stopPropagation(); onIndent() }} className="p-1 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary" title="Indent">
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
          {onMoveUp && (
            <button onClick={(e) => { e.stopPropagation(); onMoveUp() }} className="p-1 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary" title="Move Up">
              <ArrowUp className="h-3 w-3" />
            </button>
          )}
          {onMoveDown && (
            <button onClick={(e) => { e.stopPropagation(); onMoveDown() }} className="p-1 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary" title="Move Down">
              <ArrowDown className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Add Child */}
      {!dragOverlay && (
        <div className="relative">
          {onAddChild && <AddChildDropdown parentId={node.id} onAddChild={onAddChild} />}
        </div>
      )}

      {/* Context Menu Portal */}
      {contextMenu && createPortal(
        <div
          className="fixed z-[9999] context-menu-wrapper animate-in fade-in-0 zoom-in-95 duration-200"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-popover/95 backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden min-w-[200px] p-1.5">
            <button className="w-full px-3 py-2.5 text-sm font-medium hover:bg-accent/50 rounded-lg flex items-center gap-3 text-left transition-colors group"
              onClick={() => { setContextMenu(null); onDuplicate?.() }}>
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20"><Copy className="h-4 w-4 text-blue-600" /></div>
              <span>Duplicate</span>
            </button>
            <div className="border-t border-border/50 my-1.5" />
            <button className="w-full px-3 py-2.5 text-sm font-medium hover:bg-destructive/10 rounded-lg flex items-center gap-3 text-left transition-colors group"
              onClick={() => { setContextMenu(null); onDelete?.() }}>
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20"><Trash2 className="h-4 w-4 text-destructive" /></div>
              <span className="text-destructive">Delete</span>
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
})
LayerItem.displayName = "LayerItem"

function SortableLayerItem({
  item,
  selectedNodeId,
  onSelectNode,
  isOpen,
  onToggleExpand,
  ...actions
}: {
  item: FlattenedItem
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
  isOpen: boolean
  onToggleExpand: () => void
} & Omit<LayerItemProps, "node" | "depth" | "isExpanded" | "hasChildren" | "onSelect" | "isSelected" | "isDragging" | "onToggleExpand">) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, data: { item } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <LayerItem
      ref={setNodeRef}
      style={style}
      node={item.node}
      depth={item.depth}
      isExpanded={isOpen}
      hasChildren={!!item.node.children && item.node.children.length > 0}
      onToggleExpand={onToggleExpand}
      onSelect={() => onSelectNode(item.id)}
      isSelected={selectedNodeId === item.id}
      isDragging={isDragging}
      handleProps={{ ...attributes, ...listeners }}
      {...actions}
    />
  )
}


import type { Modifier } from "@dnd-kit/core"


const snapToIndentGrid: Modifier = ({ transform }) => {
  return {
    ...transform,
    x: Math.round(transform.x / INDENTATION_WIDTH) * INDENTATION_WIDTH,
  }
}

function DragPreviewWrapper({
  activeId,
  nodes,
  flattenedItems,
  offsetLeft
}: {
  activeId: string
  nodes: LayoutNode[]
  flattenedItems: FlattenedItem[]
  offsetLeft: number
}) {
  // Direct lookup to ensure freshness
  const node = findItemDeep(nodes, activeId)
  const activeItem = flattenedItems.find(i => i.id === activeId)

  if (!node || !activeItem) return null

  // Use static depth. The visual snapping is handled by the DragOverlay modifier.
  const depth = activeItem.depth

  return (
    <div className="w-[304px]">
      <LayerItem
        node={node}
        depth={depth}
        isExpanded={true}
        hasChildren={!!node.children?.length}
        onToggleExpand={() => { }}
        onSelect={() => { }}
        isSelected={false}
        isDragging={true}
        dragOverlay
        style={{ opacity: 0.9 }}
      />
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
  // --- Panel Floating State ---
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 80 })
  const [isPanelDragging, setIsPanelDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // --- Tree State ---
  const [openState, setOpenState] = useState<Record<string, boolean>>(() => {
    // Open all by default for now
    const initial: Record<string, boolean> = {}
    const traverse = (n: LayoutNode[]) => {
      n.forEach(no => {
        initial[no.id] = true
        if (no.children) traverse(no.children)
      })
    }
    traverse(nodes)
    return initial
  })

  // Start with open all, but sync with IDs
  useEffect(() => {
    setOpenState(prev => {
      const next = { ...prev }
      const traverse = (n: LayoutNode[]) => {
        n.forEach(no => {
          if (next[no.id] === undefined) next[no.id] = true
          if (no.children) traverse(no.children)
        })
      }
      traverse(nodes)
      return next
    })
  }, [nodes.length]) // Simple dependency for new nodes

  const flattenedItems = useMemo(() => flattenTree(nodes, null, 0, openState), [nodes, openState])
  const sortedIds = useMemo(() => flattenedItems.map(i => i.id), [flattenedItems])

  // --- Search / Helpers ---
  const findItem = (id: string) => flattenedItems.find(i => i.id === id)

  // --- Drag State ---
  const [dragState, setDragState] = useState<DragState>({
    activeId: null,
    overId: null,
    offsetLeft: 0,
    currentPosition: null
  })

  // --- Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // --- Logic ---

  const handleDragStart = ({ active }: DragStartEvent) => {
    setDragState({
      activeId: active.id as string,
      overId: active.id as string,
      offsetLeft: 0,
      currentPosition: null
    })
    document.body.style.cursor = 'grabbing'
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    // We mainly rely on projection logic in drag moves, but storing overId is useful
    setDragState(prev => ({ ...prev, overId: over?.id as string || null }))
  }

  const handleDragCancel = () => {
    setDragState({ activeId: null, overId: null, offsetLeft: 0, currentPosition: null })
    document.body.style.cursor = ''
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event
    document.body.style.cursor = ''

    setDragState({ activeId: null, overId: null, offsetLeft: 0, currentPosition: null })

    if (!over || !active) return

    const activeItem = findItem(active.id as string)
    if (!activeItem) return

    // Calculate projection
    // This is a simplified projection
    // 1. Where did we drop it in the list?
    const overItem = findItem(over.id as string)
    if (!overItem) return // Should not happen if over exists

    const activeIndex = flattenedItems.findIndex(i => i.id === active.id)
    const overIndex = flattenedItems.findIndex(i => i.id === over.id)

    let newParentId = overItem.parentId
    let newIndex = overItem.index // Index within the parent's children array

    // Calculate depth change
    // If we moved horizontally
    const projectedDepth = activeItem.depth + Math.round(dragState.offsetLeft / INDENTATION_WIDTH)

    // We are essentially moving 'active' to be 'over' position
    // But we need to account for nesting.

    // Simplification:
    // If overIndex > activeIndex (moving down), we are placing AFTER overItem
    // If overIndex < activeIndex (moving up), we are placing BEFORE overItem

    // Determine target based on visual sorting
    // We'll trust the visual order -> find the preceding item
    // But DnD kit 'arrayMove' logic is tricky with tree.

    // Let's use a simpler heuristic for this refactor:
    // 1. Indent: IF dropped on top of another item with shift right -> make child
    // 2. Reorder: IF dropped between items -> move

    // Actually, improved projection:
    // We use the `over` item as the anchor.
    // If we are below `over`, we want to be `over`'s next sibling OR `over`'s child.

    // Let's rely on the relative vertical movement to simplify.
    // However, since we have flattened items, `over` is exactly where the mouse is vertically.

    const clone = [...flattenedItems]

    // Visual index after move (in flattened list)
    // Note: This matches the arrayMove result
    const newVisualIndex = overIndex

    // Now, determine parent and depth based on neighbors at newVisualIndex and indentation
    const prevItem = newVisualIndex > 0 ? flattenedItems[newVisualIndex - 1] : null

    // Resolve intended depth constrained by max depth (prevItem depth + 1) and min depth (nextItem depth usually)
    const maxDepth = prevItem ? prevItem.depth + 1 : 0
    // minDepth could be 0
    let depth = projectedDepth
    if (depth > maxDepth) depth = maxDepth
    if (depth < 0) depth = 0

    // Find parent based on depth
    // Go backwards from newVisualIndex to find the first item with depth < targetDepth
    // That item is the parent
    let parentId: string | null = null
    let foundParent = false

    // If depth is 0, parent is null
    if (depth === 0) {
      parentId = null
    } else {
      // search backwards from the insertion point
      // insertion point is `overIndex`
      // But we need to be careful: if we are moving down, the items shift.
      // Let's simulate the list with the item moved
      const simulatedList = arrayMove(flattenedItems, activeIndex, overIndex)

      // Now find parent for the item at overIndex (which is now our active item)
      for (let i = overIndex - 1; i >= 0; i--) {
        if (simulatedList[i].depth < depth) {
          parentId = simulatedList[i].id
          foundParent = true
          break
        }
      }
      if (!foundParent) parentId = null // Should technically be error or root if depth > 0 but no parent found, fallback to root
    }

    // Calculate new index in parent
    const parentNode = parentId ? findItemDeep(nodes, parentId) : { id: null, children: nodes }
    // We need to know where we are in this parent's children.
    // We can count how many siblings are before us in the simulated list
    // that share the same parentId

    // This is getting complex to calculate 'index' precisely from just flattened list.
    // Easier approach:
    // Use `onMoveNode(id, parentId, index)`
    // We found parentId.
    // Now index:
    // Iterate the simulated flattened list. Count items with same parentId up to our item.

    const simulatedList = arrayMove(flattenedItems, activeIndex, overIndex)
    let siblingIndex = 0
    for (let i = 0; i < simulatedList.length; i++) {
      const item = simulatedList[i]
      if (item.id === active.id) break // Found us
      // Need to identify if this item is a sibling
      // But we can't easily know the parent of other items in flattened list without re-running traversal or storing it well.
      // `item.parentId` in `flattenedItems` is outdated for the moved item, but correct for others
      // UNLESS the move changed relationships of others (it didn't, only us)
      if (item.parentId === parentId) {
        siblingIndex++
      }
    }

    // Execute move
    if (active.id !== parentId) { // Prevent self-parenting
      onMoveNode(active.id as string, parentId, siblingIndex)
    }
  }

  // --- Indentation Logic ---
  // We need to track the horizontal drag delta to update indentation preview
  useEffect(() => {
    if (!dragState.activeId) return

    const handleMouseMove = (e: MouseEvent) => {
      // We can't easily get delta from DndContext outside of events, 
      // so we might need `onDragMove` or just let `DragOverlay` handle it visually
      // But we want to snap the 'depth' in the preview.
    }
    // DndKit provides delta in `onDragMove`
  }, [dragState.activeId])

  const handleDragMove = (event: any) => {
    const { delta } = event
    setDragState(prev => ({ ...prev, offsetLeft: delta.x }))
  }


  // --- Helper Actions ---
  const handleIndent = (id: string) => {
    const item = findItem(id)
    if (!item) return
    const indexInFlat = flattenedItems.findIndex(i => i.id === id)
    if (indexInFlat <= 0) return
    const prev = flattenedItems[indexInFlat - 1]
    if (prev.depth >= item.depth) {
      // Indent to become child of prev
      onMoveNode(id, prev.id, prev.node.children?.length || 0)
    }
  }

  const handleOutdent = (id: string) => {
    const item = findItem(id)
    if (!item || !item.parentId) return

    // Move to parent's parent
    const parent = findItemDeep(nodes, item.parentId)
    // We need parent's parent. 
    // We can find parent in flat list to get its parentId
    const parentFlat = findItem(item.parentId)
    const newParentId = parentFlat ? parentFlat.parentId : null

    // Index: after current parent
    // count siblings of parent before it + 1
    // OR just use `onMoveNode` logic which might handle "insert after X"
    // Let's assume we append to the new parent for simplicity or find index
    // Finding index: all siblings of `parent` before `parent` + 1

    let newIndex = 0
    if (newParentId === null) {
      // Root
      // Find index of `parent` in root
      newIndex = nodes.findIndex(n => n.id === item.parentId) + 1
    } else {
      const grandParent = findItemDeep(nodes, newParentId)
      if (grandParent && grandParent.children) {
        newIndex = grandParent.children.findIndex(n => n.id === item.parentId) + 1
      }
    }

    onMoveNode(id, newParentId, newIndex)
  }

  // --- Window Dragging (Panel) ---
  const handlePanelMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking header
    if ((e.target as HTMLElement).closest('button')) return
    setIsPanelDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  useEffect(() => {
    if (!isPanelDragging) return
    const move = (e: MouseEvent) => setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    const up = () => setIsPanelDragging(false)
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseup", up)
    }
  }, [isPanelDragging, dragStart])

  // --- Render ---

  const moveNodeUp = (id: string) => {
    onMoveNodeUp?.(id)
  }
  const moveNodeDown = (id: string) => {
    onMoveNodeDown?.(id)
  }


  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

  return (
    <div
      className="fixed z-100 bg-background/95 backdrop-blur-xl border rounded-2xl shadow-2xl w-80 max-h-[640px] flex flex-col overflow-hidden"
      style={{ left: position.x, top: position.y }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b cursor-move bg-linear-to-r from-background to-muted/30 select-none"
        onMouseDown={handlePanelMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Layers</h3>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full font-medium">
            {nodes.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-destructive/10" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <GripVertical className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No layers yet</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-0.5">
                {flattenedItems.map((item) => (
                  <SortableLayerItem
                    key={item.id}
                    item={item}
                    selectedNodeId={selectedNodeId}
                    onSelectNode={onSelectNode}
                    isOpen={!!openState[item.id]}
                    onToggleExpand={() => setOpenState(p => ({ ...p, [item.id]: !p[item.id] }))}
                    onDuplicate={() => onDuplicateNode?.(item.id)}
                    onDelete={() => onDeleteNode?.(item.id)}
                    onMoveUp={() => moveNodeUp(item.id)}
                    onMoveDown={() => moveNodeDown(item.id)}
                    onIndent={() => handleIndent(item.id)}
                    onOutdent={() => handleOutdent(item.id)}
                    onAddChild={(type) => onAddChildToNode?.(item.id, type)}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={dropAnimation} modifiers={[snapToIndentGrid]}>
              {dragState.activeId ? (
                <DragPreviewWrapper
                  activeId={dragState.activeId}
                  nodes={nodes}
                  flattenedItems={flattenedItems}
                  offsetLeft={dragState.offsetLeft}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  )
}
