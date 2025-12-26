import { useNode, UserComponent } from '@craftjs/core'
import React from 'react'

/**
 * Common props that all wrapped components will accept
 */
export interface CraftComponentProps {
    className?: string
    style?: React.CSSProperties

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
 * Higher-Order Component that wraps CraftJS components with common logic
 */
export function withCraftComponent<P extends CraftComponentProps>(
    Component: React.ComponentType<P>,
    config?: {
        displayName?: string
        defaultProps?: Partial<P>
    }
): UserComponent<P> {
    const WrappedComponent = (props: P) => {
        const { connectors: { connect, drag } } = useNode()

        // Merge default props
        const mergedProps = { ...config?.defaultProps, ...props } as P

        // Convert props to styles
        const style = propsToStyle(mergedProps)
        const className = cn(mergedProps.className)

        return (
            <Component
                {...mergedProps}
                ref={(ref: HTMLElement | null) => ref && connect(drag(ref))}
                style={style}
                className={className}
            />
        )
    }

    WrappedComponent.displayName = config?.displayName || Component.displayName || 'CraftComponent'

    return WrappedComponent as UserComponent<P>
}
