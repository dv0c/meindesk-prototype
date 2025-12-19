"use client"

import type React from "react"
import { useState, Fragment } from "react"
import type { LayoutNode } from "@/lib/types"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { RenderNode } from "../render-node"
import { useBuilderStore } from "@/lib/store"
import { useMemo } from "react"
import { AddSectionButton } from "./add-section-button"
import { Plus } from "lucide-react"

interface CanvasProps {
  nodes: LayoutNode[]
  selectedNodeId: string | null
  onSelectNode: (id: string) => void
  onContextMenu?: (e: React.MouseEvent, id: string) => void
  onDuplicate?: (id: string) => void
  onDelete?: (id: string) => void
  validComponentNames?: string[]
  activeId?: string | null // Currently dragging item ID
  overId?: string | null // Item being dragged over
  onAddAtIndex?: (index: number) => void // Callback for add section button
}

export function Canvas({
  nodes,
  selectedNodeId,
  onSelectNode,
  onContextMenu,
  onDuplicate,
  onDelete,
  validComponentNames,
  activeId,
  overId,
  onAddAtIndex,
}: CanvasProps) {
  const { websiteSettings } = useBuilderStore()
  const [hoveredGap, setHoveredGap] = useState<number | null>(null)

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
    if (!bgColor) return true
    const hex = bgColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5
  }, [websiteSettings.theme.backgroundColor])

  // When canvas is empty, render a welcoming droppable area
  if (nodes.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={`
          canvas-interactive-area relative min-h-full transition-all duration-300 overflow-auto
          flex items-center justify-center
          ${isOver ? "bg-primary/10 ring-2 ring-inset ring-primary" : ""} 
        `}
      >
        <div className="text-center space-y-4 max-w-sm mx-auto p-8 border-2 border-dashed rounded-xl transition-all duration-200"
          style={{
            borderColor: isOver ? 'hsl(var(--primary))' : isLightBackground ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            backgroundColor: isLightBackground ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)'
          }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-transform duration-200"
            style={{
              backgroundColor: isLightBackground ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
              transform: isOver ? 'scale(1.1)' : 'scale(1)'
            }}>
            <Plus className="w-8 h-8" style={{ color: isLightBackground ? '#000' : '#fff' }} />
          </div>
          <div>
            <h3 className="font-semibold text-lg" style={{ color: isLightBackground ? '#000' : '#fff' }}>
              {isOver ? "Drop to add component" : "Start Building"}
            </h3>
            <p className="text-sm" style={{ color: isLightBackground ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>
              Drag elements from the sidebar or click + to get started.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Determine which item should show insertion indicator
  const getInsertionPosition = (nodeId: string, index: number): { before: boolean; after: boolean } => {
    if (!activeId || !overId) return { before: false, after: false }

    // Only show indicator when dragging over a sibling (not the active item itself)
    if (overId === activeId) return { before: false, after: false }

    // Check if we're dragging over this specific node
    if (overId === nodeId || overId === `droppable-${nodeId}`) {
      // Show after indicator on the target
      return { before: false, after: true }
    }

    return { before: false, after: false }
  }

  // When canvas has nodes, use sortable context with smooth animations
  return (
    <div className="canvas-interactive-area relative min-h-full transition-colors overflow-auto">
      {/* Background droppable layer */}
      <div
        ref={setNodeRef}
        className={`
          absolute inset-0 pointer-events-none transition-colors duration-200
          ${isOver ? "bg-primary/5" : ""} 
        `}
        style={{ zIndex: 0 }}
      />

      {/* Sortable content layer */}
      <div className="relative py-4" style={{ zIndex: 1 }}>
        <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
          {/* Add section button at the top */}
          {!activeId && (
            <div
              className="group h-6 flex items-center justify-center cursor-pointer transition-all duration-200 mx-4 mb-2"
              onMouseEnter={() => setHoveredGap(-1)}
              onMouseLeave={() => setHoveredGap(null)}
              onClick={() => onAddAtIndex?.(0)}
            >
              <div className={`
                absolute inset-x-4 h-0.5 bg-primary/20 transition-all duration-200
                ${hoveredGap === -1 ? "opacity-100 bg-primary/40" : "opacity-0 group-hover:opacity-100"}
              `} />
              <button
                className={`
                  relative z-10 flex items-center justify-center w-7 h-7 rounded-full
                  bg-background border-2 border-primary/30 shadow-sm
                  transition-all duration-200 ease-out
                  ${hoveredGap === -1
                    ? "scale-110 border-primary bg-primary text-primary-foreground shadow-md"
                    : "opacity-0 group-hover:opacity-100 hover:border-primary hover:bg-primary hover:text-primary-foreground"}
                `}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Render nodes with add buttons between them */}
          {nodes.map((node, index) => {
            const insertionPos = getInsertionPosition(node.id, index)

            return (
              <Fragment key={node.id}>
                <RenderNode
                  node={node}
                  isEditor={true}
                  onSelect={onSelectNode}
                  isSelected={node.id === selectedNodeId}
                  onContextMenu={onContextMenu}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                  validComponentNames={validComponentNames}
                  showInsertionBefore={insertionPos.before}
                  showInsertionAfter={insertionPos.after}
                />

                {/* Add section button between nodes (hidden when dragging) */}
                {!activeId && (
                  <div
                    className="group h-6 flex items-center justify-center cursor-pointer transition-all duration-200 mx-4"
                    onMouseEnter={() => setHoveredGap(index)}
                    onMouseLeave={() => setHoveredGap(null)}
                    onClick={() => onAddAtIndex?.(index + 1)}
                  >
                    <div className={`
                      absolute inset-x-4 h-0.5 bg-primary/20 transition-all duration-200
                      ${hoveredGap === index ? "opacity-100 bg-primary/40" : "opacity-0 group-hover:opacity-100"}
                    `} />
                    <button
                      className={`
                        relative z-10 flex items-center justify-center w-7 h-7 rounded-full
                        bg-background border-2 border-primary/30 shadow-sm
                        transition-all duration-200 ease-out
                        ${hoveredGap === index
                          ? "scale-110 border-primary bg-primary text-primary-foreground shadow-md"
                          : "opacity-0 group-hover:opacity-100 hover:border-primary hover:bg-primary hover:text-primary-foreground"}
                      `}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </Fragment>
            )
          })}
        </SortableContext>
      </div>

      {/* Bottom floating indicator - only show when actively dragging */}
      {activeId && (
        <div
          className={`
            fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg
            flex items-center justify-center text-sm transition-all duration-200 z-50
            ${isOver
              ? "bg-primary text-primary-foreground scale-105"
              : "bg-background/90 backdrop-blur-md border text-muted-foreground"
            }
          `}
        >
          {isOver ? "Release to add to canvas" : "Drag to reorder"}
        </div>
      )}
    </div>
  )
}

