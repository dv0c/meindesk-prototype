"use client"

import React from "react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { UniversalStyleTab } from "@/components/editor/UniversalStyleTab"
import { resolveCollectionTemplate } from "@/lib/collection-utils"
import { useCollectionItem } from "./collections/CollectionItemContext"
import { Square } from "lucide-react"

export interface ButtonProps {
    text?: string
    url?: string
    style?: BlockStyle
    className?: string
    variant?: "primary" | "secondary" | "outline" | "ghost"
}

const defaultStyles: BlockStyle = {
    paddingTop: 10,
    paddingRight: 20,
    paddingBottom: 10,
    paddingLeft: 20,
    borderRadius: 6,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontWeight: 500,
    backgroundColor: "#000000",
    color: "#ffffff",
    borderWidth: 0,
}

export const Button = defineBlock<ButtonProps>({
    name: "Button",
    category: "Interactive",
    icon: <Square className="w-4 h-4" />,
    description: "Clickable button element",

    defaultProps: {
        text: "Button",
        url: "#",
        style: defaultStyles,
        variant: "primary"
    },

    settings: UniversalStyleTab,

    render: ({ text, url, style, className, variant, theme }) => {
        const collectionContext = useCollectionItem()
        const resolvedText = resolveCollectionTemplate(text, collectionContext?.data)

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: {
                ...style,
                // Example of using theme tokens if style isn't overridden
                // fontFamily: theme?.typography?.fontFamily // if we had that structure
            },
            className
        })

        const handleClick = (e: React.MouseEvent) => {
            // Navigation handled by Next.js Link or external wrapper usually
            // but in editor, defaultPrevented by wrapper
        }

        return (
            <button
                className={computedClassName}
                style={computedStyle}
                onClick={handleClick}
            >
                {resolvedText}
            </button>
        )
    },

    childrenAllowed: false
})
