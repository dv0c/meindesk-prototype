"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { GripVertical } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"

interface DraggableWrapperProps {
  id: string
  children: React.ReactNode
  isSelected?: boolean
  onSelect?: (id: string) => void
  onContextMenu?: (e: React.MouseEvent, id: string) => void
  data?: Record<string, any>
  isContainer?: boolean
}

export function DraggableWrapper({
  id,
  children,
  isSelected,
  onSelect,
  onContextMenu,
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
        "relative group transition-all duration-200",
        isContainer && isOver && "ring-2 ring-primary ring-offset-1 bg-primary/5",
        isContainer && !isOver && "hover:ring-1 hover:ring-dashed hover:ring-primary/30",
        isSelected ? "ring-2 ring-primary ring-offset-2 z-10" : "hover:ring-1 hover:ring-primary/50",
        isDragging ? "opacity-50" : "opacity-100",
      )}
    >
      {/* Component Controls - Visible on hover/select */}
      <div
        className={cn(
          "absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-2 py-0.5 rounded-t text-xs flex items-center gap-2 transition-opacity z-50 cursor-grab active:cursor-grabbing",
          isSelected || isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
        <span className="text-[10px] font-medium">{isContainer ? "Container" : "Drag"}</span>
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
