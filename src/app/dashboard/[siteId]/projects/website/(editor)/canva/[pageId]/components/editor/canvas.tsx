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
  validComponentNames?: string[]
}

export function Canvas({ nodes, selectedNodeId, onSelectNode, onContextMenu, validComponentNames }: CanvasProps) {
  const { websiteSettings } = useBuilderStore()

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

    // Convert hex to RGB
    const hex = bgColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    // Calculate relative luminance (perceived brightness)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5
  }, [websiteSettings.theme.backgroundColor])

  return (
    <div
      ref={setNodeRef}
      className={`
    canvas-interactive-area relative min-h-full p-6 transition-colors overflow-auto
    ${isOver ? "bg-primary/5" : ""} 
    ${nodes.length === 0 ? "flex items-center justify-center" : ""} 
  `}
    >
      {nodes.length === 0 ? (
        <div className="text-center space-y-4 max-w-sm mx-auto p-8 border-2 border-dashed rounded-xl"
          style={{
            borderColor: isLightBackground ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            backgroundColor: isLightBackground ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)'
          }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{
              backgroundColor: isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'
            }}>
            <span className="text-2xl" style={{ color: isLightBackground ? '#000' : '#fff' }}>+</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg" style={{ color: isLightBackground ? '#000' : '#fff' }}>Start Building</h3>
            <p className="text-sm" style={{ color: isLightBackground ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>
              Drag elements from the sidebar or choose a template to get started.
            </p>
          </div>
        </div>
      ) : (
        <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {nodes.map((node) => (
              <RenderNode
                key={node.id}
                node={node}
                isEditor={true}
                onSelect={onSelectNode}
                isSelected={node.id === selectedNodeId}
                onContextMenu={onContextMenu}
                validComponentNames={validComponentNames}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  )
}
