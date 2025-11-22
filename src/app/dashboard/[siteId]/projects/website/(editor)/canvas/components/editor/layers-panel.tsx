"use client"

import type React from "react"

import { useState } from "react"
import type { LayoutNode } from "@/lib/types"
import { ChevronRight, ChevronDown, X, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface LayersPanelProps {
  nodes: LayoutNode[]
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
  onMoveNode: (nodeId: string, newParentId: string | null, index: number) => void
  onClose: () => void
}

function SortableLayerItem({
  node,
  level = 0,
  parentId = null,
  selectedNodeId,
  onSelectNode,
  onMoveNode,
}: {
  node: LayoutNode
  level?: number
  parentId?: string | null
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
  onMoveNode: (nodeId: string, newParentId: string | null, index: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    data: { node, parentId },
  })

  const childSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleChildDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeNode = node.children?.find((child) => child.id === active.id)
    if (!activeNode) return

    const oldIndex = node.children?.findIndex((child) => child.id === active.id) ?? -1
    const newIndex = node.children?.findIndex((child) => child.id === over.id) ?? -1

    if (oldIndex !== -1 && newIndex !== -1) {
      onMoveNode(active.id, node.id, newIndex)
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-2 hover:bg-accent cursor-pointer text-sm",
          selectedNodeId === node.id && "bg-accent",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectNode(node.id)}
      >
        {hasChildren ? (
          <button
            className="p-0 h-4 w-4 flex items-center justify-center"
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
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        <span className="flex-1 truncate">{node.type}</span>
      </div>

      {hasChildren && isExpanded && (
        <DndContext sensors={childSensors} collisionDetection={closestCenter} onDragEnd={handleChildDragEnd}>
          <SortableContext items={node.children!.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div>
              {node.children!.map((child) => (
                <SortableLayerItem
                  key={child.id}
                  node={child}
                  level={level + 1}
                  parentId={node.id}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onMoveNode={onMoveNode}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

export function LayersPanel({ nodes, selectedNodeId, onSelectNode, onMoveNode, onClose }: LayersPanelProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 280, y: 80 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = nodes.findIndex((node) => node.id === active.id)
    const newIndex = nodes.findIndex((node) => node.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      onMoveNode(active.id, null, newIndex)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const cleanup = () => {
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("mouseup", handleMouseUp)
  }

  useState(() => {
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return cleanup
  })

  return (
    <div
      className="fixed z-[100] bg-background border rounded-lg shadow-2xl w-64 max-h-[500px] flex flex-col"
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="flex items-center justify-between p-3 border-b cursor-move bg-muted/30"
        onMouseDown={handleMouseDown}
      >
        <h3 className="font-semibold text-sm">Layers</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {nodes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No layers yet</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
              {nodes.map((node) => (
                <SortableLayerItem
                  key={node.id}
                  node={node}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onMoveNode={onMoveNode}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
