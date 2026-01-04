"use client"

import { useNode } from "@craftjs/core"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyColor,
    PropertySelect,
} from "../components/PropertySection"

interface DividerProps {
    color?: string
    height?: number
    marginTop?: number
    marginBottom?: number
    style?: "solid" | "dashed" | "dotted"
    className?: string
}

export const Divider = ({
    color = "#e5e7eb",
    height = 1,
    marginTop = 16,
    marginBottom = 16,
    style = "solid",
    className = "",
}: DividerProps) => {
    const {
        connectors: { connect, drag },
    } = useNode()

    const dividerStyle: React.CSSProperties = {
        width: "100%",
        height,
        backgroundColor: style === "solid" ? color : "transparent",
        borderTop: style !== "solid" ? `${height}px ${style} ${color}` : "none",
        marginTop,
        marginBottom,
    }

    return (
        <hr
            ref={(ref: any) => connect(drag(ref))}
            className={className}
            style={dividerStyle}
        />
    )
}

// Settings component for Divider
export const DividerSettings = () => {
    const {
        actions: { setProp },
        color,
        height,
        marginTop,
        marginBottom,
        style,
    } = useNode((node) => ({
        color: node.data.props.color,
        height: node.data.props.height,
        marginTop: node.data.props.marginTop,
        marginBottom: node.data.props.marginBottom,
        style: node.data.props.style,
    }))

    const marginSummary = `${marginTop || 0}px ${marginBottom || 0}px`

    return (
        <div>
            <PropertySection title="Appearance" summary={`${height}px, ${style}`}>
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
                        value={style || "solid"}
                        onChange={(v) => setProp((props: DividerProps) => (props.style = v as DividerProps["style"]))}
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
                        onChange={(v) => setProp((props: DividerProps) => (props.marginTop = v))}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
                <PropertyRow label="Bottom">
                    <PropertySlider
                        value={marginBottom || 0}
                        onChange={(v) => setProp((props: DividerProps) => (props.marginBottom = v))}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

Divider.craft = {
    displayName: "Divider",
    props: {
        color: "#e5e7eb",
        height: 1,
        marginTop: 16,
        marginBottom: 16,
        style: "solid",
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: DividerSettings,
    },
}
