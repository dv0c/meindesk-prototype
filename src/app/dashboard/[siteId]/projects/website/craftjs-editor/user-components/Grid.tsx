"use client"

import { useNode, useEditor } from "@craftjs/core"
import React from "react"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyColor,
    PropertyButtonGroup,
} from "../components/PropertySection"

interface GridProps {
    children?: React.ReactNode
    columns?: number
    gap?: number
    padding?: number
    backgroundColor?: string
    className?: string
}

export const Grid = ({
    children,
    columns = 2,
    gap = 16,
    padding = 0,
    backgroundColor = "transparent",
    className = "",
}: GridProps) => {
    const {
        connectors: { connect, drag },
        selected,
    } = useNode((state) => ({
        selected: state.events.selected,
    }))

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }))

    const style: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        padding,
        backgroundColor,
        minHeight: 80,
    }

    // Check if grid is empty
    const isEmpty = !children || (Array.isArray(children) && children.length === 0) ||
        (React.Children.count(children) === 0)

    return (
        <div
            ref={(ref) => {
                if (ref) connect(drag(ref))
            }}
            className={className}
            style={style}
        >
            {isEmpty && enabled ? (
                // Show placeholder columns
                Array.from({ length: columns }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: 60,
                            border: "2px dashed #e5e7eb",
                            borderRadius: 8,
                            color: "#9ca3af",
                            fontSize: 12,
                            fontWeight: 500,
                            padding: 16,
                            textAlign: "center",
                        }}
                    >
                        Column {i + 1}
                    </div>
                ))
            ) : (
                children
            )}
        </div>
    )
}

// Settings component for Grid
export const GridSettings = () => {
    const {
        actions: { setProp },
        columns,
        gap,
        padding,
        backgroundColor,
    } = useNode((node) => ({
        columns: node.data.props.columns,
        gap: node.data.props.gap,
        padding: node.data.props.padding,
        backgroundColor: node.data.props.backgroundColor,
    }))

    return (
        <div>
            <PropertySection title="Layout" summary={`${columns} columns, ${gap}px gap`}>
                <PropertyRow label="Columns">
                    <PropertyButtonGroup
                        value={String(columns || 2)}
                        onChange={(v) => setProp((props: GridProps) => (props.columns = parseInt(v)))}
                        options={[
                            { label: "1", value: "1" },
                            { label: "2", value: "2" },
                            { label: "3", value: "3" },
                            { label: "4", value: "4" },
                            { label: "6", value: "6" },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Gap">
                    <PropertySlider
                        value={gap || 0}
                        onChange={(v) => setProp((props: GridProps) => (props.gap = v))}
                        min={0}
                        max={64}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Padding" summary={`${padding || 0}px`}>
                <PropertyRow label="All Sides">
                    <PropertySlider
                        value={padding || 0}
                        onChange={(v) => setProp((props: GridProps) => (props.padding = v))}
                        min={0}
                        max={64}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Colors" defaultOpen={false}>
                <PropertyRow label="Background">
                    <PropertyColor
                        value={backgroundColor || ""}
                        onChange={(v) => setProp((props: GridProps) => (props.backgroundColor = v))}
                        placeholder="transparent"
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

Grid.craft = {
    displayName: "Grid",
    props: {
        columns: 2,
        gap: 16,
        padding: 0,
        backgroundColor: "transparent",
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: GridSettings,
    },
}
