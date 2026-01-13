"use client"

import React from "react"
import { useEditor, useNode } from "@craftjs/core"
import { Plus } from "lucide-react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { UniversalStyleTab } from "@/components/editor/UniversalStyleTab"
import { useCollectionData } from "@/hooks/useCollectionData"
import { CollectionItemProvider } from "./collections/CollectionItemContext"
import { resolveCollectionTemplate } from "@/lib/collection-utils"

// Container Props Interface
export interface ContainerProps {
    children?: React.ReactNode
    style?: BlockStyle
    className?: string

    // Collection Data Props
    collectionId?: string
    itemId?: string
    useSlugFromUrl?: boolean
}

// Default Styles
const defaultStyles: BlockStyle = {
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    minHeight: 100,
    width: "100%",
    height: "auto",
    display: "block",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "#e5e7eb",
    position: "relative"
}

export const Container = defineBlock<ContainerProps>({
    name: "Container",
    category: "Layout",
    icon: <div className="w-full h-full bg-gray-400 rounded-sm" />,
    description: "A flexible container for grouping elements",

    defaultProps: {
        style: defaultStyles,
        collectionId: "",
        itemId: "",
        useSlugFromUrl: false
    },

    settings: UniversalStyleTab,

    render: ({ children, style, className, collectionId, itemId, useSlugFromUrl, theme }) => {
        const { enabled } = useEditor((state) => ({
            enabled: state.options.enabled
        }))

        // Fetch Collection Data
        const collectionData = useCollectionData({
            collectionId,
            itemId,
            useSlugFromUrl
        })

        // Compute Styles
        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className
        })

        if (style?.backgroundImage) {
            const resolvedBg = resolveCollectionTemplate(style.backgroundImage, collectionData.data)
            if (resolvedBg) {
                computedStyle.backgroundImage = `url(${resolvedBg})`
            }
        }

        const isEmpty = !children || (Array.isArray(children) && children.length === 0) || (React.Children.count(children) === 0)

        // For `isApp` logic, we might need a workaround or just show generic placeholder
        // Let's use generic placeholder for now to be safe and clean.

        return (
            <CollectionItemProvider value={collectionData}>
                <div className={computedClassName} style={computedStyle}>
                    {children}
                    {enabled && React.Children.count(children) === 0 && (
                        <div
                            className="col-span-full h-full w-full flex items-center justify-center border border-dashed border-gray-300/50 bg-gray-50/20 text-xs text-gray-400 p-4"
                            style={{ gridColumn: `1 / -1` }}
                        >
                            Empty Container
                        </div>
                    )}
                </div>
            </CollectionItemProvider>
        )
    },

    childrenAllowed: true
})
