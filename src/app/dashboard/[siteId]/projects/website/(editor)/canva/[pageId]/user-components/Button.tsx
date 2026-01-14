"use client"

import React from "react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { resolveCollectionTemplate } from "@/lib/collection-utils"
import { useCollectionItem } from "./collections/CollectionItemContext"
import { Square, MousePointerClick } from "lucide-react"

import { cn } from "@/lib/utils"

export interface ButtonProps {
    text?: string
    url?: string
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link"
    size?: "sm" | "md" | "lg"
    fullWidth?: boolean
    blockStyle?: BlockStyle
    className?: string
    responsive?: {
        hiddenOn?: string[]
    }
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
        responsive: { hiddenOn: [] }
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
                { label: "Link", value: "link" },
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
        className,
        isEditing,
        responsive,
        deviceMode
    }) => {
        const collectionContext = useCollectionItem()
        const resolvedText = resolveCollectionTemplate(text, collectionContext?.data)

        // Variant styles map for CSS Properties (inline)
        // Note: We avoid setting background colors for variants that need hover effects (handled by classes)
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
                        // Let class handle bg
                        color: 'currentColor',
                        borderWidth: 1,
                        borderColor: 'var(--border, #e4e4e7)',
                    }
                case "ghost":
                    return {
                        // Let class handle bg
                        color: 'currentColor',
                        borderWidth: 0,
                    }
                case "link":
                    return {
                        // Let class handle bg
                        color: 'var(--primary, #000000)', // Links usually primary color
                        borderWidth: 0,
                        paddingTop: 0,
                        paddingBottom: 0,
                        paddingLeft: 0,
                        paddingRight: 0,
                    }
                default:
                    return {}
            }
        }

        const getVariantClasses = () => {
            switch (variant) {
                case 'outline':
                    return "bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
                case 'ghost':
                    return "bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors"
                case 'link':
                    return "text-primary underline-offset-4 hover:underline !p-0 h-auto"
                default:
                    return ""
            }
        }

        // Size overrides if not manually set in blockStyle
        const getSizeStyles = (): Partial<BlockStyle> => {
            // Link variant usually ignores standard button sizes padding
            if (variant === 'link') return {}

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
            className: className,
            responsive,
            isEditing,
            deviceMode
        })

        const handleClick = (e: React.MouseEvent) => {
            // Prevent navigation in editor
            if (isEditing) {
                e.preventDefault()
                return
            }

            // Also prevent default if url is just #
            if (url === '#' || !url) {
                e.preventDefault()
            }
        }

        return (
            <a
                href={url}
                className={cn(computedClassName, getVariantClasses())}
                style={computedStyle}
                onClick={handleClick}
            >
                {resolvedText || text}
            </a>
        )
    }
})

export default Button
