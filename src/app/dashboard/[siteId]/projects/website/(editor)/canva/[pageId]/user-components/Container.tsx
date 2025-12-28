"use client"

import { useNode, useEditor } from "@craftjs/core"
import React, { useState } from "react"
import { useParams } from "next/navigation"
import MediaLibraryDialog, { MediaItem } from "@/components/MediaGallery/media-select"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertySliderWithUnit,
    PropertyColor,
    PropertyInput,
    PropertySelect,
    PropertyShadowSelect,
    PropertyIconButtonGroup,
} from "../components/PropertySection"
import { Plus, ArrowRight, ArrowDown, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"


interface ContainerProps {
    children?: React.ReactNode
    padding?: number // Legacy padding, used for empty state calculation
    backgroundColor?: string
    backgroundImage?: string
    backgroundSize?: "cover" | "contain" | "auto"
    backgroundPosition?: string
    backgroundRepeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y"
    enableGrid?: boolean
    gridOpacity?: number
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

// Shared style generator
function getContainerStyle(props: ContainerProps): React.CSSProperties {
    return {
        backgroundColor: props.backgroundColor,
        backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : undefined,
        backgroundSize: props.backgroundSize,
        backgroundPosition: props.backgroundPosition,
        backgroundRepeat: props.backgroundRepeat,
        borderRadius: `${props.borderRadius}px`,
        border: `${props.borderWidth}px solid ${props.borderColor}`,
        minHeight: props.minHeight,
        maxWidth: props.maxWidth,
        width: "100%",
        position: "relative" as const,
        transition: "all 0.2s ease",
        display: "flex",
        flexDirection: props.flexDirection,
        gap: `${props.gap}px`,
        alignItems: props.alignItems,
        justifyContent: props.justifyContent,
        boxShadow: props.boxShadow,
        marginTop: props.marginTop,
        marginRight: props.marginRight,
        marginBottom: props.marginBottom,
        marginLeft: props.marginLeft,
        paddingTop: props.paddingTop,
        paddingRight: props.paddingRight,
        paddingBottom: props.paddingBottom,
        paddingLeft: props.paddingLeft,
    }
}

export const Container = ({
    children,
    padding = 20, // Legacy padding, kept for empty state calculation
    backgroundColor = "transparent",
    backgroundImage,
    backgroundSize = "cover",
    backgroundPosition = "center",
    backgroundRepeat = "no-repeat",
    enableGrid = false,
    gridOpacity = 30,
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
        isApp,
    } = useNode((state) => ({
        selected: state.events.selected,
        isApp: (state.data as any).custom?.displayName === "App",
    }))

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }))

    const style: React.CSSProperties = {
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize,
        backgroundPosition,
        backgroundRepeat,
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
        // Paddings
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
            {isEmpty && enabled ? (
                isApp ? (
                    <div className="text-center space-y-4 max-w-sm m-auto p-8 border-2 border-dashed rounded-xl transition-all duration-200 border-muted-foreground/20 bg-muted/5">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-muted/10">
                            <Plus className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-muted text-lg">Start Building</h3>
                            <p className="text-sm text-muted-foreground">
                                Drag elements from the sidebar to get started.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
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
                )
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
        backgroundColor,
        backgroundImage,
        backgroundSize,
        backgroundPosition,
        backgroundRepeat,
        enableGrid,
        gridOpacity,
        borderRadius,
        borderWidth,
        borderColor,
        minHeight,
        maxWidth,
        gap,
        flexDirection,
        alignItems,
        justifyContent,
        marginTop, marginRight, marginBottom, marginLeft,
        paddingTop, paddingRight, paddingBottom, paddingLeft,
        boxShadow,
    } = useNode((node) => ({
        backgroundColor: node.data.props.backgroundColor,
        backgroundImage: node.data.props.backgroundImage,
        backgroundSize: node.data.props.backgroundSize,
        backgroundPosition: node.data.props.backgroundPosition,
        backgroundRepeat: node.data.props.backgroundRepeat,
        enableGrid: node.data.props.enableGrid,
        gridOpacity: node.data.props.gridOpacity,
        borderRadius: node.data.props.borderRadius,
        borderWidth: node.data.props.borderWidth,
        borderColor: node.data.props.borderColor,
        minHeight: node.data.props.minHeight,
        maxWidth: node.data.props.maxWidth,
        gap: node.data.props.gap,
        flexDirection: node.data.props.flexDirection,
        alignItems: node.data.props.alignItems,
        justifyContent: node.data.props.justifyContent,
        marginTop: node.data.props.marginTop,
        marginRight: node.data.props.marginRight,
        marginBottom: node.data.props.marginBottom,
        marginLeft: node.data.props.marginLeft,
        paddingTop: node.data.props.paddingTop,
        paddingRight: node.data.props.paddingRight,
        paddingBottom: node.data.props.paddingBottom,
        paddingLeft: node.data.props.paddingLeft,
        boxShadow: node.data.props.boxShadow,
    }))

    const params = useParams()
    const siteId = params.siteId as string
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleMediaSelect = (items: MediaItem[]) => {
        if (items.length > 0) {
            const selectedImage = items[0]
            setProp((props: ContainerProps) => {
                props.backgroundImage = selectedImage.url
            })
        }
    }

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
                        onChange={(v) => setProp((props: ContainerProps) => (props.flexDirection = v as ContainerProps["flexDirection"]))}
                        options={[
                            { label: "Row", value: "row", icon: ArrowRight },
                            { label: "Column", value: "column", icon: ArrowDown },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Align Items">
                    <PropertyIconButtonGroup
                        value={alignItems || "flex-start"}
                        onChange={(v) => setProp((props: ContainerProps) => (props.alignItems = v as ContainerProps["alignItems"]))}
                        options={[
                            { label: "Start", value: "flex-start", icon: AlignLeft },
                            { label: "Center", value: "center", icon: AlignCenter },
                            { label: "End", value: "flex-end", icon: AlignRight },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Justify Content">
                    <PropertyIconButtonGroup
                        value={justifyContent || "flex-start"}
                        onChange={(v) => setProp((props: ContainerProps) => (props.justifyContent = v as ContainerProps["justifyContent"]))}
                        options={[
                            { label: "Start", value: "flex-start", icon: AlignLeft },
                            { label: "Center", value: "center", icon: AlignCenter },
                            { label: "End", value: "flex-end", icon: AlignRight },
                            { label: "Between", value: "space-between", icon: AlignJustify },
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
            </PropertySection>

            <PropertySection title="Decoration" summary={`${borderRadius ? `${borderRadius}px` : "0px"} / ${boxShadow ? "Shadow" : "None"}`} defaultOpen={false}>
                <PropertyRow label="Background Color">
                    <PropertyColor
                        value={backgroundColor}
                        onChange={(color) => setProp((props: ContainerProps) => (props.backgroundColor = color))}
                    />
                </PropertyRow>
                <PropertyRow label="Background Image">
                    <div className="flex flex-col gap-2 w-full">
                        {backgroundImage ? (
                            <div className="relative group w-full aspect-video bg-muted rounded-md overflow-hidden border border-border">
                                <div
                                    className="w-full h-full"
                                    style={{
                                        backgroundImage: `url(${backgroundImage})`,
                                        backgroundSize: backgroundSize || 'cover',
                                        backgroundPosition: backgroundPosition || 'center',
                                        backgroundRepeat: backgroundRepeat || 'no-repeat',
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => setIsDialogOpen(true)}
                                    >
                                        Change Image
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => setProp((props: ContainerProps) => (props.backgroundImage = undefined))}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full flex items-center justify-center gap-2 h-20 border-dashed"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                <span className="text-muted-foreground">Select Background Image</span>
                            </Button>
                        )}
                    </div>
                </PropertyRow>
                {backgroundImage && (
                    <>
                        <PropertyRow label="Image Size">
                            <PropertySelect
                                value={backgroundSize || "cover"}
                                onChange={(v) => setProp((props: ContainerProps) => (props.backgroundSize = v as ContainerProps["backgroundSize"]))}
                                options={[
                                    { label: "Cover", value: "cover" },
                                    { label: "Contain", value: "contain" },
                                    { label: "Auto", value: "auto" },
                                ]}
                            />
                        </PropertyRow>
                        <PropertyRow label="Image Position">
                            <PropertyInput
                                value={backgroundPosition || "center"}
                                onChange={(val) => setProp((props: ContainerProps) => (props.backgroundPosition = val))}
                                placeholder="center, top, bottom, left, right"
                            />
                        </PropertyRow>
                        <PropertyRow label="Image Repeat">
                            <PropertySelect
                                value={backgroundRepeat || "no-repeat"}
                                onChange={(v) => setProp((props: ContainerProps) => (props.backgroundRepeat = v as ContainerProps["backgroundRepeat"]))}
                                options={[
                                    { label: "No Repeat", value: "no-repeat" },
                                    { label: "Repeat", value: "repeat" },
                                    { label: "Repeat X", value: "repeat-x" },
                                    { label: "Repeat Y", value: "repeat-y" },
                                ]}
                            />
                        </PropertyRow>
                    </>
                )}
                <PropertyRow label="Enable Grid Background">
                    <input
                        type="checkbox"
                        checked={enableGrid || false}
                        onChange={(e) => setProp((props: ContainerProps) => (props.enableGrid = e.target.checked))}
                        className="h-4 w-4"
                    />
                </PropertyRow>
                {enableGrid && (
                    <PropertyRow label="Grid Opacity (%)">
                        <PropertySlider
                            value={gridOpacity || 30}
                            onChange={(v) => setProp((props: ContainerProps) => (props.gridOpacity = v))}
                            min={0}
                            max={100}
                            unit="%"
                        />
                    </PropertyRow>
                )}
                <PropertyRow label="Border Width">
                    <PropertySlider
                        value={borderWidth || 0}
                        onChange={(v) => setProp((props: ContainerProps) => (props.borderWidth = v))}
                        max={20}
                        unit="px"
                    />
                </PropertyRow>
                <PropertyRow label="Border Color">
                    <PropertyColor
                        value={borderColor}
                        onChange={(color) => setProp((props: ContainerProps) => (props.borderColor = color))}
                    />
                </PropertyRow>
                <PropertyRow label="Border Radius">
                    <PropertySlider
                        value={borderRadius || 0}
                        onChange={(v) => setProp((props: ContainerProps) => (props.borderRadius = v))}
                        max={50}
                        unit="px"
                    />
                </PropertyRow>
                <PropertyRow label="Shadow">
                    <PropertyShadowSelect
                        value={boxShadow || ""}
                        onChange={(val) => setProp((props: ContainerProps) => (props.boxShadow = val))}
                    />
                </PropertyRow>
            </PropertySection>

            <MediaLibraryDialog
                siteId={siteId}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSelect={handleMediaSelect}
                multiSelect={false}
            />
        </div>
    )
}

Container.craft = {
    displayName: "Container",
    props: {
        padding: 20, // Kept for empty state calculation
        backgroundColor: "transparent",
        backgroundImage: undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        enableGrid: false,
        gridOpacity: 30,
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
