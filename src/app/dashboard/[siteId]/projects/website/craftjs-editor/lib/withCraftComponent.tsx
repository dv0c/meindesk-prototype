import { useNode, UserComponent } from '@craftjs/core'
import React from 'react'
import { generateSettings, SettingsConfig } from './generateSettings'

/**
 * Common props that all Craft components can have
 */
export interface CraftComponentProps {
    // Spacing
    marginTop?: number
    marginRight?: number
    marginBottom?: number
    marginLeft?: number
    paddingTop?: number
    paddingRight?: number
    paddingBottom?: number
    paddingLeft?: number

    // Sizing
    width?: string
    height?: string
    minWidth?: string
    maxWidth?: string
    minHeight?: string

    // Colors
    backgroundColor?: string
    color?: string

    // Border
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'

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
export function propsToStyle(props: CraftComponentProps): React.CSSProperties {
    const style: React.CSSProperties = { ...props.style }

    // Spacing
    if (props.marginTop !== undefined) style.marginTop = `${props.marginTop}px`
    if (props.marginRight !== undefined) style.marginRight = `${props.marginRight}px`
    if (props.marginBottom !== undefined) style.marginBottom = `${props.marginBottom}px`
    if (props.marginLeft !== undefined) style.marginLeft = `${props.marginLeft}px`
    if (props.paddingTop !== undefined) style.paddingTop = `${props.paddingTop}px`
    if (props.paddingRight !== undefined) style.paddingRight = `${props.paddingRight}px`
    if (props.paddingBottom !== undefined) style.paddingBottom = `${props.paddingBottom}px`
    if (props.paddingLeft !== undefined) style.paddingLeft = `${props.paddingLeft}px`

    // Sizing
    if (props.width) style.width = props.width
    if (props.height) style.height = props.height
    if (props.minWidth) style.minWidth = props.minWidth
    if (props.maxWidth) style.maxWidth = props.maxWidth
    if (props.minHeight) style.minHeight = props.minHeight

    // Colors
    if (props.backgroundColor) style.backgroundColor = props.backgroundColor
    if (props.color) style.color = props.color

    // Border
    if (props.borderRadius !== undefined) style.borderRadius = `${props.borderRadius}px`
    if (props.borderWidth !== undefined) {
        style.borderWidth = `${props.borderWidth}px`
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
export function withCraftComponent<P extends CraftComponentProps>(
    Component: React.ForwardRefExoticComponent<P & React.RefAttributes<HTMLElement>>,
    options: Partial<WithCraftComponentOptions<P>>
) {
    const WrappedComponent: React.FC<P> = (props) => {
        const { connectors: { connect, drag } } = useNode()

        return (
            <Component
                {...props}
                ref={(el: HTMLElement | null) => {
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

