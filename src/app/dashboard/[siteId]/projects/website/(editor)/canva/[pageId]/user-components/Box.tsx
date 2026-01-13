"use client"

import React from "react"
import { useEditor } from "@craftjs/core"
import { Box as BoxIcon } from "lucide-react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { UniversalStyleTab } from "@/components/editor/UniversalStyleTab"

export interface BoxProps {
    children?: React.ReactNode
    style?: BlockStyle
    className?: string
}

const defaultStyles: BlockStyle = {
    display: "block",
    width: "100%",
    minHeight: 50,
    backgroundColor: "#f3f4f6", // Light gray default to be visible
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
}

export const Box = defineBlock<BoxProps>({
    name: "Box",
    category: "Utility",
    icon: <BoxIcon className="w-4 h-4" />,
    description: "A primitive box element with full CSS control",

    defaultProps: {
        style: defaultStyles
    },

    settings: UniversalStyleTab,

    render: ({ children, style, className, theme }) => {
        const { enabled } = useEditor((state) => ({
            enabled: state.options.enabled
        }))

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className
        })

        const childCount = React.Children.count(children)

        return (
            <div className={computedClassName} style={computedStyle}>
                {children}
                {enabled && childCount === 0 && (
                    <div className="w-full h-full min-h-[20px] flex items-center justify-center text-[10px] text-gray-400 border border-dotted border-gray-300">
                        Box
                    </div>
                )}
            </div>
        )
    },

    childrenAllowed: true
})
