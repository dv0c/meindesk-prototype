"use client"

import React from "react"
import { useEditor } from "@craftjs/core"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { UniversalStyleTab } from "@/components/editor/UniversalStyleTab"
import { LayoutGrid } from "lucide-react"

export interface GridProps {
    children?: React.ReactNode
    style?: BlockStyle
    className?: string
    columns?: number
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

export const Grid = defineBlock<GridProps>({
    name: "Grid",
    category: "Layout",
    icon: <LayoutGrid className="w-4 h-4" />,
    description: "Responsive grid layout",

    defaultProps: {
        style: defaultStyles,
        columns: 2
    },

    settings: UniversalStyleTab,

    render: ({ children, style, className, columns = 2, theme }) => {
        const { enabled } = useEditor((state) => ({
            enabled: state.options.enabled
        }))

        // Ensure grid columns are set
        // We override the display style to force grid, and set the template columns based on the prop
        const effectiveStyle = {
            ...style,
            display: "grid" as const, // Explicit cast for typescript
            gridTemplateColumns: style?.gridTemplateColumns || `repeat(${columns}, 1fr)`
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: effectiveStyle,
            className
        })

        const childCount = React.Children.count(children)

        const isEmpty = childCount === 0

        return (
            <div className={isEmpty && enabled ? "" : computedClassName} style={isEmpty && enabled ? {} : computedStyle}>
                {children}
                {enabled && isEmpty && (
                    <div
                        className="col-span-full h-full min-h-[80px] w-full flex items-center justify-center border border-dashed border-gray-300/50 bg-gray-50/20 text-xs text-gray-400 p-4"
                        style={{ gridColumn: `1 / -1` }}
                    >
                        Empty Grid
                    </div>
                )}
            </div>
        )
    },

    childrenAllowed: true
})
