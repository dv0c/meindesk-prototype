"use client"

import React, { useState } from 'react'
import { useNode } from '@craftjs/core'
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyColor,
    PropertySelect,
    PropertySpacing,
    PropertySliderWithUnit,
    PropertyShadowSelect,
    PropertyButtonGroup,
    PropertyBoxModel,
} from '../components/PropertySection'

/**
 * Standard default props that all components inherit
 */
export const STANDARD_DEFAULTS = {
    // Sizing
    width: 'auto',
    height: 'auto',
    minHeight: undefined as string | undefined,
    maxWidth: '100%',

    // Spacing (margin)
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,

    // Spacing (padding)
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,

    // Colors
    backgroundColor: 'transparent',
    color: undefined as string | undefined,

    // Border
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    borderStyle: 'solid' as 'solid' | 'dashed' | 'dotted' | 'none',

    // Effects
    boxShadow: 'none',
    opacity: 1,

    // Typography (common)
    textAlign: 'left' as 'left' | 'center' | 'right' | 'justify',
}

export type StandardProps = typeof STANDARD_DEFAULTS

/**
 * Standard Style Settings - renders consistent style controls for all components
 * Used automatically by enhanced withCraftComponent
 */
export function StandardStyleSettings() {
    const [marginUnit, setMarginUnit] = useState('px')
    const [paddingUnit, setPaddingUnit] = useState('px')

    const {
        actions: { setProp },
        // Sizing
        width,
        height,
        minHeight,
        maxWidth,
        // Spacing
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        // Colors
        backgroundColor,
        color,
        // Border
        borderRadius,
        borderWidth,
        borderColor,
        borderStyle,
        // Effects
        boxShadow,
        opacity,
        // Typography
        textAlign,
    } = useNode((node) => ({
        width: node.data.props.width,
        height: node.data.props.height,
        minHeight: node.data.props.minHeight,
        maxWidth: node.data.props.maxWidth,
        marginTop: node.data.props.marginTop,
        marginRight: node.data.props.marginRight,
        marginBottom: node.data.props.marginBottom,
        marginLeft: node.data.props.marginLeft,
        paddingTop: node.data.props.paddingTop,
        paddingRight: node.data.props.paddingRight,
        paddingBottom: node.data.props.paddingBottom,
        paddingLeft: node.data.props.paddingLeft,
        backgroundColor: node.data.props.backgroundColor,
        color: node.data.props.color,
        borderRadius: node.data.props.borderRadius,
        borderWidth: node.data.props.borderWidth,
        borderColor: node.data.props.borderColor,
        borderStyle: node.data.props.borderStyle,
        boxShadow: node.data.props.boxShadow,
        opacity: node.data.props.opacity,
        textAlign: node.data.props.textAlign,
    }))



    // Helper to parse value with unit
    const parseValueWithUnit = (val: string | number | undefined, defaultUnit = 'px', defaultValue = 0): { value: number; unit: string } => {
        if (typeof val === 'number') return { value: val, unit: 'px' }
        if (!val || val === 'auto') return { value: defaultValue, unit: defaultUnit }
        const match = String(val).match(/^([\d.]+)(px|%|rem|vw|vh)?$/)
        if (match) {
            return { value: parseFloat(match[1]) || 0, unit: match[2] || 'px' }
        }
        return { value: defaultValue, unit: defaultUnit }
    }

    const { value: widthValue, unit: widthUnit } = parseValueWithUnit(width, '%', 100)
    const { value: maxWidthValue, unit: maxWidthUnit } = parseValueWithUnit(maxWidth, '%', 100)
    const { value: minHeightValue, unit: minHeightUnit } = parseValueWithUnit(minHeight, 'px', 0)

    return (
        <div className="space-y-1">
            {/* Layout Section */}
            <PropertySection title="Layout" summary={`${width || 'auto'} × ${height || 'auto'}`}>
                <PropertyRow label="Width">
                    <PropertySliderWithUnit
                        value={widthValue}
                        unit={widthUnit}
                        onChange={(v, u) => setProp((props: any) => (props.width = u === '%' && v === 100 ? '100%' : `${v}${u}`))}
                        showAuto
                        onAutoChange={() => setProp((props: any) => (props.width = 'auto'))}
                        isAuto={width === 'auto'}
                    />
                </PropertyRow>
                <PropertyRow label="Max Width">
                    <PropertySliderWithUnit
                        value={maxWidthValue}
                        unit={maxWidthUnit}
                        onChange={(v, u) => setProp((props: any) => (props.maxWidth = `${v}${u}`))}
                    />
                </PropertyRow>
                <PropertyRow label="Min Height">
                    <PropertySliderWithUnit
                        value={minHeightValue}
                        unit={minHeightUnit}
                        onChange={(v, u) => setProp((props: any) => (props.minHeight = v > 0 ? `${v}${u}` : undefined))}
                        max={500}
                    />
                </PropertyRow>
                <PropertyRow label="Text Align">
                    <PropertyButtonGroup
                        value={textAlign || 'left'}
                        onChange={(v) => setProp((props: any) => (props.textAlign = v))}
                        options={[
                            { label: 'Left', value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'right' },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>

            {/* Spacing Section */}
            <PropertySection title="Spacing" summary={`M: ${marginTop || 0}, P: ${paddingTop || 0}`} defaultOpen={false}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Margin</label>
                        <PropertySpacing
                            values={{
                                top: String(marginTop || 0),
                                right: String(marginRight || 0),
                                bottom: String(marginBottom || 0),
                                left: String(marginLeft || 0),
                            }}
                            unit={marginUnit}
                            onUnitChange={(newUnit) => {
                                setMarginUnit(newUnit)
                                // Update existing values to new unit if they are numeric
                                setProp((props: any) => {
                                    ['Top', 'Right', 'Bottom', 'Left'].forEach(side => {
                                        const prop = `margin${side}`
                                        const currentVal = props[prop]
                                        // Check if current value is numeric-like (number or string with known unit)
                                        if (currentVal !== undefined && currentVal !== 'auto') {
                                            const valStr = String(currentVal)
                                            const match = valStr.match(/^([\d.-]+)(px|%|rem|em|vw|vh)?$/)
                                            if (match) {
                                                const num = match[1]
                                                if (newUnit === 'px') {
                                                    props[prop] = parseFloat(num) // Store as number for px
                                                } else {
                                                    props[prop] = `${num}${newUnit}`
                                                }
                                            }
                                        }
                                    })
                                })
                            }}
                            onChange={(side, value) => {
                                const propName = `margin${side.charAt(0).toUpperCase() + side.slice(1)}`
                                setProp((props: any) => {
                                    const isNumeric = value !== "" && !isNaN(Number(value))
                                    if (isNumeric) {
                                        // Apply current unit preference
                                        props[propName] = marginUnit === 'px' ? Number(value) : `${value}${marginUnit}`
                                    } else {
                                        props[propName] = value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Padding</label>
                        <PropertySpacing
                            values={{
                                top: String(paddingTop || 0),
                                right: String(paddingRight || 0),
                                bottom: String(paddingBottom || 0),
                                left: String(paddingLeft || 0),
                            }}
                            unit={paddingUnit}
                            onUnitChange={(newUnit) => {
                                setPaddingUnit(newUnit)
                                setProp((props: any) => {
                                    ['Top', 'Right', 'Bottom', 'Left'].forEach(side => {
                                        const prop = `padding${side}`
                                        const currentVal = props[prop]
                                        if (currentVal !== undefined && currentVal !== 'auto') {
                                            const valStr = String(currentVal)
                                            const match = valStr.match(/^([\d.-]+)(px|%|rem|em|vw|vh)?$/)
                                            if (match) {
                                                const num = match[1]
                                                if (newUnit === 'px') {
                                                    props[prop] = parseFloat(num)
                                                } else {
                                                    props[prop] = `${num}${newUnit}`
                                                }
                                            }
                                        }
                                    })
                                })
                            }}
                            onChange={(side, value) => {
                                const propName = `padding${side.charAt(0).toUpperCase() + side.slice(1)}`
                                setProp((props: any) => {
                                    const isNumeric = value !== "" && !isNaN(Number(value))
                                    if (isNumeric) {
                                        props[propName] = paddingUnit === 'px' ? Number(value) : `${value}${paddingUnit}`
                                    } else {
                                        props[propName] = value
                                    }
                                })
                            }}
                        />
                    </div>
                </div>
            </PropertySection>

            {/* Colors Section */}
            <PropertySection title="Colors" defaultOpen={false}>
                <PropertyRow label="Background">
                    <PropertyColor
                        value={backgroundColor || ''}
                        onChange={(v) => setProp((props: any) => (props.backgroundColor = v))}
                        placeholder="transparent"
                    />
                </PropertyRow>
                <PropertyRow label="Text Color">
                    <PropertyColor
                        value={color || ''}
                        onChange={(v) => setProp((props: any) => (props.color = v))}
                        placeholder="inherit"
                    />
                </PropertyRow>
            </PropertySection>

            {/* Border Section */}
            <PropertySection title="Border" summary={borderRadius ? `${borderRadius}px radius` : undefined} defaultOpen={false}>
                <PropertyRow label="Radius">
                    <PropertySlider
                        value={borderRadius || 0}
                        onChange={(v) => setProp((props: any) => (props.borderRadius = v))}
                        min={0}
                        max={50}
                    />
                </PropertyRow>
                <PropertyRow label="Width">
                    <PropertySlider
                        value={borderWidth || 0}
                        onChange={(v) => setProp((props: any) => (props.borderWidth = v))}
                        min={0}
                        max={10}
                    />
                </PropertyRow>
                {(borderWidth || 0) > 0 && (
                    <>
                        <PropertyRow label="Color">
                            <PropertyColor
                                value={borderColor || ''}
                                onChange={(v) => setProp((props: any) => (props.borderColor = v))}
                            />
                        </PropertyRow>
                        <PropertyRow label="Style">
                            <PropertySelect
                                value={borderStyle || 'solid'}
                                onChange={(v) => setProp((props: any) => (props.borderStyle = v))}
                                options={[
                                    { label: 'Solid', value: 'solid' },
                                    { label: 'Dashed', value: 'dashed' },
                                    { label: 'Dotted', value: 'dotted' },
                                ]}
                            />
                        </PropertyRow>
                    </>
                )}
            </PropertySection>

            {/* Effects Section */}
            <PropertySection title="Effects" defaultOpen={false}>
                <PropertyRow label="Shadow">
                    <PropertyShadowSelect
                        value={boxShadow || 'none'}
                        onChange={(v) => setProp((props: any) => (props.boxShadow = v))}
                    />
                </PropertyRow>
                <PropertyRow label="Opacity">
                    <PropertySlider
                        value={(opacity ?? 1) * 100}
                        onChange={(v) => setProp((props: any) => (props.opacity = v / 100))}
                        min={0}
                        max={100}
                        unit="%"
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

/**
 * Combined settings component that shows both content and style settings
 */
export function createCombinedSettings(
    ContentSettings: React.ComponentType | null,
    options: {
        showStyles?: boolean
    } = { showStyles: true }
) {
    const CombinedSettings = () => {
        return (
            <div className="space-y-1">
                {/* Content Settings (component-specific) */}
                {ContentSettings && <ContentSettings />}

                {/* Standard Style Settings */}
                {options.showStyles && <StandardStyleSettings />}
            </div>
        )
    }

    CombinedSettings.displayName = 'CombinedSettings'
    return CombinedSettings
}

/**
 * Helper to create filtered standard defaults
 * Only include props that the component actually uses
 */
export function getFilteredDefaults(includedProps: Array<keyof StandardProps>): Partial<StandardProps> {
    const filtered: Partial<StandardProps> = {}
    for (const prop of includedProps) {
        (filtered as any)[prop] = STANDARD_DEFAULTS[prop]
    }
    return filtered
}
