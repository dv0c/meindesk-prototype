"use client"

import React from "react"
import { useEditor, useNode } from "@craftjs/core"
import {
    Plus,
    ArrowDown,
    ArrowRight,
    AlignStartVertical,
    AlignCenterVertical,
    AlignEndVertical,
    StretchVertical,
    AlignStartHorizontal,
    AlignCenterHorizontal,
    AlignEndHorizontal,
    BetweenHorizontalStart,
    BetweenHorizontalEnd,
    WrapText,
    ArrowRightLeft,
    MonitorStop
} from "lucide-react"
import { cn } from "@/lib/utils"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { useCollectionData } from "@/hooks/useCollectionData"
import { CollectionItemProvider } from "./collections/CollectionItemContext"
import { resolveCollectionTemplate } from "@/lib/collection-utils"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyBoxModel,
    PropertyColor,
    PropertySelect,
    PropertyShadowSelect,
    PropertyInput,
    PropertyToggle,
    PropertySliderWithUnit,
    PropertyIconButtonGroup
} from "../components/PropertySection"
import { useDevice } from "../components/DeviceContext"

// Container Props Interface
export interface ContainerProps {
    children?: React.ReactNode
    style?: BlockStyle
    mobileStyle?: BlockStyle
    tabletStyle?: BlockStyle
    className?: string
    responsive?: {
        hiddenOn?: string[]
    }
    stackOnMobile?: boolean // New prop for auto-stacking

    // Collection Data Props
    collectionId?: string
    itemId?: string
    useSlugFromUrl?: boolean
}

// Default Styles
const defaultStyles: BlockStyle = {
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    minHeight: 100,
    width: "100%",
    height: "auto",
    display: "flex", // Changed from block to flex to support layout controls
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 0,
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "#e5e7eb",
    position: "relative"
}

