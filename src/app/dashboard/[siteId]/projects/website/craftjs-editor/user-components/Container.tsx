"use client"

import { useNode, useEditor } from "@craftjs/core"
import React from "react"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertySliderWithUnit,
    PropertyColor,
    PropertyInput,
    PropertySelect,
} from "../components/PropertySection"


interface ContainerProps {
    children?: React.ReactNode
    padding?: number // Legacy padding, used for empty state calculation
    backgroundColor?: string
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    minHeight?: number | string
    maxWidth?: string
    className?: string
    gap?: number
    flexDirection?: "row" | "column"
    alignItems?: "flex-start" | "center" | "flex-end" | "stretch"
    justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around"

    // Global Decoration
    marginTop?: string
    marginRight?: string
    marginBottom?: string
    marginLeft?: string
    paddingTop?: string
    paddingRight?: string
    paddingBottom?: string
    paddingLeft?: string
    boxShadow?: string
}

export const Container = ({
    children,
    padding = 20, // Legacy padding, kept for empty state calculation
    backgroundColor = "transparent",
    borderRadius = 0,
    borderWidth = 0,
    borderColor = "#e5e7eb",
    minHeight = "100px",
    maxWidth = "100%",
    className = "",
    gap = 0,
    flexDirection = "column",
    alignItems = "flex-start",
    justifyContent = "flex-start",
    marginTop, marginRight, marginBottom, marginLeft,
    paddingTop, paddingRight, paddingBottom, paddingLeft,
    boxShadow,
}: ContainerProps) => {
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
        backgroundColor,
        borderRadius: `${borderRadius}px`,
        border: `${borderWidth}px solid ${borderColor}`,
        minHeight,
        maxWidth,
        width: "100%",
        position: "relative" as const,
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection,
        gap: `${gap}px`,
        alignItems,
        justifyContent,
        boxShadow,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
    }

    // Check if container is empty
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
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: `calc(${minHeight} - ${padding * 2}px)`, // Use legacy padding for empty state
                        border: "2px dashed #e5e7eb",
                        borderRadius: 8,
                        color: "#9ca3af",
                        fontSize: 14,
                        fontWeight: 500,
                        padding: 20,
                        textAlign: "center",
                    }}
                >
                    Drop components here
                </div>
            ) : (
                children
            )}
        </div>
    )
}

// Settings component for Container with sections
export const ContainerSettings = () => {
    const {
        actions: { setProp },
        padding, // Kept for summary/empty state calculation
        backgroundColor, // Kept for summary
        borderRadius, // Kept for summary
        minHeight,
        maxWidth,
        borderWidth, // Kept for summary
        borderColor, // Kept for summary
        gap,
        flexDirection,
        alignItems,
        justifyContent,
    } = useNode((node) => ({
        padding: node.data.props.padding,
        backgroundColor: node.data.props.backgroundColor,
        borderRadius: node.data.props.borderRadius,
        minHeight: node.data.props.minHeight,
        maxWidth: node.data.props.maxWidth,
        borderWidth: node.data.props.borderWidth,
        borderColor: node.data.props.borderColor,
        gap: node.data.props.gap,
        flexDirection: node.data.props.flexDirection,
        alignItems: node.data.props.alignItems,
        justifyContent: node.data.props.justifyContent,
    }))

    // Parse value with unit helper
    const parseValueWithUnit = (val: string | number | undefined, defaultUnit = 'px', defaultValue = 0): { value: number; unit: string } => {
        if (typeof val === 'number') return { value: val, unit: 'px' }
        if (!val) return { value: defaultValue, unit: defaultUnit }
        const match = val.match(/^([\d.]+)(px|%|rem|vw)?$/)
        if (match) {
            return { value: parseFloat(match[1]) || 0, unit: match[2] || 'px' }
        }
        return { value: defaultValue, unit: defaultUnit }
    }

    const { value: maxWidthValue, unit: maxWidthUnit } = parseValueWithUnit(maxWidth, '%', 100)
    const { value: minHeightValue, unit: minHeightUnit } = parseValueWithUnit(minHeight, 'px', 100)

    const dimensionsSummary = `${maxWidth || "100%"} × ${minHeight || "100px"}`
    const borderSummary = borderWidth ? `${borderWidth}px` : "None"

    return (
        <div>


            <PropertySection title="Dimensions" summary={dimensionsSummary}>
                <PropertyRow label="Max Width">
                    <PropertySliderWithUnit
                        value={maxWidthValue}
                        unit={maxWidthUnit}
                        onChange={(v, u) => setProp((props: ContainerProps) => (props.maxWidth = `${v}${u}`))}
                    />
                </PropertyRow>
                <PropertyRow label="Min Height">
                    <PropertySliderWithUnit
                        value={minHeightValue}
                        unit={minHeightUnit}
                        onChange={(v, u) => setProp((props: ContainerProps) => (props.minHeight = `${v}${u}`))}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Layout" summary={`${flexDirection} ${gap}px`}>
                <PropertyRow label="Direction">
                    <PropertySelect
                        value={flexDirection || "column"}
                        onChange={(v) => setProp((props: ContainerProps) => (props.flexDirection = v))}
                        options={[
                            { label: "Column", value: "column" },
                            { label: "Row", value: "row" },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Gap">
                    <PropertySlider
                        value={gap || 0}
                        onChange={(v) => setProp((props: ContainerProps) => (props.gap = v))}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
                <PropertyRow label="Align Items">
                    <PropertySelect
                        value={alignItems || "flex-start"}
                        onChange={(v) => setProp((props: ContainerProps) => (props.alignItems = v))}
                        options={[
                            { label: "Start", value: "flex-start" },
                            { label: "Center", value: "center" },
                            { label: "End", value: "flex-end" },
                            { label: "Stretch", value: "stretch" },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Justify Content">
                    <PropertySelect
                        value={justifyContent || "flex-start"}
                        onChange={(v) => setProp((props: ContainerProps) => (props.justifyContent = v))}
                        options={[
                            { label: "Start", value: "flex-start" },
                            { label: "Center", value: "center" },
                            { label: "End", value: "flex-end" },
                            { label: "Between", value: "space-between" },
                            { label: "Around", value: "space-around" },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

Container.craft = {
    displayName: "Container",
    props: {
        padding: 20, // Kept for empty state calculation
        backgroundColor: "transparent",
        borderRadius: 0,
        minHeight: "100px",
        maxWidth: "100%",
        borderWidth: 0,
        borderColor: "#e5e7eb",
        gap: 0,
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginTop: undefined,
        marginRight: undefined,
        marginBottom: undefined,
        marginLeft: undefined,
        paddingTop: undefined,
        paddingRight: undefined,
        paddingBottom: undefined,
        paddingLeft: undefined,
        boxShadow: undefined,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: ContainerSettings,
    },
}
