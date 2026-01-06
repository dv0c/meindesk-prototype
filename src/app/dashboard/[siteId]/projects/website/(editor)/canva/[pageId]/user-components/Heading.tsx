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
            color,
            textAlign,
            className = "",
            ...styleProps
        },
        ref
    ) => {
        // Fluid typography: scales with viewport between min and max
        const minFontSize = Math.max(12, fontSize * 0.3) // Minimum 30% or 12px for headings
        const vwValue = fontSize * 0.08 // 8% of font size as vw scaling factor
        const fluidFontSize = `clamp(${minFontSize / 16}rem, ${vwValue}vw + 0.5rem, ${fontSize / 16}rem)`

        const baseStyle = propsToStyle({
            fontWeight,
            color: color || "var(--design-neutral, inherit)",
            textAlign,
            ...styleProps,
        })

        const style: React.CSSProperties = {
            width: "100%",
            fontSize: fluidFontSize,
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

// Wrap with CraftJS functionality
// Now using the new standard system:
// - Style settings (color, spacing, etc.) are auto-included
// - Only content-specific settings need to be defined
export const Heading = withCraftComponent<HeadingProps, HTMLDivElement>(
    HeadingBase,
    {
        displayName: "Heading",

        // Component-specific defaults (style defaults are auto-merged from STANDARD_DEFAULTS)
        defaultProps: {
            text: "Heading",
            level: "h2",
            fontSize: 32,
            fontWeight: "700",
            marginBottom: 16,
        },

        sectionTitle: "Content",

        // Only content-specific settings - styles are in the auto-included Styles panels
        settingsConfig: {
            text: { type: "text", label: "Text" },
            level: {
                type: "select",
                label: "Heading Level",
                options: [
                    { label: "H1 - Main Title", value: "h1" },
                    { label: "H2 - Section Title", value: "h2" },
                    { label: "H3 - Subsection", value: "h3" },
                    { label: "H4 - Small Heading", value: "h4" },
                    { label: "H5 - Minor Heading", value: "h5" },
                    { label: "H6 - Smallest", value: "h6" },
                ],
            },
            fontSize: {
                type: "slider",
                label: "Font Size",
                min: 12,
                max: 120,
                section: "Typography"
            },
            fontWeight: {
                type: "select",
                label: "Font Weight",
                section: "Typography",
                options: [
                    { label: "Regular", value: "400" },
                    { label: "Medium", value: "500" },
                    { label: "Semibold", value: "600" },
                    { label: "Bold", value: "700" },
                    { label: "Extra Bold", value: "800" },
                ],
            },
        },

        // Style settings auto-included (default: true)
        // includeStyleSettings: true,  // Already default

    }
)
