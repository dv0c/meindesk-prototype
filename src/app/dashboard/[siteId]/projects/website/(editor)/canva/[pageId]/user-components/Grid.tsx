"use client"

import React from "react"
import { useEditor, useNode } from "@craftjs/core"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { UniversalStyleTab } from "@/components/editor/UniversalStyleTab"
import { LayoutGrid } from "lucide-react"

export interface GridProps {
    children?: React.ReactNode
    style?: BlockStyle
    className?: string
    columns?: number
    rows?: number
}

const defaultStyles: BlockStyle = {
    display: "grid",
    width: "100%",
    gap: 16,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    minHeight: 80,
    backgroundColor: "transparent",
}

// Grid Settings Component
const GridSettings = () => {
    const { actions: { setProp }, columns, rows, gap } = useNode((node) => ({
        columns: node.data.props.columns,
        rows: node.data.props.rows,
        gap: node.data.props.style?.gap
    }))

    return (
        <div className="space-y-4 pt-2">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">Columns</label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{columns}</span>
                </div>
                <input
                    type="range"
                    min={1}
                    max={12}
                    step={1}
                    value={columns || 2}
                    onChange={(e) => setProp((props: any) => props.columns = parseInt(e.target.value))}
                    className="w-full"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">Rows</label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{rows || 'Auto'}</span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={12}
                    step={1}
                    value={rows || 0}
                    onChange={(e) => setProp((props: any) => props.rows = parseInt(e.target.value))}
                    className="w-full"
                />
                <p className="text-[10px] text-gray-400">Set to 0 for auto rows</p>
            </div>

            <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-700">Gap</label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{gap}px</span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={parseInt(gap) || 0}
                    onChange={(e) => setProp((props: any) => {
                        props.style.gap = parseInt(e.target.value)
                    })}
                    className="w-full"
                />
            </div>

            <div className="pt-2 border-t">
                <UniversalStyleTab />
            </div>
        </div>
    )
}

export const Grid = defineBlock<GridProps>({
    name: "Grid",
    category: "Layout",
    icon: <LayoutGrid className="w-4 h-4" />,
    description: "Responsive grid layout",

    defaultProps: {
        style: defaultStyles,
        columns: 2,
        rows: 0
    },

    settings: GridSettings,

    render: ({ children, style, className, columns = 2, rows = 0, theme }) => {
        const { enabled } = useEditor((state) => ({
            enabled: state.options.enabled
        }))

        // Ensure grid columns are set
        // We override the display style to force grid, and set the template columns based on the prop
        const effectiveStyle = {
            ...style,
            display: "grid" as const, // Explicit cast for typescript
            gridTemplateColumns: style?.gridTemplateColumns || `repeat(${columns}, 1fr)`,
            gridTemplateRows: rows > 0 ? `repeat(${rows}, 1fr)` : undefined
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: effectiveStyle,
            className
        })

        const childCount = React.Children.count(children)

        const isEmpty = childCount === 0

        // For visualization of empty slots when not empty but rows defined
        // If we have specific rows, we might want to show all slots?
        // But children are just children. 
        // Let's stick to the visualizer logic for "isEmpty" or maybe overlay?
        // User requested settings for cols and rows to change.

        return (
            <div className={computedClassName} style={computedStyle}>
                {isEmpty && enabled ? (
                    // Show placeholders for all expected cells if rows are defined, else just columns
                    Array.from({ length: Math.max(columns * (rows || 1), columns) }).map((_, i) => (
                        <div
                            key={i}
                            className="w-full h-full min-h-[50px] border border-dashed border-gray-300"
                            style={{
                                borderColor: 'rgba(0,0,0,0.1)'
                            }}
                        />
                    ))
                ) : (
                    children
                )}
            </div>
        )
    },

    childrenAllowed: true
})
