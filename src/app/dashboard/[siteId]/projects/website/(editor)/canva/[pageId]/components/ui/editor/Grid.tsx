"use client"

import React from "react"

import type { ReactNode, CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { useState, useRef, useEffect } from "react"
import { useBuilderStore } from "@/lib/store"

interface GridProps {
  columns?: number
  columnWidths?: number[] // Added array of fr values for custom column widths
  gap?: number
  padding?: number
  className?: string
  children?: ReactNode
  style?: CSSProperties
  [key: string]: any
}

export default function Grid({
  columns = 2,
  columnWidths,
  gap = 4,
  padding = 4,
  className,
  children,
  style,
  ...props
}: GridProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: props["data-node-id"] || "grid-container",
    data: {
      isContainer: true,
      type: "grid",
    },
  })

  const isEditorMode = props["data-editor-mode"]
  const nodeId = props["data-node-id"]
  const updateNode = useBuilderStore((state) => state.updateNode)

  const [localColumnWidths, setLocalColumnWidths] = useState<number[]>(() => {
    if (columnWidths && columnWidths.length > 0) {
      return columnWidths
    }
    return Array(columns).fill(1)
  })

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const startWidthsRef = useRef<number[]>([])

  useEffect(() => {
    if (columnWidths && columnWidths.length > 0) {
      setLocalColumnWidths(columnWidths)
    } else if (localColumnWidths.length !== columns) {
      setLocalColumnWidths(Array(columns).fill(1))
    }
  }, [columns, columnWidths])

  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingIndex(index)
    startXRef.current = e.clientX
    startWidthsRef.current = [...localColumnWidths]
  }

  useEffect(() => {
    if (draggingIndex === null) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef.current || draggingIndex === null) return

      const deltaX = e.clientX - startXRef.current
      const gridWidth = gridRef.current.offsetWidth
      const gapInPx = gap * 4 // Convert rem to px (0.25rem = 4px)
      const totalGapWidth = gapInPx * (localColumnWidths.length - 1)
      const availableWidth = gridWidth - totalGapWidth

      // Calculate how much fr this delta represents
      const totalFr = startWidthsRef.current.reduce((sum, fr) => sum + fr, 0)
      const pixelsPerFr = availableWidth / totalFr
      const deltaFr = deltaX / pixelsPerFr

      const newWidths = [...startWidthsRef.current]
      const leftIndex = draggingIndex
      const rightIndex = draggingIndex + 1

      // Adjust the two columns on either side of the divider
      const newLeftWidth = Math.max(0.5, newWidths[leftIndex] + deltaFr)
      const newRightWidth = Math.max(0.5, newWidths[rightIndex] - deltaFr)

      newWidths[leftIndex] = newLeftWidth
      newWidths[rightIndex] = newRightWidth

      setLocalColumnWidths(newWidths)
    }

    const handleMouseUp = () => {
      setDraggingIndex(null)
      if (nodeId && isEditorMode) {
        updateNode(nodeId, {
          props: {
            ...props,
            columnWidths: localColumnWidths,
          },
        })
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggingIndex, gap, localColumnWidths, nodeId, isEditorMode, updateNode])

  const childIds = Array.isArray(children)
    ? children.filter((child) => React.isValidElement(child) && child.key).map((child) => (child as React.ReactElement).key as string)
    : React.isValidElement(children) && children.key
      ? [children.key as string]
      : []

  const gridTemplateColumns = localColumnWidths.map((width) => `${width}fr`).join(" ")

  // Generate responsive grid styles that preserve column width ratios
  const getResponsiveGridStyles = (): CSSProperties => {
    const baseStyles: CSSProperties = {
      gap: `${gap * 0.25}rem`,
      padding: `${padding * 0.25}rem`,
      ...style,
    }

    // In editor mode, always show the full configured grid
    if (isEditorMode) {
      return {
        ...baseStyles,
        gridTemplateColumns,
      }
    }

    // For preview/published mode, create responsive breakpoints
    // while preserving the custom column width ratios
    const columnCount = localColumnWidths.length

    // Generate grid templates for different screen sizes
    let mobileGrid = '1fr' // Mobile: always 1 column
    let tabletGrid = gridTemplateColumns // Tablet: default to all columns
    let desktopGrid = gridTemplateColumns // Desktop: all columns

    if (columnCount === 2) {
      // 2 columns: mobile = 1, tablet+ = 2 with ratio preserved
      tabletGrid = gridTemplateColumns
    } else if (columnCount === 3) {
      // 3 columns: mobile = 1, tablet = 2 (first two with preserved ratio), desktop = 3
      const firstTwo = localColumnWidths.slice(0, 2)
      const totalRatio = firstTwo.reduce((sum, w) => sum + w, 0)
      tabletGrid = firstTwo.map(w => `${w}fr`).join(' ')
    } else if (columnCount >= 4) {
      // 4+ columns: mobile = 1, tablet = 2 (first two with preserved ratio), desktop = all
      const firstTwo = localColumnWidths.slice(0, 2)
      tabletGrid = firstTwo.map(w => `${w}fr`).join(' ')
    }

    // Use CSS custom properties for media query support
    return {
      ...baseStyles,
      ['--grid-mobile' as string]: mobileGrid,
      ['--grid-tablet' as string]: tabletGrid,
      ['--grid-desktop' as string]: desktopGrid,
      // Default to mobile on small screens
      gridTemplateColumns: mobileGrid,
    }
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        if (node) {
          ; (gridRef as any).current = node
        }
      }}
      className={cn(
        "grid w-full transition-colors relative",
        isOver && "ring-2 ring-primary/50",
        // Apply responsive grid columns via Tailwind arbitrary values
        !isEditorMode && localColumnWidths.length > 1 && "sm:!grid-cols-[var(--grid-tablet)] lg:!grid-cols-[var(--grid-desktop)]",
        className
      )}
      style={getResponsiveGridStyles()}
      {...props}
    >
      {children && childIds.length > 0 ? (
        <SortableContext items={childIds} strategy={rectSortingStrategy}>
          {children}
        </SortableContext>
      ) : (
        <div className="col-span-full p-8 border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-muted-foreground">
          Grid Container ({localColumnWidths.length} Columns) - Drop items here
        </div>
      )}

      {isEditorMode &&
        localColumnWidths.length > 1 &&
        localColumnWidths.slice(0, -1).map((_, index) => {
          const isActive = draggingIndex === index || hoveredIndex === index
          return (
            <div
              key={`divider-${index}`}
              className={cn(
                "absolute top-0 bottom-0 cursor-col-resize z-20 group",
                "flex items-center justify-center transition-all",
              )}
              style={{
                left: `calc(${localColumnWidths.slice(0, index + 1).reduce((sum, fr) => sum + fr, 0) /
                  localColumnWidths.reduce((sum, fr) => sum + fr, 0)
                  } * (100% - ${gap * 0.25 * (localColumnWidths.length - 1)}rem) + ${gap * 0.25 * (index + 1)}rem + ${padding * 0.25}rem)`,
                width: "16px",
                transform: "translateX(-50%)",
              }}
              onMouseDown={(e) => handleMouseDown(index, e)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Visual indicator line */}
              <div
                className={cn(
                  "h-full w-0.5 rounded-full transition-all",
                  isActive ? "bg-primary w-1" : "bg-transparent group-hover:bg-primary/40 group-hover:w-1",
                )}
              />
              {/* Drag handle dots */}
              <div
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                  "flex flex-col gap-1 p-1 rounded transition-all",
                  isActive ? "bg-primary/20 opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:bg-muted",
                )}
              >
                <div className="w-1 h-1 rounded-full bg-primary" />
                <div className="w-1 h-1 rounded-full bg-primary" />
                <div className="w-1 h-1 rounded-full bg-primary" />
              </div>
            </div>
          )
        })}
    </div>
  )
}
