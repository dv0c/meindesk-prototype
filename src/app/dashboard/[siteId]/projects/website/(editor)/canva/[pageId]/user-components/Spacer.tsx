"use client"

import { useNode } from "@craftjs/core"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyButtonGroup,
} from "../components/PropertySection"
import { MoveVertical } from "lucide-react"

interface SpacerProps {
    height?: number
    className?: string
    style?: BlockStyle
}

// Settings component for Spacer
export const SpacerSettings = () => {
    const {
        actions: { setProp },
        height,
    } = useNode((node) => ({
        height: node.data.props.height,
    }))

    return (
        <div>
            <PropertySection title="Dimensions" summary={`${height}px`}>
                <PropertyRow label="Height">
                    <PropertySlider
                        value={height || 40}
                        onChange={(v) => setProp((props: SpacerProps) => (props.height = v))}
                        min={0}
                        max={200}
                    />
                </PropertyRow>
                <PropertyRow label="Quick Presets">
                    <PropertyButtonGroup
                        value={String(height || 40)}
                        onChange={(v) => setProp((props: SpacerProps) => (props.height = parseInt(v)))}
                        options={[
                            { label: "20", value: "20" },
                            { label: "40", value: "40" },
                            { label: "60", value: "60" },
                            { label: "80", value: "80" },
                            { label: "100", value: "100" },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

export const Spacer = defineBlock<SpacerProps>({
    name: "Spacer",
    category: "Layout",
    icon: <MoveVertical className="w-4 h-4" />,
    description: "Vertical spacing helper",

    defaultProps: {
        height: 40,
        style: {}
    },

    settings: SpacerSettings,

    render: ({ height, className, style, theme }) => {
        const { selected } = useNode((node) => ({
            selected: node.events.selected
        }))

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: {
                ...style,
                height,
                width: "100%",
            },
            className: `${className || ""} ${selected ? "bg-muted/20" : ""}`
        })

        return (
            <div
                className={computedClassName}
                style={computedStyle}
            />
        )
    },

    childrenAllowed: false
})
