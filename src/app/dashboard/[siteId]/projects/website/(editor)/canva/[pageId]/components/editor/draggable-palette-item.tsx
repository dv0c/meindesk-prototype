"use client"
import { useDraggable } from "@dnd-kit/core"
import { Type, ImageIcon, Box, Layout, MousePointerClick, Square, List, Columns } from "lucide-react"
import type { ComponentDefinition } from "@/lib/types"

interface DraggablePaletteItemProps {
  component: ComponentDefinition
  onAdd: () => void
}

const iconMap: Record<string, any> = {
  Container: Box,
  Grid: Layout,
  HtmlContainer: Square,
  Heading: Type,
  Text: Type,
  Image: ImageIcon,
  Button: MousePointerClick,
  EditorButton: MousePointerClick,
  ArticleList: List,
  Columns: Columns,
}

export function DraggablePaletteItem({ component, onAdd }: DraggablePaletteItemProps) {
  // Create unique ID that includes theme name if present
  const uniqueId = component.themeName
    ? `palette-${component.themeName}_${component.name}`
    : `palette-${component.name}`;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: uniqueId,
    data: {
      type: "palette-item",
      component,
    },
  })

  const Icon = iconMap[component.name] || Box

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="touch-none h-full"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div
        className="flex flex-col items-center justify-center p-3 h-24 border rounded-md hover:border-primary hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-colors bg-card"
        onClick={onAdd}
      >
        <Icon className="h-6 w-6 mb-2 text-muted-foreground" />
        <span className="text-xs text-center font-medium leading-tight">{component.name}</span>
        {component.themeName && (
          <span className="text-[10px] text-center text-muted-foreground leading-tight mt-0.5">
            ({component.themeName})
          </span>
        )}
      </div>
    </div>
  )
}