const ContainerSettings = () => {
    const { actions: { setProp }, style: desktopStyle, mobileStyle, tabletStyle, collectionId, stackOnMobile } = useNode((node) => ({
        style: node.data.props.style || {},
        mobileStyle: node.data.props.mobileStyle || {},
        tabletStyle: node.data.props.tabletStyle || {},
        collectionId: node.data.props.collectionId,
        stackOnMobile: node.data.props.stackOnMobile
    }))

    const device = useDevice()
    const deviceMode = device?.deviceMode || 'desktop'

    // determine active props based on device mode
    const isMobile = deviceMode === 'mobile'
    const isTablet = deviceMode === 'tablet'

    // Access active values
    const getActiveStyle = (key: string) => {
        if (isMobile) return mobileStyle[key] ?? tabletStyle[key] ?? desktopStyle[key]
        if (isTablet) return tabletStyle[key] ?? desktopStyle[key]
        return desktopStyle[key]
    }

    const handleStyleChange = (key: string, value: any) => {
        setProp((props: any) => {
            let target = props.style
            if (isMobile) {
                if (!props.mobileStyle) props.mobileStyle = {}
                target = props.mobileStyle
            } else if (isTablet) {
                if (!props.tabletStyle) props.tabletStyle = {}
                target = props.tabletStyle
            } else {
                if (!props.style) props.style = {}
                target = props.style
            }
            target[key] = value
        })
    }

    const handleBoxModelChange = (type: 'margin' | 'padding', side: string, value: string) => {
        const intVal = parseInt(value) || 0
        setProp((props: any) => {
            let target = props.style
            if (isMobile) {
                if (!props.mobileStyle) props.mobileStyle = {}
                target = props.mobileStyle
            } else if (isTablet) {
                if (!props.tabletStyle) props.tabletStyle = {}
                target = props.tabletStyle
            } else {
                if (!props.style) props.style = {}
                target = props.style
            }

            const key = `${type}${side.charAt(0).toUpperCase() + side.slice(1)}`
            target[key] = intVal
        })
    }

    const handleLayoutChange = (key: string, value: any) => {
        setProp((props: any) => {
            let target = props.style
            if (isMobile) {
                if (!props.mobileStyle) props.mobileStyle = {}
                target = props.mobileStyle
            } else if (isTablet) {
                if (!props.tabletStyle) props.tabletStyle = {}
                target = props.tabletStyle
            } else {
                if (!props.style) props.style = {}
                target = props.style
            }

            target[key] = value
            // We only enforce display:flex if it's the desktop style or if we need to override
            if (!isMobile && !isTablet) {
                target.display = "flex"
            }
        })
    }

    const handleStackOnMobileChange = (checked: boolean) => {
        setProp((props: any) => {
            props.stackOnMobile = checked
        })
    }

    // Use getActiveStyle for values in controls
    const currentStyle = {
        flexDirection: getActiveStyle('flexDirection'),
        alignItems: getActiveStyle('alignItems'),
        justifyContent: getActiveStyle('justifyContent'),
        flexWrap: getActiveStyle('flexWrap'),
        gap: getActiveStyle('gap'),

        // Spacing
        marginTop: getActiveStyle('marginTop'),
        marginRight: getActiveStyle('marginRight'),
        marginBottom: getActiveStyle('marginBottom'),
        marginLeft: getActiveStyle('marginLeft'),

        paddingTop: getActiveStyle('paddingTop'),
        paddingRight: getActiveStyle('paddingRight'),
        paddingBottom: getActiveStyle('paddingBottom'),
        paddingLeft: getActiveStyle('paddingLeft'),

        // Dimensions
        width: getActiveStyle('width'),
        height: getActiveStyle('height'),
        minHeight: getActiveStyle('minHeight'),
        maxWidth: getActiveStyle('maxWidth'),
        maxHeight: getActiveStyle('maxHeight'),

        // Decoration
        backgroundColor: getActiveStyle('backgroundColor'),
        borderWidth: getActiveStyle('borderWidth'),
        borderColor: getActiveStyle('borderColor'),
        borderRadius: getActiveStyle('borderRadius'),
        boxShadow: getActiveStyle('boxShadow'),

        // Position
        position: getActiveStyle('position'),
        zIndex: getActiveStyle('zIndex'),
        top: getActiveStyle('top'),
        right: getActiveStyle('right'),
        bottom: getActiveStyle('bottom'),
        left: getActiveStyle('left'),
    }

    return (
        <div className="space-y-4 pt-2">
            <PropertySection title="Layout" defaultOpen={true}>
                <PropertyRow label="Direction">
                    <PropertyIconButtonGroup
                        value={currentStyle.flexDirection || "column"}
                        options={[
                            { label: "Column", value: "column", icon: ArrowDown },
                            { label: "Row", value: "row", icon: ArrowRight },
                        ]}
                        onChange={(val) => handleLayoutChange('flexDirection', val)}
                    />
                </PropertyRow>

                {!isMobile && !isTablet && currentStyle.flexDirection === "row" && (
                    <PropertyRow label="Mobile Stack">
                        <PropertyToggle
                            label="Stack on Mobile"
                            value={stackOnMobile !== false} // Default to true if undefined
                            onChange={handleStackOnMobileChange}
                        />
                    </PropertyRow>
                )}

                <PropertyRow label="Alignment">
                    <PropertyIconButtonGroup
                        value={currentStyle.alignItems || "flex-start"}
                        options={[
                            { label: "Start", value: "flex-start", icon: AlignStartHorizontal },
                            { label: "Center", value: "center", icon: AlignCenterHorizontal },
                            { label: "End", value: "flex-end", icon: AlignEndHorizontal },
                            { label: "Stretch", value: "stretch", icon: StretchVertical },
                        ]}
                        onChange={(val) => handleLayoutChange('alignItems', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Justify">
                    <PropertyIconButtonGroup
                        value={currentStyle.justifyContent || "flex-start"}
                        options={[
                            { label: "Start", value: "flex-start", icon: AlignStartVertical },
                            { label: "Center", value: "center", icon: AlignCenterVertical },
                            { label: "End", value: "flex-end", icon: AlignEndVertical },
                            { label: "Space Between", value: "space-between", icon: BetweenHorizontalStart },
                            { label: "Space Around", value: "space-around", icon: BetweenHorizontalEnd },
                        ]}
                        onChange={(val) => handleLayoutChange('justifyContent', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Wrap">
                    <PropertyIconButtonGroup
                        value={currentStyle.flexWrap || "nowrap"}
                        options={[
                            { label: "No Wrap", value: "nowrap", icon: MonitorStop },
                            { label: "Wrap", value: "wrap", icon: WrapText },
                            { label: "Reverse", value: "wrap-reverse", icon: ArrowRightLeft },
                        ]}
                        onChange={(val) => handleLayoutChange('flexWrap', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Gap">
                    <PropertySlider
                        value={parseInt(currentStyle.gap) || 0}
                        min={0}
                        max={100}
                        onChange={(val) => handleLayoutChange('gap', val)}
                    />
                </PropertyRow>


            </PropertySection>

            <PropertySection title="Spacing" defaultOpen={false}>
                <PropertyBoxModel
                    margin={{
                        top: currentStyle.marginTop || 0,
                        right: currentStyle.marginRight || 0,
                        bottom: currentStyle.marginBottom || 0,
                        left: currentStyle.marginLeft || 0
                    }}
                    padding={{
                        top: currentStyle.paddingTop || 0,
                        right: currentStyle.paddingRight || 0,
                        bottom: currentStyle.paddingBottom || 0,
                        left: currentStyle.paddingLeft || 0
                    }}
                    onChangeMargin={(side, value) => handleBoxModelChange('margin', side, value)}
                    onChangePadding={(side, value) => handleBoxModelChange('padding', side, value)}
                />
            </PropertySection>

            <PropertySection title="Dimensions" defaultOpen={false}>
                <PropertyRow>
                    <PropertyToggle
                        label="Center Content (Auto Margin)"
                        value={currentStyle.marginLeft === 'auto' && currentStyle.marginRight === 'auto'}
                        onChange={(checked) => {
                            handleLayoutChange('marginLeft', checked ? 'auto' : 0)
                            handleLayoutChange('marginRight', checked ? 'auto' : 0)
                        }}
                    />
                </PropertyRow>
                <PropertyRow label="Width">
                    <PropertySliderWithUnit
                        value={parseInt(currentStyle.width) || 0}
                        unit={currentStyle.width?.toString().replace(/[0-9.]/g, '') || 'px'}
                        onChange={(val, unit) => handleStyleChange('width', `${val}${unit}`)}
                        min={0}
                        max={100}
                        units={['px', '%', 'vw', 'rem', 'auto']}
                    />
                </PropertyRow>
                <PropertyRow label="Height">
                    <PropertySliderWithUnit
                        value={parseInt(currentStyle.height) || 0}
                        unit={currentStyle.height?.toString().replace(/[0-9.]/g, '') || 'px'}
                        onChange={(val, unit) => handleStyleChange('height', `${val}${unit}`)}
                        min={0}
                        max={100}
                        units={['px', '%', 'vh', 'rem', 'auto']}
                    />
                </PropertyRow>
                <PropertyRow label="Min Height">
                    <PropertySliderWithUnit
                        value={parseInt(currentStyle.minHeight) || 0}
                        unit={currentStyle.minHeight?.toString().replace(/[0-9.]/g, '') || 'px'}
                        onChange={(val, unit) => handleStyleChange('minHeight', `${val}${unit}`)}
                        min={0}
                        max={100}
                        units={['px', '%', 'vh', 'rem']}
                    />
                </PropertyRow>
                <PropertyRow label="Max Width">
                    <PropertySliderWithUnit
                        value={parseInt(currentStyle.maxWidth) || 0}
                        unit={currentStyle.maxWidth?.toString().replace(/[0-9.]/g, '') || 'px'}
                        onChange={(val, unit) => handleStyleChange('maxWidth', `${val}${unit}`)}
                        min={0}
                        max={100}
                        units={['px', '%', 'vw', 'rem', 'none']}
                    />
                </PropertyRow>
                <PropertyRow label="Max Height">
                    <PropertySliderWithUnit
                        value={parseInt(currentStyle.maxHeight) || 0}
                        unit={currentStyle.maxHeight?.toString().replace(/[0-9.]/g, '') || 'px'}
                        onChange={(val, unit) => handleStyleChange('maxHeight', `${val}${unit}`)}
                        min={0}
                        max={100}
                        units={['px', '%', 'vh', 'rem', 'none']}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Decoration" defaultOpen={false}>
                <PropertyRow label="Background">
                    <PropertyColor
                        value={currentStyle.backgroundColor || "transparent"}
                        onChange={(val) => handleStyleChange('backgroundColor', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Border Width">
                    <PropertySlider
                        value={currentStyle.borderWidth || 0}
                        min={0}
                        max={20}
                        onChange={(val) => handleStyleChange('borderWidth', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Border Color">
                    <PropertyColor
                        value={currentStyle.borderColor || "transparent"}
                        onChange={(val) => handleStyleChange('borderColor', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Corner Radius">
                    <PropertySlider
                        value={currentStyle.borderRadius || 0}
                        min={0}
                        max={100}
                        onChange={(val) => handleStyleChange('borderRadius', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Shadow">
                    <PropertyShadowSelect
                        value={currentStyle.boxShadow || "none"}
                        onChange={(val) => handleStyleChange('boxShadow', val)}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Position" defaultOpen={false}>
                <PropertyRow label="Type">
                    <PropertySelect
                        value={currentStyle.position || "relative"}
                        options={[
                            { label: "Relative", value: "relative" },
                            { label: "Absolute", value: "absolute" },
                            { label: "Fixed", value: "fixed" },
                            { label: "Sticky", value: "sticky" }
                        ]}
                        onChange={(val) => handleStyleChange('position', val)}
                    />
                </PropertyRow>

                <PropertyRow label="Z-Index">
                    <PropertyInput
                        type="number"
                        value={currentStyle.zIndex || 0}
                        onChange={(val) => handleStyleChange('zIndex', parseInt(val) || 0)}
                    />
                </PropertyRow>

                {currentStyle.position === 'absolute' && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <PropertyRow label="Top">
                            <PropertyInput value={currentStyle.top || ''} onChange={(val) => handleStyleChange('top', val)} placeholder="auto" />
                        </PropertyRow>
                        <PropertyRow label="Right">
                            <PropertyInput value={currentStyle.right || ''} onChange={(val) => handleStyleChange('right', val)} placeholder="auto" />
                        </PropertyRow>
                        <PropertyRow label="Bottom">
                            <PropertyInput value={currentStyle.bottom || ''} onChange={(val) => handleStyleChange('bottom', val)} placeholder="auto" />
                        </PropertyRow>
                        <PropertyRow label="Left">
                            <PropertyInput value={currentStyle.left || ''} onChange={(val) => handleStyleChange('left', val)} placeholder="auto" />
                        </PropertyRow>
                    </div>
                )}
            </PropertySection>
        </div>
    )
}

export const Container = defineBlock<ContainerProps>({
    name: "Container",
    category: "Layout",
    icon: <div className="w-full h-full bg-gray-400 rounded-sm" />,
    description: "A flexible container for grouping elements",

    defaultProps: {
        style: defaultStyles,
        mobileStyle: {},
        tabletStyle: {},
        collectionId: "",
        itemId: "",
        useSlugFromUrl: false,
        responsive: { hiddenOn: [] },
        stackOnMobile: true
    },

    settings: ContainerSettings,

    render: ({ children, style, mobileStyle, tabletStyle, className, collectionId, itemId, useSlugFromUrl, theme, isEditing, responsive, deviceMode, stackOnMobile }) => {
        const { enabled } = useEditor((state) => ({
            enabled: state.options.enabled
        }))
        const { id } = useNode() // Get the node ID for unique class generation

        // Fetch Collection Data
        const collectionData = useCollectionData({
            collectionId,
            itemId,
            useSlugFromUrl
        })

        // -- AUTO-RESPONSIVE LOGIC --
        // Check if we should auto-stack on mobile
        let effectiveStyle = { ...style }
        let autoResponsiveClasses = ""

        const isRow = effectiveStyle.flexDirection === 'row'
        const shouldStack = stackOnMobile !== false // Default true

        // NOTE: If stackOnMobile is true, it essentially enforces a mobile override manually.
        // We'll keep this logic but it might conflict if user sets custom mobile styles.
        // Let's make it smarter: only apply if mobileStyle doesn't already override direction.
        if (isRow && shouldStack && !mobileStyle?.flexDirection) {
            // Remove inline style so class can take over
            delete effectiveStyle.flexDirection

            // Add responsive classes:
            // Mobile: flex-col (stack)
            // Desktop: flex-row (original)
            autoResponsiveClasses = "flex flex-col md:flex-row"
        }

        // Compute Styles
        const { style: computedStyle, className: computedClassName, css } = useBlockStyles({
            style: effectiveStyle,
            mobileStyle,
            tabletStyle,
            className: cn(className, autoResponsiveClasses),
            responsive,
            isEditing,
            deviceMode,
            nodeId: id
        })

        // Create a mutable copy of the style to allow modifications
        const finalStyle = { ...computedStyle }

        if (style?.backgroundImage) {
            const resolvedBg = resolveCollectionTemplate(style.backgroundImage, collectionData.data)
            if (resolvedBg) {
                finalStyle.backgroundImage = `url(${resolvedBg})`
            }

        }

        const isEmpty = !children || (Array.isArray(children) && children.length === 0) || (React.Children.count(children) === 0)

        // For `isApp` logic, we might need a workaround or just show generic placeholder
        // Let's use generic placeholder for now to be safe and clean.

        return (
            <div className={computedClassName} style={finalStyle}>
                {css && <style>{css}</style>}
                <CollectionItemProvider value={collectionData}>
                    {children}
                </CollectionItemProvider>
                {enabled && React.Children.count(children) === 0 && (
                    <div
                        className="col-span-full h-full w-full flex items-center justify-center border border-dashed border-gray-300/50 bg-gray-50/20 text-xs text-gray-400 p-4"
                        style={{ gridColumn: `1 / -1` }}
                    >
                        Empty Container
                    </div>
                )}
            </div>
        )
    },

    childrenAllowed: true
})
