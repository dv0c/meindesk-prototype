"use client"

import React from "react"
import { useNode } from "@craftjs/core"
import * as LucideIcons from "lucide-react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { UniversalStyleTab } from "@/components/editor/UniversalStyleTab"
import {
    PropertySection,
    PropertyRow,
    PropertyInput,
    PropertySlider,
    PropertyColor
} from "../components/PropertySection" // Adjust import path if needed

export interface IconProps {
    iconName?: string
    color?: string
    size?: number
    style?: BlockStyle
    className?: string
}

const defaultStyles: BlockStyle = {
    display: "inline-block",
}

// Custom Settings Panel for Icon
const IconSettings = () => {
    const {
        actions: { setProp },
        iconName,
        color,
        size
    } = useNode((node) => ({
        iconName: node.data.props.iconName,
        color: node.data.props.color,
        size: node.data.props.size
    }))

    return (
        <div>
            <PropertySection title="Icon">
                <PropertyRow label="Name">
                    <PropertyInput
                        value={iconName || ""}
                        onChange={(v) => setProp((props: IconProps) => (props.iconName = v))}
                        placeholder="e.g. Activity, Heart, ArrowRight"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                        Use <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="underline">Lucide icon names</a>.
                    </div>
                </PropertyRow>
                <PropertyRow label="Size">
                    <PropertySlider
                        value={size || 24}
                        onChange={(v) => setProp((props: IconProps) => (props.size = v))}
                        min={12}
                        max={128}
                    />
                </PropertyRow>
                <PropertyRow label="Color">
                    <PropertyColor
                        value={color || "#000000"}
                        onChange={(v) => setProp((props: IconProps) => (props.color = v))}
                    />
                </PropertyRow>
            </PropertySection>
            <UniversalStyleTab />
        </div>
    )
}

export const Icon = defineBlock<IconProps>({
    name: "Icon",
    category: "Utility",
    icon: <LucideIcons.Star className="w-4 h-4" />,
    description: "Vector icon from Lucide library",

    defaultProps: {
        iconName: "Star",
        size: 24,
        color: "currentColor",
        style: defaultStyles
    },

    settings: IconSettings,

    render: ({ iconName, color, size, style, className, theme }) => {
        // Dynamic icon resolution
        // @ts-ignore
        const LucideIcon = LucideIcons[iconName] || LucideIcons.HelpCircle

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style,
            className
        })

        return (
            <div className={computedClassName} style={computedStyle}>
                <LucideIcon
                    size={size}
                    color={color}
                // strokeWidth={1.5} // Could add as prop
                />
            </div>
        )
    },

    childrenAllowed: false
})
