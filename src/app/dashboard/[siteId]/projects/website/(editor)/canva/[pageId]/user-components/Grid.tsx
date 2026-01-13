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

import {
    PropertySection,
    PropertyRow,
    PropertySlider
} from "../components/PropertySection"

// Grid Settings Component
const GridSettings = () => {
    const { actions: { setProp }, columns, rows, gap } = useNode((node) => ({
        columns: node.data.props.columns,
        rows: node.data.props.rows,
        gap: node.data.props.style?.gap
    }))

    return (
        <div className="space-y-4 pt-2">
            <PropertySection title="Grid Layout" defaultOpen={true}>
                <PropertyRow label="Columns" description="Number of vertical columns">
                    <PropertySlider
                        value={columns || 2}
                        min={1}
                        max={12}
                        step={1}
                        onChange={(val) => setProp((props: any) => props.columns = val)}
                        unit=""
                    />
                </PropertyRow>

                <PropertyRow label="Rows" description="Number of horizontal rows (0 for auto)">
                    <PropertySlider
                        value={rows || 0}
                        min={0}
                        max={12}
                        step={1}
                        onChange={(val) => setProp((props: any) => props.rows = val)}
                        unit=""
                    />
                </PropertyRow>

                <PropertyRow label="Gap" description="Spacing between items">
                    <PropertySlider
                        value={parseInt(gap) || 0}
                        min={0}
                        max={100}
                        step={1}
                        onChange={(val) => setProp((props: any) => {
                            if (!props.style) props.style = {}
                            props.style.gap = val
                        })}
                    />
                </PropertyRow>
            </PropertySection>

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
