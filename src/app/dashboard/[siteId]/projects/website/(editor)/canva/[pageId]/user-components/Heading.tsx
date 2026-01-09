"use client"

import React from "react"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { Heading as HeadingIcon } from "lucide-react"
import { EditableText } from "./EditableText"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertySelect,
} from "../components/PropertySection"
import { useNode } from "@craftjs/core"

interface HeadingProps {
    text?: string
    level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    style?: BlockStyle
    className?: string
    // Legacy props
    fontSize?: number
    fontWeight?: string
    color?: string
    textAlign?: "left" | "center" | "right" | "justify"
    marginBottom?: number
}

const defaultStyles: BlockStyle = {
    width: "100%",
    lineHeight: 1.2,
    fontWeight: "700",
    marginBottom: 16,
}

// Settings Component
export const HeadingSettings = () => {
    const {
        actions: { setProp },
        text,
        level,
        style,
        fontSize,
        fontWeight
    } = useNode((node) => ({
        text: node.data.props.text,
        level: node.data.props.level,
        style: node.data.props.style,
        fontSize: node.data.props.fontSize ?? node.data.props.style?.fontSize,
        fontWeight: node.data.props.fontWeight ?? node.data.props.style?.fontWeight,
    }))

    return (
        <div>
            <PropertySection title="Content">
                <PropertyRow label="Level">
                    <PropertySelect
                        value={level || "h2"}
                        onChange={(v) => setProp((props: HeadingProps) => (props.level = v as any))}
                        options={[
                            { label: "H1 - Main Title", value: "h1" },
                            { label: "H2 - Section Title", value: "h2" },
                            { label: "H3 - Subsection", value: "h3" },
                            { label: "H4 - Small Heading", value: "h4" },
                            { label: "H5 - Minor Heading", value: "h5" },
                            { label: "H6 - Smallest", value: "h6" },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Typography">
                <PropertyRow label="Font Size">
                    <PropertySlider
                        value={parseInt(String(fontSize || 32))}
                        onChange={(v) => setProp((props: HeadingProps) => {
                            props.fontSize = v
                            if (!props.style) props.style = {}
                            props.style.fontSize = v
                        })}
                        min={12}
                        max={120}
                    />
                </PropertyRow>
                <PropertyRow label="Weight">
                    <PropertySelect
                        value={String(fontWeight) || "700"}
                        onChange={(v) => setProp((props: HeadingProps) => {
                            props.fontWeight = v
                            if (!props.style) props.style = {}
                            props.style.fontWeight = v
                        })}
                        options={[
                            { label: "Regular", value: "400" },
                            { label: "Medium", value: "500" },
                            { label: "Semibold", value: "600" },
                            { label: "Bold", value: "700" },
                            { label: "Extra Bold", value: "800" },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

export const Heading = defineBlock<HeadingProps>({
    name: "Heading",
    category: "Typography",
    icon: <HeadingIcon className="w-4 h-4" />,
    description: "Headings for titles and sections",

    defaultProps: {
        text: "Heading",
        level: "h2",
        style: defaultStyles,
        // Legacy props for compatibility
        fontSize: 32,
        fontWeight: "700",
        marginBottom: 16,
    },

    settings: HeadingSettings,

    render: ({ text, level = "h2", style, className, theme, ...props }) => {
        // Fluid typography logic matching defaultStyles
        let fluidFontSize = style?.fontSize

        // Use legacy fontSize if present and not in style
        const fontSizeVal = props.fontSize ?? style?.fontSize ?? 32

        if (typeof fontSizeVal === 'number') {
            const minFontSize = Math.max(12, fontSizeVal * 0.3)
            const vwValue = fontSizeVal * 0.08
            fluidFontSize = `clamp(${minFontSize / 16}rem, ${vwValue}vw + 0.5rem, ${fontSizeVal / 16}rem)`
        }

        const effectiveStyle: BlockStyle = {
            ...style,
            fontSize: fluidFontSize,
            fontWeight: props.fontWeight ?? style?.fontWeight ?? `var(--design-font-weight-heading, 700)`,
            color: props.color ?? style?.color ?? "var(--design-neutral, inherit)",
            textAlign: props.textAlign ?? style?.textAlign,
            marginBottom: props.marginBottom ?? style?.marginBottom,

            // Design token defaults
            fontFamily: "var(--design-font-heading, inherit)",
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: effectiveStyle,
            className
        })

        return (
            <div className={computedClassName} style={computedStyle}>
                <EditableText
                    propName="text"
                    value={text || ""}
                    as={level}
                    style={{
                        display: "block",
                        margin: 0,
                        // Ensure editable text inherits styles correctly
                        fontFamily: 'inherit',
                        fontWeight: 'inherit',
                        fontSize: 'inherit',
                        color: 'inherit',
                        lineHeight: 'inherit',
                        textAlign: 'inherit'
                    }}
                />
            </div>
        )
    },

    childrenAllowed: false
})
