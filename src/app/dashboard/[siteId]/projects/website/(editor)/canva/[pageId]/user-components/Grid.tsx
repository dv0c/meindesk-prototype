"use client"

import { useNode, useEditor } from "@craftjs/core"
import React from "react"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyColor,
    PropertyButtonGroup,
    PropertySliderWithUnit,
} from "../components/PropertySection"
import { toast } from "sonner"

interface GridProps {
    children?: React.ReactNode
    columns?: number
    gap?: number
    padding?: number
    backgroundColor?: string
    className?: string
    maxWidth?: string
}

export const Grid = ({
    children,
    columns = 2,
    gap = 16,
    padding = 0,
    backgroundColor = "transparent",
    className = "",
    maxWidth = "100%",
}: GridProps) => {
    const {
        connectors: { connect, drag },
        nodeIds,
        id,
    } = useNode((node) => ({
        nodeIds: node.data.nodes || [],
        id: node.id,
    }))

    const { enabled, actions } = useEditor((state) => ({
        enabled: state.options.enabled,
    }))

    // The actual child count from CraftJS node data
    const childCount = nodeIds.length

    // Check if grid is full
    const isFull = childCount >= columns

    // Auto-delete excess children when they exceed column count
    React.useEffect(() => {
        if (enabled && childCount > columns) {
            // Get the extra node IDs (beyond the column limit)
            const extraNodes = nodeIds.slice(columns)
            // Delete each extra node
            extraNodes.forEach((nodeId: string) => {
                try {
                    actions.delete(nodeId)
                    toast.info(`You can't add more than ${columns} columns`)
                } catch (e) {
                    console.log('Could not delete extra node:', nodeId)
                }
            })
        }
    }, [childCount, columns, nodeIds, enabled, actions])

    // Only show placeholders to fill the FIRST row if it's incomplete
    const emptySlots = isFull ? 0 : columns - childCount

    const style: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
        padding,
        backgroundColor,
        minHeight: 80,
        maxWidth,
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
        position: "relative",
    }

    // Placeholder component for empty slots
    const PlaceholderSlot = ({ index }: { index: number }) => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 160,
                border: "2px dashed var(--design-border-color, #e5e7eb)",
                borderRadius: 8,
                color: "var(--design-text-color, #9ca3af)",
                fontSize: 12,
                fontWeight: 500,
                padding: 16,
                textAlign: "center",
                opacity: 0.7,
            }}
        >
            Drop here
        </div>
    )

    // Limit children to only show up to the column count
    const limitedChildren = React.Children.toArray(children).slice(0, columns)

    return (
        <div
            ref={(ref: any) => connect(drag(ref))}
            className={className}
            style={style}
        >
            {/* Only render children up to the column limit */}
            {limitedChildren}

            {/* Render placeholder slots for empty columns (only in editor mode) */}
            {enabled && emptySlots > 0 &&
                Array.from({ length: emptySlots }).map((_, i) => (
                    <PlaceholderSlot key={`placeholder-${i}`} index={childCount + i} />
                ))
            }
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
        maxWidth,
    } = useNode((node) => ({
        columns: node.data.props.columns,
        gap: node.data.props.gap,
        padding: node.data.props.padding,
        backgroundColor: node.data.props.backgroundColor,
        maxWidth: node.data.props.maxWidth,
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
                            { label: "12", value: "12" },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Max Width">
                    <PropertySliderWithUnit
                        value={maxWidthValue}
                        unit={maxWidthUnit}
                        onChange={(v, u) => setProp((props: GridProps) => (props.maxWidth = `${v}${u}`))}
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
        maxWidth: "100%",
    },
    rules: {
        canDrag: () => true,
        // Limit children to the number of columns
        canMoveIn: (incomingNodes: any[], currentNode: any, helpers: any) => {
            const columns = currentNode.data.props?.columns || 2
            // Use helpers to get the descendants/children count
            const currentChildren = currentNode.data.nodes?.length || 0
            const canDrop = currentChildren + incomingNodes.length <= columns
            console.log('canMoveIn check:', { columns, currentChildren, incoming: incomingNodes.length, canDrop })
            return canDrop
        },
    },
    related: {
        settings: GridSettings,
    },
}
