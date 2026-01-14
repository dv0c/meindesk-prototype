"use client"

import React from "react"
import { useEditor, useNode } from "@craftjs/core"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { LayoutGrid } from "lucide-react"

export interface GridProps {
    children?: React.ReactNode
    style?: BlockStyle
    mobileStyle?: BlockStyle
    tabletStyle?: BlockStyle
    className?: string

    columns?: number
    tabletColumns?: number
    mobileColumns?: number

    rows?: number
    tabletRows?: number
    mobileRows?: number

    responsive?: {
        hiddenOn?: string[]
    }
}

const defaultStyles: BlockStyle = {
    display: "grid",
    width: "100%",
    gap: 16,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    minHeight: 80,
    backgroundColor: "transparent",
}

import {
    PropertySection,
    PropertyRow,
    PropertySliderWithUnit,
    PropertySlider,
    PropertyBoxModel,
    PropertyColor,
    PropertySelect,
    PropertyShadowSelect,
    PropertyInput,
    PropertyToggle
} from "../components/PropertySection"
import { useDevice } from "../components/DeviceContext"

// Grid Settings Component
const GridSettings = () => {
    const { actions: { setProp }, columns, rows, style: desktopStyle, mobileStyle, tabletStyle, mobileColumns, tabletColumns, mobileRows, tabletRows } = useNode((node) => ({
        columns: node.data.props.columns,
        rows: node.data.props.rows,
        mobileColumns: node.data.props.mobileColumns,
        tabletColumns: node.data.props.tabletColumns,
        mobileRows: node.data.props.mobileRows,
        tabletRows: node.data.props.tabletRows,
        style: node.data.props.style || {},
        mobileStyle: node.data.props.mobileStyle || {},
        tabletStyle: node.data.props.tabletStyle || {},
    }))

    const device = useDevice()
    const deviceMode = device?.deviceMode || 'desktop'
    const isMobile = deviceMode === 'mobile'
    const isTablet = deviceMode === 'tablet'

    // determine active props based on device mode
    const getActiveStyle = (key: string) => {
        if (isMobile) return mobileStyle[key] ?? tabletStyle[key] ?? desktopStyle[key]
        if (isTablet) return tabletStyle[key] ?? desktopStyle[key]
        return desktopStyle[key]
    }

    const activeColumns = isMobile ? (mobileColumns ?? tabletColumns ?? columns) : (isTablet ? (tabletColumns ?? columns) : columns)
    const activeRows = isMobile ? (mobileRows ?? tabletRows ?? rows) : (isTablet ? (tabletRows ?? rows) : rows)

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

    // Helper for box model changes
    const handleBoxModelChange = (type: 'margin' | 'padding', side: string, value: string) => {
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
            target[key] = parseInt(value) || 0
        })
    }

    const handleValueChange = (propKey: string, value: any) => {
        setProp((props: any) => {
            if (isMobile) {
                props[`mobile${propKey.charAt(0).toUpperCase() + propKey.slice(1)}`] = value
            } else if (isTablet) {
                props[`tablet${propKey.charAt(0).toUpperCase() + propKey.slice(1)}`] = value
            } else {
                props[propKey] = value
            }
        })
    }

    const currentStyle = {
        gap: getActiveStyle('gap'),

        marginTop: getActiveStyle('marginTop'),
        marginRight: getActiveStyle('marginRight'),
        marginBottom: getActiveStyle('marginBottom'),
        marginLeft: getActiveStyle('marginLeft'),

        paddingTop: getActiveStyle('paddingTop'),
        paddingRight: getActiveStyle('paddingRight'),
        paddingBottom: getActiveStyle('paddingBottom'),
        paddingLeft: getActiveStyle('paddingLeft'),

        width: getActiveStyle('width'),
        height: getActiveStyle('height'),
        minHeight: getActiveStyle('minHeight'),
        maxWidth: getActiveStyle('maxWidth'),
        maxHeight: getActiveStyle('maxHeight'),

        backgroundColor: getActiveStyle('backgroundColor'),
        borderWidth: getActiveStyle('borderWidth'),
        borderColor: getActiveStyle('borderColor'),
        borderRadius: getActiveStyle('borderRadius'),
        boxShadow: getActiveStyle('boxShadow'),

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
                <PropertyRow label="Columns" description="Number of vertical columns">
                    <PropertySlider
                        value={activeColumns || 2}
                        min={1}
                        max={12}
                        step={1}
                        onChange={(val) => handleValueChange('columns', val)}
                        unit=""
                    />
                </PropertyRow>

                <PropertyRow label="Rows" description="Number of horizontal rows (0 for auto)">
                    <PropertySlider
                        value={activeRows || 0}
                        min={0}
                        max={12}
                        step={1}
                        onChange={(val) => handleValueChange('rows', val)}
                        unit=""
                    />
                </PropertyRow>

                <PropertyRow label="Gap" description="Spacing between items">
                    <PropertySlider
                        value={parseInt(currentStyle.gap) || 0}
                        min={0}
                        max={100}
                        step={1}
                        onChange={(val) => handleStyleChange('gap', val)}
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
                            handleStyleChange('marginLeft', checked ? 'auto' : 0)
                            handleStyleChange('marginRight', checked ? 'auto' : 0)
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

export const Grid = defineBlock<GridProps>({
    name: "Grid",
    category: "Layout",
    icon: <LayoutGrid className="w-4 h-4" />,
    description: "Responsive grid layout",

    defaultProps: {
        style: defaultStyles,
        mobileStyle: {},
        tabletStyle: {},
        columns: 2,
        rows: 0
    },

    settings: GridSettings,

    render: ({ children, style, mobileStyle, tabletStyle, className, columns = 2, rows = 0, tabletColumns, mobileColumns, tabletRows, mobileRows, responsive, isEditing, deviceMode }) => {
        const { enabled } = useEditor((state) => ({
            enabled: state.options.enabled
        }))
        const { id } = useNode()

        // Resolve active columns/rows based on device mode (for Editor)
        // For Runtime, we need to inject CSS to switch these.
        // But columns are not standard CSS properties we can map directly in `block-api`'s simple mapper.
        // So for Grid to be truly responsive in runtime without JS, we need to add standard grid prop support 
        // to `block-api` OR manually construct the grid-template-* overrides here and pass them to useBlockStyles.

        // Strategy: Inject gridTemplateColumns into the style object passed to useBlockStyles

        const getColumns = (cols: number | undefined, defaultCols: number) => `repeat(${cols || defaultCols}, 1fr)`
        const getRows = (rows: number | undefined, defaultRows: number) => rows && rows > 0 ? `repeat(${rows}, 1fr)` : undefined

        const desktopTemplate = {
            gridTemplateColumns: getColumns(columns, 2),
            gridTemplateRows: getRows(rows, 0)
        }

        // Tablet override
        const tabletTemplate = {
            gridTemplateColumns: getColumns(tabletColumns ?? columns, 2),
            gridTemplateRows: getRows(tabletRows ?? rows, 0)
        }

        // Mobile override
        const mobileTemplate = {
            gridTemplateColumns: getColumns(mobileColumns ?? tabletColumns ?? columns, 1), // Default to 1 col on mobile if not specified
            gridTemplateRows: getRows(mobileRows ?? tabletRows ?? rows, 0)
        }

        const effectiveDesktopStyle = { ...style, display: "grid" as const, ...desktopTemplate }
        const effectiveTabletStyle = { ...tabletStyle, ...tabletTemplate }
        const effectiveMobileStyle = { ...mobileStyle, ...mobileTemplate }

        const { style: computedStyle, className: computedClassName, css } = useBlockStyles({
            style: effectiveDesktopStyle,
            tabletStyle: effectiveTabletStyle,
            mobileStyle: effectiveMobileStyle,
            className,
            responsive,
            isEditing,
            deviceMode,
            nodeId: id
        })

        const childCount = React.Children.count(children)
        const isEmpty = childCount === 0

        // For visualizing empty slots, we use the active Columns definition from the hook result?
        // useBlockStyles returns the *active* style for the current deviceMode (in Editor).
        // So computedStyle.gridTemplateColumns should be correct.

        // However, calculating the number of slots for the placeholder loop requires parsing that string or using logic.
        // Let's just use the logic for the *current* device mode to render placeholders.
        const currentColumns = (isEditing && deviceMode === 'mobile') ? (mobileColumns ?? tabletColumns ?? columns) :
            (isEditing && deviceMode === 'tablet') ? (tabletColumns ?? columns) : columns

        const currentRows = (isEditing && deviceMode === 'mobile') ? (mobileRows ?? tabletRows ?? rows) :
            (isEditing && deviceMode === 'tablet') ? (tabletRows ?? rows) : rows

        return (
            <div className={computedClassName} style={computedStyle}>
                {css && <style>{css}</style>}
                {isEmpty && enabled ? (
                    // Show placeholders
                    Array.from({ length: Math.max((currentColumns || 2) * (currentRows || 1), (currentColumns || 2)) }).map((_, i) => (
                        <div
                            key={i}
                            className="w-full h-full min-h-[50px] border border-dashed border-gray-300"
                            style={{
                                borderColor: 'rgba(0,0,0,0.1)'
                            }}
                        />
                    ))
                ) : (
                    children
                )}
            </div>
        )
    },

    childrenAllowed: true
})
