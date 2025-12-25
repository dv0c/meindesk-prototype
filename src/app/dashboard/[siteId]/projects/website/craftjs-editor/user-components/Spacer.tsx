"use client"

import { useNode } from "@craftjs/core"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyButtonGroup,
} from "../components/PropertySection"

interface SpacerProps {
    height?: number
    className?: string
}

export const Spacer = ({
    height = 40,
    className = "",
}: SpacerProps) => {
    const {
        connectors: { connect, drag },
        selected,
    } = useNode((state) => ({
        selected: state.events.selected,
    }))

    const style: React.CSSProperties = {
        height,
        width: "100%",
    }

    return (
        <div
            ref={(ref) => {
                if (ref) connect(drag(ref))
            }}
            className={`${className} ${selected ? "bg-muted/20" : ""}`}
            style={style}
        />
    )
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

Spacer.craft = {
    displayName: "Spacer",
    props: {
        height: 40,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: SpacerSettings,
    },
}
