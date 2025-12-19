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
  isOverlay?: boolean // True when rendered inside DragOverlay
  showInsertionBefore?: boolean // Show insertion line before this element
  showInsertionAfter?: boolean // Show insertion line after this element
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
  isOverlay = false,
  showInsertionBefore = false,
  showInsertionAfter = false,
}: DraggableWrapperProps) {
  // Sortable for reordering within canvas
  const { attributes, listeners, setNodeRef: setSortableRef, transform, transition, isDragging, over } = useSortable({
    id,
    data: { ...data, isContainer },
    disabled: isOverlay, // Disable if this is an overlay
  })

  // Separate droppable to accept items from sidebar
  const dropId = `droppable-${id}`
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dropId,
    data: {
      type: "component-drop",
      nodeId: id,
      parentId: id,
      isContainer,
      ...data,
    },
    disabled: isOverlay,
  })

  // Smooth CSS transform with spring-like animation
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms cubic-bezier(0.25, 1, 0.5, 1)",
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
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

  // Combine refs
  const setRefs = (node: HTMLDivElement | null) => {
    if (!isOverlay) {
      setSortableRef(node)
      setDropRef(node)
    }
  }

  return (
    <div
      ref={setRefs}
      style={isOverlay ? undefined : style}
      data-node-id={id}
      data-drop-id={dropId}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      {...attributes}
      {...listeners}
      className={cn(
        "draggable-node relative group cursor-grab active:cursor-grabbing",
        // Smooth transition for all visual changes
        "transition-all duration-200 ease-out",
        // Drop target feedback
        isOver && "ring-2 ring-primary ring-offset-2 bg-primary/5 scale-[1.01]",
        // Hover state - subtle blue outline (Pagy style)
        !isOver && !isSelected && !isDragging && "hover:ring-2 hover:ring-blue-400/50 hover:ring-offset-1",
        // Selected state
        isSelected && "ring-2 ring-primary ring-offset-2 z-10",
        // Dragging state
        isDragging && "opacity-50 scale-[0.98]",
        // Container indicator
        isContainer && !isOver && !isSelected && "hover:bg-blue-50/30 dark:hover:bg-blue-950/20",
      )}
    >
      {/* Insertion indicator - before */}
      {showInsertionBefore && (
        <div className="absolute -top-1 left-0 right-0 z-50 pointer-events-none">
          <div className="relative h-1 mx-4">
            <div className="absolute inset-0 bg-primary rounded-full animate-pulse" />
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg" />
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg" />
          </div>
        </div>
      )}

      {/* Floating toolbar - appears on hover/select */}
      <div
        className={cn(
          "absolute -top-10 left-1/2 -translate-x-1/2",
          "bg-background/95 backdrop-blur-md border border-border/60 shadow-xl",
          "px-1.5 py-1 rounded-lg flex items-center gap-0.5",
          "transition-all duration-200 ease-out z-50",
          isSelected || isDragging
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0",
        )}
      >
        {/* Drag Handle - 6 dot pattern (Pagy style) */}
        <div
          className={cn(
            "flex items-center justify-center p-1.5 rounded-md cursor-grab active:cursor-grabbing",
            "hover:bg-muted transition-colors",
          )}
          {...attributes}
          {...listeners}
        >
          <div className="grid grid-cols-2 gap-0.5">
            <div className="w-1 h-1 rounded-full bg-muted-foreground/60" />
            <div className="w-1 h-1 rounded-full bg-muted-foreground/60" />
            <div className="w-1 h-1 rounded-full bg-muted-foreground/60" />
            <div className="w-1 h-1 rounded-full bg-muted-foreground/60" />
            <div className="w-1 h-1 rounded-full bg-muted-foreground/60" />
            <div className="w-1 h-1 rounded-full bg-muted-foreground/60" />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border/50" />

        {/* Duplicate Button */}
        {onDuplicate && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate(id)
            }}
            className={cn(
              "flex items-center justify-center p-1.5 rounded-md",
              "hover:bg-blue-500/10 hover:text-blue-600 text-muted-foreground",
              "transition-colors"
            )}
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
            className={cn(
              "flex items-center justify-center p-1.5 rounded-md",
              "hover:bg-destructive/10 hover:text-destructive text-muted-foreground",
              "transition-colors"
            )}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Container badge */}
      {isContainer && (
        <div
          className={cn(
            "absolute top-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-medium z-40",
            "bg-blue-500/10 text-blue-600 dark:text-blue-400",
            "transition-opacity duration-200",
            isSelected || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          Container
        </div>
      )}

      {/* Insertion indicator - after */}
      {showInsertionAfter && (
        <div className="absolute -bottom-1 left-0 right-0 z-50 pointer-events-none">
          <div className="relative h-1 mx-4">
            <div className="absolute inset-0 bg-primary rounded-full animate-pulse" />
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg" />
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg" />
          </div>
        </div>
      )}

      {children}
    </div>
  )
}

