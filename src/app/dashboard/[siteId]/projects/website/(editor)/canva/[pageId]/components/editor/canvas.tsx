"use client"

import type React from "react"

import type { LayoutNode } from "@/lib/types"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { RenderNode } from "../render-node"
import { useBuilderStore } from "@/lib/store"
import { useMemo } from "react"

interface CanvasProps {
  nodes: LayoutNode[]
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
  onContextMenu?: (e: React.MouseEvent, id: string) => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
  validComponentNames?: string[]
}

export function Canvas({ nodes, selectedNodeId, onSelectNode, onContextMenu, onDuplicate, onDelete, validComponentNames }: CanvasProps) {
  const { websiteSettings } = useBuilderStore()

  // Main canvas droppable
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-root",
    data: {
      isContainer: true,
      id: "root",
    },
  })

  // Calculate if background is light or dark for contrast
  const isLightBackground = useMemo(() => {
    const bgColor = websiteSettings.theme.backgroundColor
    if (!bgColor) return true // default is light
    const hex = bgColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5
  }, [websiteSettings.theme.backgroundColor])

  // When canvas is empty, render a simple droppable area
  if (nodes.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={`
          canvas-interactive-area relative min-h-full transition-colors overflow-auto
          flex items-center justify-center
          ${isOver ? "bg-primary/10 ring-2 ring-inset ring-primary" : ""} 
        `}
      >
        <div className="text-center space-y-4 max-w-sm mx-auto p-8 border-2 border-dashed rounded-xl"
          style={{
            borderColor: isOver ? 'hsl(var(--primary))' : isLightBackground ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            backgroundColor: isLightBackground ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)'
          }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{
              backgroundColor: isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'
            }}>
            <span className="text-2xl" style={{ color: isLightBackground ? '#000' : '#fff' }}>+</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg" style={{ color: isLightBackground ? '#000' : '#fff' }}>
              {isOver ? "Drop to add component" : "Start Building"}
            </h3>
            <p className="text-sm" style={{ color: isLightBackground ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>
              Drag elements from the sidebar or choose a template to get started.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // When canvas has nodes, use sortable context with a background droppable
  return (
    <div className="canvas-interactive-area relative min-h-full transition-colors overflow-auto">
      {/* Background droppable layer - catches drops not on specific items */}
      <div
        ref={setNodeRef}
        className={`
          absolute inset-0 pointer-events-none
          ${isOver ? "bg-primary/5" : ""} 
        `}
        style={{ zIndex: 0 }}
      />

      {/* Sortable content layer */}
      <div className="relative" style={{ zIndex: 1 }}>
        <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1 pb-20">
            {nodes.map((node) => (
              <RenderNode
                key={node.id}
                node={node}
                isEditor={true}
                onSelect={onSelectNode}
                isSelected={node.id === selectedNodeId}
                onContextMenu={onContextMenu}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                validComponentNames={validComponentNames}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      {/* Bottom drop zone indicator */}
      <div
        className={`
          fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg
          flex items-center justify-center text-sm transition-all z-50
          ${isOver
            ? "bg-primary text-primary-foreground"
            : "bg-background/80 backdrop-blur border text-muted-foreground"
          }
        `}
      >
        {isOver ? "Release to add to canvas" : "Drag components here"}
      </div>
    </div>
  )
}
