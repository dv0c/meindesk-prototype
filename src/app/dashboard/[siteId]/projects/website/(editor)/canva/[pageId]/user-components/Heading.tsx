"use client"

import React, { forwardRef } from "react"
import {
    withCraftComponent,
    CraftComponentProps,
    EditableText,
    propsToStyle,
} from "../lib/withCraftComponent"

interface HeadingProps extends CraftComponentProps {
    text?: string
    level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

// Base component with forwardRef
const HeadingBase = forwardRef<HTMLDivElement, HeadingProps>(
    (
        {
            text = "Heading",
            level = "h2",
            fontSize = 32,
            fontWeight = "700",
            color = "#000000",
            textAlign = "left",
            className = "",
            ...styleProps
        },
        ref
    ) => {
        const baseStyle = propsToStyle({
            fontSize,
            fontWeight,
            color: color === "#000000" ? "var(--design-neutral, #000000)" : color,
            textAlign,
            ...styleProps,
        })

        const style: React.CSSProperties = {
            width: "100%",
            fontWeight: `var(--design-font-weight-heading, ${fontWeight})`,
            fontFamily: "var(--design-font-heading, inherit)",
            lineHeight: 1.2,
            ...baseStyle,
        }

        return (
            <div ref={ref} className={className} style={style}>
                <EditableText
                    propName="text"
                    value={text || ""}
                    as={level}
                    style={{ display: "block", margin: 0 }}
                />
            </div>
        )
    }
)

HeadingBase.displayName = "HeadingBase"

// Default props for the component
const defaultProps: Partial<HeadingProps> = {
    text: "Heading",
    level: "h2",
    fontSize: 32,
    fontWeight: "700",
    color: "#000000",
    textAlign: "left",
    marginTop: 0,
    marginBottom: 16,
}

// Wrap with CraftJS functionality
export const Heading = withCraftComponent<HeadingProps, HTMLDivElement>(
    HeadingBase,
    {
        displayName: "Heading",
        defaultProps,
        sectionTitle: "Heading",
        settingsConfig: {
            text: { type: "text", label: "Text" },
            level: {
                type: "select",
                label: "Level",
                options: [
                    { label: "H1", value: "h1" },
                    { label: "H2", value: "h2" },
                    { label: "H3", value: "h3" },
                    { label: "H4", value: "h4" },
                    { label: "H5", value: "h5" },
                    { label: "H6", value: "h6" },
                ],
            },
            fontSize: { type: "slider", label: "Font Size", min: 12, max: 120 },
            fontWeight: {
                type: "select",
                label: "Font Weight",
                options: [
                    { label: "Regular", value: "400" },
                    { label: "Medium", value: "500" },
                    { label: "Semibold", value: "600" },
                    { label: "Bold", value: "700" },
                    { label: "Extra Bold", value: "800" },
                ],
            },
            textAlign: {
                type: "select",
                label: "Text Align",
                options: [
                    { label: "Left", value: "left" },
                    { label: "Center", value: "center" },
                    { label: "Right", value: "right" },
                ],
            },
            color: { type: "color", label: "Color" },
        },
    }
)
