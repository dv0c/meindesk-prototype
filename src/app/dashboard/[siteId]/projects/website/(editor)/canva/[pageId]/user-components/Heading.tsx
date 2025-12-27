"use client"

import { useNode, useEditor } from "@craftjs/core"
import React from "react"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyColor,
    PropertyInput,
    PropertySelect,
    PropertyButtonGroup,
} from "../components/PropertySection"
import { useInlineEdit } from "../lib/withCraftComponent"

interface HeadingProps {
    text?: string
    level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    fontSize?: number
    fontWeight?: string
    color?: string
    textAlign?: "left" | "center" | "right"
    marginTop?: string | number
    marginRight?: string | number
    marginBottom?: string | number
    marginLeft?: string | number
    paddingTop?: string | number
    paddingRight?: string | number
    paddingBottom?: string | number
    paddingLeft?: string | number
    backgroundColor?: string
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    boxShadow?: string
    className?: string
}

export const Heading = ({
    text = "Heading",
    level = "h2",
    fontSize = 32,
    fontWeight = "700",
    color = "#000000",
    textAlign = "left",
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    backgroundColor,
    borderRadius,
    borderWidth,
    borderColor,
    boxShadow,
    className = "",
}: HeadingProps) => {
    const {
        isEditing,
        refCallback,
        editableProps,
        editableStyle,
    } = useInlineEdit<HTMLHeadingElement>("text", text || "")

    const Tag = level

    const style: React.CSSProperties = {
        width: "100%",
        fontSize,
        fontWeight: "var(--design-font-weight-heading, " + fontWeight + ")",
        fontFamily: "var(--design-font-heading, inherit)",
        color: color === "#000000" ? "var(--design-neutral, #000000)" : color,
        textAlign,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        backgroundColor,
        borderRadius: borderRadius ? `${borderRadius}px` : undefined,
        borderWidth: borderWidth ? `${borderWidth}px` : undefined,
        borderColor,
        borderStyle: borderWidth ? "solid" : undefined,
        boxShadow,
        lineHeight: 1.2,
        ...editableStyle,
    }

    return (
        <Tag
            ref={refCallback}
            className={className}
            style={style}
            {...editableProps}
        >
            {text}
        </Tag>
    )
}

// Settings component for Heading
export const HeadingSettings = () => {
    const {
        actions: { setProp },
        text,
        level,
        fontSize,
        fontWeight,
        color,
        textAlign,
        marginTop,
        marginBottom,
    } = useNode((node) => ({
        text: node.data.props.text,
        level: node.data.props.level,
        fontSize: node.data.props.fontSize,
        fontWeight: node.data.props.fontWeight,
        color: node.data.props.color,
        textAlign: node.data.props.textAlign,
        marginTop: node.data.props.marginTop,
        marginBottom: node.data.props.marginBottom,
    }))

    const fontWeightLabel = {
        "400": "Regular",
        "500": "Medium",
        "600": "Semibold",
        "700": "Bold",
        "800": "Extra Bold",
    }[fontWeight || "700"] || "Bold"

    const typographySummary = `${fontSize}px, ${fontWeightLabel}, ${textAlign}`


    return (
        <div>
            <PropertySection title="Content">
                <PropertyRow label="Text">
                    <PropertyInput
                        value={text || ""}
                        onChange={(v) => setProp((props: HeadingProps) => (props.text = v))}
                    />
                </PropertyRow>
                <PropertyRow label="Level">
                    <PropertySelect
                        value={level || "h2"}
                        onChange={(v) => {
                            setProp((props: HeadingProps) => {
                                props.level = v as HeadingProps["level"]
                                // Update font size based on level
                                const sizes: Record<string, number> = {
                                    h1: 48,
                                    h2: 32,
                                    h3: 24,
                                    h4: 20,
                                    h5: 18,
                                    h6: 16,
                                }
                                if (v && sizes[v]) {
                                    props.fontSize = sizes[v]
                                }
                            })
                        }}
                        options={[
                            { label: "H1", value: "h1" },
                            { label: "H2", value: "h2" },
                            { label: "H3", value: "h3" },
                            { label: "H4", value: "h4" },
                            { label: "H5", value: "h5" },
                            { label: "H6", value: "h6" },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Typography" summary={typographySummary}>
                <PropertyRow label="Font Size">
                    <PropertySlider
                        value={fontSize || 32}
                        onChange={(v) => setProp((props: HeadingProps) => (props.fontSize = v))}
                        min={12}
                        max={120}
                    />
                </PropertyRow>
                <PropertyRow label="Font Weight">
                    <PropertySelect
                        value={fontWeight || "700"}
                        onChange={(v) => setProp((props: HeadingProps) => (props.fontWeight = v))}
                        options={[
                            { label: "Regular", value: "400" },
                            { label: "Medium", value: "500" },
                            { label: "Semibold", value: "600" },
                            { label: "Bold", value: "700" },
                            { label: "Extra Bold", value: "800" },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Text Align">
                    <PropertyButtonGroup
                        value={textAlign || "left"}
                        onChange={(v) => setProp((props: HeadingProps) => (props.textAlign = v as HeadingProps["textAlign"]))}
                        options={[
                            { label: "Left", value: "left" },
                            { label: "Center", value: "center" },
                            { label: "Right", value: "right" },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Appearance">
                <PropertyRow label="Color">
                    <PropertyColor
                        value={color || "#000000"}
                        onChange={(v) => setProp((props: HeadingProps) => (props.color = v))}
                    />
                </PropertyRow>
            </PropertySection>


        </div>
    )
}

Heading.craft = {
    displayName: "Heading",
    props: {
        text: "Heading",
        level: "h2",
        fontSize: 32,
        fontWeight: "700",
        color: "#000000",
        textAlign: "left",
        marginTop: 0,
        marginBottom: 16,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: HeadingSettings,
    },
}
