import React from "react"
// @ts-ignore - Importing from deep app path as requested
import { useEditorTheme, type EditorTheme } from "@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ThemeContext"
import { BlockWrapper } from "@/components/editor/BlockWrapper"
// @ts-ignore
import { GlobalStylesPanel } from "@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/GlobalSettings"
// @ts-ignore
import { generateSettings, SettingsConfig } from "@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/lib/generateSettings"

// --- Types ---

export { EditorTheme as Theme }

export type Breakpoint = 'desktop' | 'tablet' | 'mobile'

export interface BlockStyle {
    // Dimensions
    width?: string | number
    height?: string | number
    minWidth?: string | number
    minHeight?: string | number
    maxWidth?: string | number
    maxHeight?: string | number

    // Spacing
    marginTop?: string | number
    marginRight?: string | number
    marginBottom?: string | number
    marginLeft?: string | number
    paddingTop?: string | number
    paddingRight?: string | number
    paddingBottom?: string | number
    paddingLeft?: string | number
    gap?: string | number

    // Decoration
    backgroundColor?: string
    backgroundImage?: string
    backgroundSize?: string
    backgroundPosition?: string
    backgroundRepeat?: string
    borderWidth?: string | number
    borderColor?: string
    borderStyle?: string
    borderRadius?: string | number
    boxShadow?: string
    opacity?: number

    // Typography (Common)
    color?: string
    fontSize?: string | number
    fontWeight?: string | number
    textAlign?: 'left' | 'center' | 'right' | 'justify'

    // Layout (Flex/Grid helpers)
    display?: 'block' | 'flex' | 'grid' | 'none' | 'inline-flex' | 'inline-block'
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
    flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
    flexGrow?: number
    flexShrink?: number
    flexBasis?: string | number

    // Position
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
    top?: string | number
    right?: string | number
    bottom?: string | number
    left?: string | number
    zIndex?: number

    // Grid Child Props
    gridColumn?: string
    gridRow?: string
    justifySelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch'
    alignSelf?: 'auto' | 'start' | 'end' | 'center' | 'stretch' | 'baseline'

    // Media
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

    // Any other CSS properties
    [key: string]: any
}

// Editor settings schema (placeholder for now)
export type EditorSettingsSchema = any

// Extends the prompt's type definition with more specific CraftJS needs
export interface BlockConfig<P> {
    name: string
    category?: string
    description?: string
    icon?: React.ReactNode

    // Default properties including style defaults
    defaultProps?: Partial<P> & {
        style?: BlockStyle
    }

    // Responsive overrides
    responsiveProps?: Partial<
        Record<Breakpoint, Partial<P> & { style?: BlockStyle }>
    >

    // The component to render
    // Injected props: theme
    render: (props: P & { theme: EditorTheme }) => React.ReactElement

    // Craft.js specific rules
    rules?: {
        canDrag?: (node: any) => boolean
        canDrop?: (target: any) => boolean
        canMoveIn?: (incomingNodes: any[], currentNode: any, helpers: any) => boolean
        canMoveOut?: (outgoingNodes: any[], currentNode: any, helpers: any) => boolean
    }

    // Constraints
    childrenAllowed?: boolean
    parentTypesAllowed?: string[]

    // Custom settings component
    settings?: React.ComponentType<any>
    settingsConfig?: SettingsConfig
    editorSettings?: EditorSettingsSchema
}

// Data passed to the generic wrapper
export interface BlockAPI<P = any> extends React.FC<P> {
    craft: {
        displayName: string
        props: Partial<P>
        rules: any
        related: {
            settings: React.ComponentType<any>
        }
        custom: {
            category?: string
            icon?: React.ReactNode
            description?: string
        }
    }
    // SSR-safe runtime component
    Runtime: React.FC<P>
}

// --- Hook for Style Generation ---

