"use client"

import { useNode } from "@craftjs/core"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyColor,
    PropertySelect,
} from "../components/PropertySection"
import { Minus } from "lucide-react"

interface DividerProps {
    color?: string
    height?: number
    styleType?: "solid" | "dashed" | "dotted" // Renamed from 'style' to avoid conflict with BlockStyle 'style'
    className?: string
    style?: BlockStyle
    // Legacy props mapping
    marginTop?: number
    marginBottom?: number
}

const defaultStyles: BlockStyle = {
    width: "100%",
    marginTop: 16,
    marginBottom: 16,
}

// Settings component for Divider
export const DividerSettings = () => {
    const {
        actions: { setProp },
        color,
        height,
        marginTop,
        marginBottom,
        styleType,
    } = useNode((node) => ({
        color: node.data.props.color,
        height: node.data.props.height,
        marginTop: node.data.props.style?.marginTop ?? node.data.props.marginTop,
        marginBottom: node.data.props.style?.marginBottom ?? node.data.props.marginBottom,
        styleType: node.data.props.styleType,
    }))

    const marginSummary = `${marginTop || 0}px ${marginBottom || 0}px`

    return (
        <div>
            <PropertySection title="Appearance" summary={`${height}px, ${styleType}`}>
                <PropertyRow label="Height">
                    <PropertySlider
                        value={height || 1}
                        onChange={(v) => setProp((props: DividerProps) => (props.height = v))}
                        min={1}
                        max={10}
                    />
                </PropertyRow>
                <PropertyRow label="Style">
                    <PropertySelect
                        value={styleType || "solid"}
                        onChange={(v) => setProp((props: DividerProps) => (props.styleType = v as DividerProps["styleType"]))}
                        options={[
                            { label: "Solid", value: "solid" },
                            { label: "Dashed", value: "dashed" },
                            { label: "Dotted", value: "dotted" },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Color">
                    <PropertyColor
                        value={color || "#e5e7eb"}
                        onChange={(v) => setProp((props: DividerProps) => (props.color = v))}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Margin" summary={marginSummary} defaultOpen={false}>
                <PropertyRow label="Top">
                    <PropertySlider
                        value={marginTop || 0}
                        onChange={(v) => setProp((props: DividerProps) => {
                            // Update both legacy and new style prop
                            props.marginTop = v
                            if (!props.style) props.style = {}
                            props.style.marginTop = v
                        })}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
                <PropertyRow label="Bottom">
                    <PropertySlider
                        value={marginBottom || 0}
                        onChange={(v) => setProp((props: DividerProps) => {
                            props.marginBottom = v
                            if (!props.style) props.style = {}
                            props.style.marginBottom = v
                        })}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

export const Divider = defineBlock<DividerProps>({
    name: "Divider",
    category: "Basic",
    icon: <Minus className="w-4 h-4" />,
    description: "Horizontal visual separator",

    defaultProps: {
        color: "#e5e7eb",
        height: 1,
        styleType: "solid",
        style: defaultStyles,
        // Legacy defaults
        marginTop: 16,
        marginBottom: 16,
    },

    settings: DividerSettings,

    render: ({ color, height, styleType, style, className, theme, ...props }) => {
        // Merge legacy margin props if they exist and aren't in style yet
        const effectiveStyle = {
            ...style,
            marginTop: props.marginTop ?? style?.marginTop,
            marginBottom: props.marginBottom ?? style?.marginBottom,

            // Divider specific styles
            width: "100%",
            height,
            backgroundColor: styleType === "solid" ? color : "transparent",
            borderTop: styleType !== "solid" ? `${height}px ${styleType} ${color}` : "none",
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: effectiveStyle,
            className
        })

        return (
            <hr
                className={computedClassName}
                style={computedStyle}
            />
        )
    },

    childrenAllowed: false
})
