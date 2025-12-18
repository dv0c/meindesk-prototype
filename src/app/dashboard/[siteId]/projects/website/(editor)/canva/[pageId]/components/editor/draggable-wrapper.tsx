"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { GripVertical, Copy, Trash2 } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"

interface DraggableWrapperProps {
  id: string
  children: React.ReactNode
  isSelected?: boolean
  onSelect?: (id: string) => void
  onContextMenu?: (e: React.MouseEvent, id: string) => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
  data?: Record<string, any>
  isContainer?: boolean
}

export function DraggableWrapper({
  id,
  children,
  isSelected,
  onSelect,
  onContextMenu,
  onDuplicate,
  onDelete,
  data,
  isContainer = false,
}: DraggableWrapperProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { ...data, isContainer },
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `${id}-drop`,
    data: {
      type: "container-drop",
      parentId: id,
      isContainer: true,
    },
    disabled: !isContainer,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSelect) onSelect(id)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onContextMenu) {
      onContextMenu(e, id)
    }
  }

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node)
    if (isContainer) {
      setDropRef(node)
    }
  }

  return (
    <div
      ref={setRefs}
      style={style}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={cn(
        "draggable-node relative group transition-all duration-200",
        isContainer && isOver && "ring-2 ring-primary ring-offset-1 bg-primary/5",
        isContainer && !isOver && "hover:ring-2 hover:ring-blue-500/50",
        isSelected ? "ring-2 ring-primary ring-offset-2 z-10" : "hover:ring-2 hover:ring-blue-500/60",
        isDragging ? "opacity-50" : "opacity-100",
      )}
    >
      {/* Component Controls - Visible on hover/select */}
      <div
        className={cn(
          "absolute -top-8 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm border border-border shadow-lg px-2 py-1 rounded-lg flex items-center gap-1 transition-opacity z-50",
          isSelected || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        {/* Drag Handle */}
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        {/* Duplicate Button */}
        {onDuplicate && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate(id)
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-blue-500/10 hover:text-blue-600 text-muted-foreground transition-colors"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(id)
            }}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {isContainer && (
        <div
          className={cn(
            "absolute top-1 right-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium transition-opacity z-40",
            isSelected || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          Container
        </div>
      )}

      {children}
    </div>
  )
}