export function useBlockStyles(props: { style?: BlockStyle, className?: string }) {
    const { style = {}, className } = props

    const computedStyle: React.CSSProperties = React.useMemo(() => {
        const css: React.CSSProperties = {}

        // Helper to add 'px' if number, pass string if string
        const px = (val: string | number | undefined) => {
            if (val === undefined) return undefined
            return typeof val === 'number' ? `${val}px` : val
        }

        // Map core style props to CSS
        // Dimensions
        if (style.width !== undefined) css.width = px(style.width)
        if (style.height !== undefined) css.height = px(style.height)
        if (style.minWidth !== undefined) css.minWidth = px(style.minWidth)
        if (style.minHeight !== undefined) css.minHeight = px(style.minHeight)
        if (style.maxWidth !== undefined) css.maxWidth = px(style.maxWidth)
        if (style.maxHeight !== undefined) css.maxHeight = px(style.maxHeight)

        // Spacing
        if (style.marginTop !== undefined) css.marginTop = px(style.marginTop)
        if (style.marginRight !== undefined) css.marginRight = px(style.marginRight)
        if (style.marginBottom !== undefined) css.marginBottom = px(style.marginBottom)
        if (style.marginLeft !== undefined) css.marginLeft = px(style.marginLeft)

        if (style.paddingTop !== undefined) css.paddingTop = px(style.paddingTop)
        if (style.paddingRight !== undefined) css.paddingRight = px(style.paddingRight)
        if (style.paddingBottom !== undefined) css.paddingBottom = px(style.paddingBottom)
        if (style.paddingLeft !== undefined) css.paddingLeft = px(style.paddingLeft)
        if (style.gap !== undefined) css.gap = px(style.gap)

        // Decoration
        if (style.backgroundColor) css.backgroundColor = style.backgroundColor
        if (style.backgroundImage) css.backgroundImage = style.backgroundImage
        if (style.backgroundSize) css.backgroundSize = style.backgroundSize
        if (style.backgroundPosition) css.backgroundPosition = style.backgroundPosition
        if (style.backgroundRepeat) css.backgroundRepeat = style.backgroundRepeat as any

        if (style.borderWidth !== undefined) css.borderWidth = px(style.borderWidth)
        if (style.borderColor) css.borderColor = style.borderColor
        if (style.borderStyle) css.borderStyle = style.borderStyle
        if (style.borderRadius !== undefined) css.borderRadius = px(style.borderRadius)
        if (style.boxShadow) css.boxShadow = style.boxShadow
        if (style.opacity !== undefined) css.opacity = style.opacity

        // Typography
        if (style.color) css.color = style.color
        if (style.fontSize !== undefined) css.fontSize = px(style.fontSize)
        if (style.fontWeight) css.fontWeight = style.fontWeight
        if (style.textAlign) css.textAlign = style.textAlign

        // Layout
        if (style.display) css.display = style.display
        if (style.flexDirection) css.flexDirection = style.flexDirection
        if (style.alignItems) css.alignItems = style.alignItems
        if (style.justifyContent) css.justifyContent = style.justifyContent
        if (style.flexWrap) css.flexWrap = style.flexWrap
        if (style.flexGrow !== undefined) css.flexGrow = style.flexGrow
        if (style.flexShrink !== undefined) css.flexShrink = style.flexShrink
        if (style.flexBasis !== undefined) css.flexBasis = px(style.flexBasis)

        // Position
        if (style.position) css.position = style.position
        if (style.top !== undefined) css.top = px(style.top)
        if (style.right !== undefined) css.right = px(style.right)
        if (style.bottom !== undefined) css.bottom = px(style.bottom)
        if (style.left !== undefined) css.left = px(style.left)
        if (style.zIndex !== undefined) css.zIndex = style.zIndex

        // Grid Child Props
        if (style.gridColumn) css.gridColumn = style.gridColumn
        if (style.gridRow) css.gridRow = style.gridRow
        if (style.justifySelf) css.justifySelf = style.justifySelf
        if (style.alignSelf) css.alignSelf = style.alignSelf

        // Media
        if (style.objectFit) css.objectFit = style.objectFit as any

        return { ...css, ...style } // Merge any unhandled keys
    }, [style])

    return { style: computedStyle, className }
}

// --- Main API Function ---

export function defineBlock<P extends object>(config: BlockConfig<P>): BlockAPI<P> {
    const Component: React.FC<P> = (props) => {
        const { theme } = useEditorTheme()

        const Render = config.render
        const rendered = <Render {...props} theme={theme} />

        // Internal BlockWrapper integration
        return (
            <BlockWrapper>
                {rendered}
            </BlockWrapper>
        )
    }

    // 2. Runtime Component (unwrapped, safe for SSR)
    const RuntimeComponent: React.FC<P> = (props) => {
        const { theme } = useEditorTheme()
        const Render = config.render
        // Render directly without BlockWrapper
        return <Render {...props} theme={theme} />
    }

    // Attach Craft.js static properties
    const CraftComponent = Component as BlockAPI<P>
    CraftComponent.Runtime = RuntimeComponent

    // ... (existing code)

    // Compose Settings if needed
    const CombinedSettings = () => {
        // Use manual settings or generated settings
        const Settings = config.settings || (config.settingsConfig ? generateSettings(config.settingsConfig, 'Content', config.defaultProps) : null)

        return (
            <div className="space-y-6">
                {Settings && <Settings />}
                <div className="pt-4 border-t">
                    <GlobalStylesPanel />
                </div>
            </div>
        )
    }

    CraftComponent.craft = {
        displayName: config.name,
        props: config.defaultProps || {},
        rules: {
            canDrag: () => true,
            canMoveIn: () => config.childrenAllowed === true,
            ...config.rules,
            ...(config.childrenAllowed !== undefined || config.parentTypesAllowed !== undefined ? {
                // Future reinforcement of rules
            } : {})
        },
        related: {
            settings: CombinedSettings
        },
        custom: {
            category: config.category,
            icon: config.icon,
            description: config.description
        }
    }

    return CraftComponent
}
