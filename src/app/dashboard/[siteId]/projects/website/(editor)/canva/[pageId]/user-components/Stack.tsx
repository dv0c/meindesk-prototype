"use client"

import React from "react"
import { useEditor } from "@craftjs/core"
import { Layers } from "lucide-react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { UniversalStyleTab } from "@/components/editor/UniversalStyleTab"

export interface StackProps {
    children?: React.ReactNode
    style?: BlockStyle
    className?: string
    direction?: 'row' | 'column'
    wrap?: boolean
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
    gap?: number
}

const defaultStyles: BlockStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    minHeight: 50,
    backgroundColor: "transparent",
    gap: 16,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
}

export const Stack = defineBlock<StackProps>({
    name: "Stack",
    category: "Layout",
    icon: <Layers className="w-4 h-4" />,
    description: "Flexbox stack layout",

    defaultProps: {
        style: defaultStyles,
        direction: 'column',
        wrap: false,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: 16
    },

    settings: UniversalStyleTab,

    render: ({ children, style, className, direction, wrap, alignItems, justifyContent, gap, theme }) => {
        const { enabled } = useEditor((state) => ({
            enabled: state.options.enabled
        }))

        const effectiveStyle = {
            ...style,
            display: "flex" as const,
            flexDirection: direction,
            flexWrap: wrap ? "wrap" as const : "nowrap" as const,
            alignItems,
            justifyContent,
            gap
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: effectiveStyle,
            className
        })

        const childCount = React.Children.count(children)

        return (
            <div className={computedClassName} style={computedStyle}>
                {children}
                {enabled && childCount === 0 && (
                    <div className="w-full h-full min-h-[50px] flex items-center justify-center border border-dashed border-gray-300 rounded bg-gray-50/20 text-xs text-gray-400 p-4">
                        Empty Stack
                    </div>
                )}
            </div>
        )
    },

    childrenAllowed: true
})
