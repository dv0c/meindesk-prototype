import { useNode, UserComponent } from '@craftjs/core'
import React from 'react'
import { generateSettings, SettingsConfig } from './generateSettings'

/**
 * Common props that all Craft components can have
 */
export interface CraftComponentProps {
    // Spacing
    marginTop?: number | string
    marginRight?: number | string
    marginBottom?: number | string
    marginLeft?: number | string
    paddingTop?: number | string
    paddingRight?: number | string
    paddingBottom?: number | string
    paddingLeft?: number | string

    // Sizing
    width?: string | number
    height?: string | number
    minWidth?: string | number
    maxWidth?: string | number
    minHeight?: string | number

    // Colors
    backgroundColor?: string
    color?: string

    // Border
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'

    // Layout
    display?: 'block' | 'flex' | 'grid' | 'inline-block' | 'none'
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
    gap?: number | string
    flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'

    // Typography
    fontSize?: number | string
    fontWeight?: string | number
    fontFamily?: string
    lineHeight?: number | string
    letterSpacing?: number | string
    textAlign?: 'left' | 'center' | 'right' | 'justify'
    textDecoration?: 'none' | 'underline' | 'line-through' | 'overline'

    // Effects
    boxShadow?: string
    opacity?: number
    overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'

    // Other
    className?: string
    style?: React.CSSProperties
}

/**
 * Options for withCraftComponent HOC
 */
interface WithCraftComponentOptions<P> {
    displayName: string
    defaultProps?: Partial<P>
    settingsConfig?: SettingsConfig  // NEW: Auto-generate settings
    sectionTitle?: string  // NEW: Section title for auto-generated settings
}

/**
 * Convert component props to inline styles
 */
/**
 * Helper to convert value to CSS string
 */
function toCssValue(value: string | number | undefined): string | undefined {
    if (value === undefined) return undefined
    if (typeof value === 'number') return `${value}px`
    return value
}

/**
 * Convert component props to inline styles
 */
export function propsToStyle(props: CraftComponentProps): React.CSSProperties {
    const style: React.CSSProperties = { ...props.style }

    // Spacing
    if (props.marginTop !== undefined) style.marginTop = toCssValue(props.marginTop)
    if (props.marginRight !== undefined) style.marginRight = toCssValue(props.marginRight)
    if (props.marginBottom !== undefined) style.marginBottom = toCssValue(props.marginBottom)
    if (props.marginLeft !== undefined) style.marginLeft = toCssValue(props.marginLeft)
    if (props.paddingTop !== undefined) style.paddingTop = toCssValue(props.paddingTop)
    if (props.paddingRight !== undefined) style.paddingRight = toCssValue(props.paddingRight)
    if (props.paddingBottom !== undefined) style.paddingBottom = toCssValue(props.paddingBottom)
    if (props.paddingLeft !== undefined) style.paddingLeft = toCssValue(props.paddingLeft)

    // Sizing
    if (props.width !== undefined) style.width = toCssValue(props.width)
    if (props.height !== undefined) style.height = toCssValue(props.height)
    if (props.minWidth !== undefined) style.minWidth = toCssValue(props.minWidth)
    if (props.maxWidth !== undefined) style.maxWidth = toCssValue(props.maxWidth)
    if (props.minHeight !== undefined) style.minHeight = toCssValue(props.minHeight)

    // Colors
    if (props.backgroundColor) style.backgroundColor = props.backgroundColor
    if (props.color) style.color = props.color

    // Layout
    if (props.display) style.display = props.display
    if (props.flexDirection) style.flexDirection = props.flexDirection
    if (props.alignItems) style.alignItems = props.alignItems
    if (props.justifyContent) style.justifyContent = props.justifyContent
    if (props.gap !== undefined) style.gap = toCssValue(props.gap)
    if (props.flexWrap) style.flexWrap = props.flexWrap

    // Typography
    if (props.fontSize !== undefined) style.fontSize = toCssValue(props.fontSize)
    if (props.fontWeight !== undefined) style.fontWeight = props.fontWeight
    if (props.fontFamily) style.fontFamily = props.fontFamily
    if (props.lineHeight !== undefined) style.lineHeight = toCssValue(props.lineHeight)
    if (props.letterSpacing !== undefined) style.letterSpacing = toCssValue(props.letterSpacing)
    if (props.textAlign) style.textAlign = props.textAlign
    if (props.textDecoration) style.textDecoration = props.textDecoration

    // Effects
    if (props.boxShadow) style.boxShadow = props.boxShadow
    if (props.opacity !== undefined) style.opacity = props.opacity
    if (props.overflow) style.overflow = props.overflow

    // Border
    if (props.borderRadius !== undefined) style.borderRadius = toCssValue(props.borderRadius)
    if (props.borderWidth !== undefined) {
        style.borderWidth = toCssValue(props.borderWidth)
        style.borderStyle = props.borderStyle || 'solid'
        if (props.borderColor) style.borderColor = props.borderColor
    }

    return style
}

/**
 * Combine class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ')
}

/**
 * Higher-order component that wraps a component with CraftJS functionality
 */
export function withCraftComponent<P extends CraftComponentProps, E extends HTMLElement = HTMLElement>(
    Component: React.ForwardRefExoticComponent<P & React.RefAttributes<E>>,
    options: Partial<WithCraftComponentOptions<P>>
) {
    const WrappedComponent: React.FC<P> = (props) => {
        const { connectors: { connect, drag } } = useNode()

        return (
            <Component
                {...props}
                ref={(el: E | null) => {
                    if (el) {
                        connect(drag(el))
                    }
                }}
            />
        )
    }

    WrappedComponent.displayName = options.displayName || Component.displayName || 'WrappedComponent'

    const craftComponent = WrappedComponent as unknown as UserComponent<P>

    craftComponent.craft = {
        displayName: options.displayName || 'Component',
        props: options.defaultProps || {},
        related: {
            // If settingsConfig provided, auto-generate settings
            // Pass defaultProps so generateSettings can auto-detect types
            settings: options.settingsConfig
                ? generateSettings<P>(options.settingsConfig, options.sectionTitle, options.defaultProps)
                : undefined as any
        },
        custom: {
            resizable: true,
            deletable: true,
        }
    }

    return craftComponent
}

