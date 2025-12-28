"use client"

import React, { forwardRef } from "react"
import {
    withCraftComponent,
    CraftComponentProps,
    propsToStyle,
} from "../../../lib/withCraftComponent"
import { AnimatedNoise } from "./animated-noise"

interface MeindeskContainerProps extends CraftComponentProps {
    children?: React.ReactNode
    enableGrid?: boolean
    gridOpacity?: number
    enableNoise?: boolean
    noiseOpacity?: number
}

const MeindeskContainerBase = forwardRef<HTMLDivElement, MeindeskContainerProps>(
    (
        {
            children,
            enableGrid = true,
            gridOpacity = 30,
            enableNoise = true,
            noiseOpacity = 3,
            className = "",
            ...styleProps
        },
        ref
    ) => {
        const baseStyle = propsToStyle(styleProps)

        const containerStyle: React.CSSProperties = {
            position: "relative",
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: styleProps.backgroundColor || "transparent",
            ...baseStyle,
        }

        return (
            <div ref={ref} className={className} style={containerStyle}>
                {/* Grid background overlay */}
                {enableGrid && (
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, ${gridOpacity / 100}) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, ${gridOpacity / 100}) 1px, transparent 1px)`,
                            backgroundSize: "60px 60px",
                            opacity: gridOpacity / 100,
                        }}
                        aria-hidden="true"
                    />
                )}

                {/* Animated Noise overlay */}
                {enableNoise && <AnimatedNoise opacity={noiseOpacity / 100} />}

                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col">
                    {children}
                </div>
            </div>
        )
    }
)

MeindeskContainerBase.displayName = "MeindeskContainerBase"

const defaultProps: Partial<MeindeskContainerProps> = {
    enableGrid: true,
    gridOpacity: 30,
    enableNoise: true,
    noiseOpacity: 3,
    minHeight: "100vh",
    paddingTop: 0,
    paddingBottom: 0,
}

export const MeindeskContainer = withCraftComponent<MeindeskContainerProps, HTMLDivElement>(
    MeindeskContainerBase,
    {
        displayName: "Meindesk Container",
        defaultProps,
        sectionTitle: "Background Settings",
        settingsConfig: {
            enableGrid: { type: "checkbox", label: "Enable Grid Background" },
            gridOpacity: {
                type: "slider",
                label: "Grid Opacity (%)",
                min: 0,
                max: 100,
                step: 1,
            },
            enableNoise: { type: "checkbox", label: "Enable Noise Animation" },
            noiseOpacity: {
                type: "slider",
                label: "Noise Opacity (%)",
                min: 0,
                max: 20,
                step: 1,
            },
        },
    }
)
