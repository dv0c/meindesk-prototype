"use client"

import React from "react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { resolveCollectionTemplate } from "@/lib/collection-utils"
import { useCollectionItem } from "./collections/CollectionItemContext"
import { Square, MousePointerClick } from "lucide-react"

export interface ButtonProps {
    text?: string
    url?: string
    variant?: "primary" | "secondary" | "outline" | "ghost"
    size?: "sm" | "md" | "lg"
    fullWidth?: boolean
    blockStyle?: BlockStyle
    className?: string
}

export const Button = defineBlock<ButtonProps>({
    name: "Button",
    category: "Interactive",
    icon: <MousePointerClick className="w-4 h-4" />,
    description: "A clickable button implementation",

    defaultProps: {
        text: "Click Me",
        url: "#",
        variant: "primary",
        size: "md",
        fullWidth: false,
        blockStyle: {
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 10,
            paddingLeft: 20,
            borderRadius: 6,
            fontWeight: 500,
            textAlign: "center",
        },
    },

    settingsConfig: {
        text: {
            label: "Button Text",
            type: "text",
            section: "Content",
        },
        url: {
            label: "Link URL",
            type: "text",
            section: "Content",
        },
        variant: {
            label: "Style Variant",
            type: "select",
            section: "Design",
            options: [
                { label: "Primary (Solid)", value: "primary" },
                { label: "Secondary (Muted)", value: "secondary" },
                { label: "Outline (Border)", value: "outline" },
                { label: "Ghost (Transparent)", value: "ghost" },
            ],
        },
        size: {
            label: "Size",
            type: "select",
            section: "Design",
            options: [
                { label: "Small", value: "sm" },
                { label: "Medium", value: "md" },
                { label: "Large", value: "lg" },
            ],
        },
        fullWidth: {
            label: "Full Width",
            type: "checkbox",
            section: "Layout",
        },
    },

    render: ({
        text = "Click Me",
        url = "#",
        variant = "primary",
        size = "md",
        fullWidth = false,
        blockStyle = {},
        className
    }) => {
        const collectionContext = useCollectionItem()
        const resolvedText = resolveCollectionTemplate(text, collectionContext?.data)

        // Variant styles map (could act as overrides or defaults)
        const getVariantStyles = (): Partial<BlockStyle> => {
            switch (variant) {
                case "primary":
                    return {
                        backgroundColor: 'var(--primary, #000000)',
                        color: 'var(--primary-foreground, #ffffff)',
                        borderWidth: 0,
                    }
                case "secondary":
                    return {
                        backgroundColor: 'var(--secondary, #f4f4f5)',
                        color: 'var(--secondary-foreground, #18181b)',
                        borderWidth: 0,
                    }
                case "outline":
                    return {
                        backgroundColor: 'transparent',
                        color: 'currentColor',
                        borderWidth: 1,
                        borderColor: 'var(--border, #e4e4e7)',
                    }
                case "ghost":
                    return {
                        backgroundColor: 'transparent',
                        color: 'currentColor',
                        borderWidth: 0,
                    }
                default:
                    return {}
            }
        }

        // Size overrides if not manually set in blockStyle
        const getSizeStyles = (): Partial<BlockStyle> => {
            switch (size) {
                case "sm":
                    return { fontSize: 12, paddingTop: 8, paddingBottom: 8, paddingLeft: 16, paddingRight: 16 }
                case "lg":
                    return { fontSize: 16, paddingTop: 14, paddingBottom: 14, paddingLeft: 32, paddingRight: 32 }
                default:
                    // Medium is handled by defaultProps or global defaults
                    return { fontSize: 14 }
            }
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: {
                // Base Layout
                display: fullWidth ? 'flex' : 'inline-flex',
                width: fullWidth ? '100%' : 'auto',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                // Merge Variant & Size Defaults first
                ...getVariantStyles(),
                ...getSizeStyles(),
                // Then merge user overrides (blockStyle)
                ...blockStyle,
            },
            className: className
        })

        const handleClick = (e: React.MouseEvent) => {
            // In editor, links are disabled by the wrapper usually, or we can prevent default
            // e.preventDefault()
            // Logic for real navigation would be handled differently on the published site
        }

        return (
            <a
                href={url}
                className={computedClassName}
                style={computedStyle}
                onClick={handleClick}
            >
                {resolvedText || text}
            </a>
        )
    }
})

export default Button
