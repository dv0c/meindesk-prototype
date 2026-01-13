"use client"

import React from "react"
import { useEditor, useNode } from "@craftjs/core"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { UniversalStyleTab } from "@/components/editor/UniversalStyleTab"
import { SectionSettings } from "./SectionSettings"
export { SectionSettings }

export interface SectionProps {
    children?: React.ReactNode
    style?: BlockStyle
    className?: string
    previewLayout?: 'full' | 'centered' | 'fixed'
}

const defaultStyles: BlockStyle = {
    paddingTop: 40,
    paddingRight: 20,
    paddingBottom: 40,
    paddingLeft: 20,
    width: "100%",
    minHeight: 200,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 20,
    backgroundColor: "transparent",
    position: "relative"
}

export const Section = defineBlock<SectionProps>({
    name: "Section",
    category: "Layout",
    icon: (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-500"
        >
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
            <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    description: "A top-level semantic section for building page structure.",

    defaultProps: {
        style: defaultStyles,
        previewLayout: 'full'
    },

    // Combined settings: Layout presets + Universal styles
    // Combined settings: Layout presets + Universal styles
    settings: (props) => (
        <div className="flex flex-col gap-4">
            {/* We manually insert our custom layout settings at the top */}
            <div className="p-4 border-b">
                <SectionSettings />
            </div>
            {/* Then we render the standard style tab */}
            <UniversalStyleTab {...props} />
        </div>
    ),

    render: ({ children, style, className }) => {
        const { enabled } = useEditor((state) => ({
            enabled: state.options.enabled
        }))

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className
        })

        const isEmpty = !children || (Array.isArray(children) && children.length === 0) || (React.Children.count(children) === 0)

        return (
            <section className={isEmpty && enabled ? "" : computedClassName} style={isEmpty && enabled ? {} : computedStyle}>
                {isEmpty && enabled ? (
                    <div className="w-full h-full min-h-[200px] flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50/50 text-sm text-gray-400 p-8 gap-2 transition-colors hover:border-gray-300 hover:bg-gray-100/50">
                        <span className="font-medium text-gray-500">Empty Section</span>
                        <span>Drop components here</span>
                    </div>
                ) : (
                    children
                )}
            </section>
        )
    },

    childrenAllowed: true
})
