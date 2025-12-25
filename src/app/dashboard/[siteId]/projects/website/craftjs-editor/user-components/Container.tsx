"use client"

import { useNode } from "@craftjs/core"
import React from "react"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertySliderWithUnit,
    PropertyColor,
    PropertyInput,
} from "../components/PropertySection"

interface ContainerProps {
    children?: React.ReactNode
    padding?: number
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
    backgroundColor?: string
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    minHeight?: number | string
    maxWidth?: string
    className?: string
}

export const Container = ({
    children,
    padding = 20,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    backgroundColor = "transparent",
    borderRadius = 0,
    borderWidth = 0,
    borderColor = "#e5e7eb",
    minHeight = "100px",
    maxWidth = "100%",
    className = "",
}: ContainerProps) => {
    const {
        connectors: { connect, drag },
        selected,
    } = useNode((state) => ({
        selected: state.events.selected,
    }))

    const style: React.CSSProperties = {
        padding: padding,
        paddingTop: paddingTop ?? padding,
        paddingBottom: paddingBottom ?? padding,
        paddingLeft: paddingLeft ?? padding,
        paddingRight: paddingRight ?? padding,
        backgroundColor,
        borderRadius,
        borderWidth,
        borderColor,
        borderStyle: borderWidth > 0 ? "solid" : "none",
        minHeight,
        maxWidth,
        width: "100%",
        position: "relative" as const,
        transition: "all 0.2s ease",
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
            {isEmpty ? (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: minHeight - (padding * 2),
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
        padding,
        backgroundColor,
        borderRadius,
        minHeight,
        maxWidth,
        borderWidth,
        borderColor,
    } = useNode((node) => ({
        padding: node.data.props.padding,
        backgroundColor: node.data.props.backgroundColor,
        borderRadius: node.data.props.borderRadius,
        minHeight: node.data.props.minHeight,
        maxWidth: node.data.props.maxWidth,
        borderWidth: node.data.props.borderWidth,
        borderColor: node.data.props.borderColor,
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

    const paddingSummary = `${padding || 0}px`
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

            <PropertySection title="Padding" summary={paddingSummary}>
                <PropertyRow label="All Sides">
                    <PropertySlider
                        value={padding || 0}
                        onChange={(v) => setProp((props: ContainerProps) => (props.padding = v))}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Colors" summary="">
                <PropertyRow label="Background">
                    <PropertyColor
                        value={backgroundColor || ""}
                        onChange={(v) => setProp((props: ContainerProps) => (props.backgroundColor = v))}
                        placeholder="transparent"
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Border" summary={borderSummary} defaultOpen={false}>
                <PropertyRow label="Width">
                    <PropertySlider
                        value={borderWidth || 0}
                        onChange={(v) => setProp((props: ContainerProps) => (props.borderWidth = v))}
                        min={0}
                        max={10}
                    />
                </PropertyRow>
                <PropertyRow label="Radius">
                    <PropertySlider
                        value={borderRadius || 0}
                        onChange={(v) => setProp((props: ContainerProps) => (props.borderRadius = v))}
                        min={0}
                        max={50}
                    />
                </PropertyRow>
                <PropertyRow label="Color">
                    <PropertyColor
                        value={borderColor || "#e5e7eb"}
                        onChange={(v) => setProp((props: ContainerProps) => (props.borderColor = v))}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

Container.craft = {
    displayName: "Container",
    props: {
        padding: 20,
        backgroundColor: "transparent",
        borderRadius: 0,
        minHeight: "100px",
        maxWidth: "100%",
        borderWidth: 0,
        borderColor: "#e5e7eb",
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: ContainerSettings,
    },
}
