"use client"

import type React from "react"

import type { LayoutNode } from "@/lib/types"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { RenderNode } from "../render-node"

interface CanvasProps {
  nodes: LayoutNode[]
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
  onContextMenu?: (e: React.MouseEvent, id: string) => void
  validComponentNames?: string[]
}

export function Canvas({ nodes, selectedNodeId, onSelectNode, onContextMenu, validComponentNames }: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-root",
    data: {
      isContainer: true,
      id: "root",
    },
  })

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
        <div className="text-center space-y-4 max-w-sm mx-auto p-8 border-2 border-dashed rounded-xl">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">+</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Start Building</h3>
            <p className="text-muted-foreground text-sm">
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
