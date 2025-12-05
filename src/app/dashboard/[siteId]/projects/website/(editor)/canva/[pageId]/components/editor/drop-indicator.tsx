"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

interface DropIndicatorProps {
  id: string
  parentId: string | null
  position: "before" | "after" | "inside"
  className?: string
}

export function DropIndicator({ id, parentId, position, className }: DropIndicatorProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "drop-zone",
      parentId,
      position,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-all duration-200",
        position === "inside"
          ? "min-h-[40px] rounded-md border-2 border-dashed flex items-center justify-center"
          : "h-2 rounded-sm my-1",
        isOver
          ? position === "inside"
            ? "bg-primary/10 border-primary"
            : "bg-primary h-1 scale-y-150"
          : position === "inside"
            ? "border-transparent bg-muted/30"
            : "bg-transparent hover:bg-primary/20",
        className,
      )}
    >
      {position === "inside" && isOver && <span className="text-xs font-medium text-primary">Drop here</span>}
      {position === "inside" && !isOver && <span className="text-xs text-muted-foreground">Empty container</span>}
    </div>
  )
}
