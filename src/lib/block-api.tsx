import React from "react"
import { useEditor } from "@craftjs/core"
// @ts-ignore - Importing from deep app path as requested
import { useEditorTheme, type EditorTheme } from "@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ThemeContext"
// @ts-ignore
import { useDevice, type DeviceMode } from "@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/DeviceContext"
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
    // Injected props: theme, isEditing
    // Injected props: theme, isEditing, deviceMode
    render: (props: P & { theme: EditorTheme; isEditing?: boolean; deviceMode?: DeviceMode | null }) => React.ReactElement | null

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

    // Global Settings Configuration
    globalSettings?: {
        exclude?: Array<'typography' | 'responsive' | string>
    }

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

import { cn } from "@/lib/utils"

import { generateResponsiveCss } from "./responsive-utils"

export function useBlockStyles(props: {
    style?: BlockStyle,
    mobileStyle?: BlockStyle,
    tabletStyle?: BlockStyle,
    className?: string,
    responsive?: { hiddenOn?: string[] },
    isEditing?: boolean,
    deviceMode?: DeviceMode | null,
    nodeId?: string
}) {
    const { style = {}, mobileStyle, tabletStyle, className, responsive, isEditing, deviceMode, nodeId } = props
    const localId = React.useId()

    // Select the active style based on device mode (For Editor WYSIWYG)
    const activeStyle = React.useMemo(() => {
        if (!isEditing || !deviceMode) return style

        if (deviceMode === 'mobile' && mobileStyle) {
            // Merge mobile style on top of desktop style (or just use mobile style if complete override?)
            // Usually responsive styles are overrides. Let's merge.
            return { ...style, ...mobileStyle }
        }
        if (deviceMode === 'tablet' && tabletStyle) {
            return { ...style, ...tabletStyle }
        }
        return style
    }, [style, mobileStyle, tabletStyle, isEditing, deviceMode])

    const computedStyle: React.CSSProperties = React.useMemo(() => {
        const css: React.CSSProperties = {}
        const sourceStyle = activeStyle

        // Helper to add 'px' if number, pass string if string
        const px = (val: string | number | undefined) => {
            if (val === undefined) return undefined
            return typeof val === 'number' ? `${val}px` : val
        }

        // Map core style props to CSS
        // Dimensions
        if (sourceStyle.width !== undefined) css.width = px(sourceStyle.width)
        if (sourceStyle.height !== undefined) css.height = px(sourceStyle.height)
        if (sourceStyle.minWidth !== undefined) css.minWidth = px(sourceStyle.minWidth)
        if (sourceStyle.minHeight !== undefined) css.minHeight = px(sourceStyle.minHeight)
        if (sourceStyle.maxWidth !== undefined) css.maxWidth = px(sourceStyle.maxWidth)
        if (sourceStyle.maxHeight !== undefined) css.maxHeight = px(sourceStyle.maxHeight)

        // Spacing
        if (sourceStyle.marginTop !== undefined) css.marginTop = px(sourceStyle.marginTop)
        if (sourceStyle.marginRight !== undefined) css.marginRight = px(sourceStyle.marginRight)
        if (sourceStyle.marginBottom !== undefined) css.marginBottom = px(sourceStyle.marginBottom)
        if (sourceStyle.marginLeft !== undefined) css.marginLeft = px(sourceStyle.marginLeft)

        if (sourceStyle.paddingTop !== undefined) css.paddingTop = px(sourceStyle.paddingTop)
        if (sourceStyle.paddingRight !== undefined) css.paddingRight = px(sourceStyle.paddingRight)
        if (sourceStyle.paddingBottom !== undefined) css.paddingBottom = px(sourceStyle.paddingBottom)
        if (sourceStyle.paddingLeft !== undefined) css.paddingLeft = px(sourceStyle.paddingLeft)
        if (sourceStyle.gap !== undefined) css.gap = px(sourceStyle.gap)

        // Decoration
        if (sourceStyle.backgroundColor) css.backgroundColor = sourceStyle.backgroundColor
        if (sourceStyle.backgroundImage) css.backgroundImage = sourceStyle.backgroundImage
        if (sourceStyle.backgroundSize) css.backgroundSize = sourceStyle.backgroundSize
        if (sourceStyle.backgroundPosition) css.backgroundPosition = sourceStyle.backgroundPosition
        if (sourceStyle.backgroundRepeat) css.backgroundRepeat = sourceStyle.backgroundRepeat as any

        if (sourceStyle.borderWidth !== undefined) css.borderWidth = px(sourceStyle.borderWidth)
        if (sourceStyle.borderColor) css.borderColor = sourceStyle.borderColor
        if (sourceStyle.borderStyle) css.borderStyle = sourceStyle.borderStyle
        if (sourceStyle.borderRadius !== undefined) css.borderRadius = px(sourceStyle.borderRadius)
        if (sourceStyle.boxShadow) css.boxShadow = sourceStyle.boxShadow
        if (sourceStyle.opacity !== undefined) css.opacity = sourceStyle.opacity

        // Typography
        if (sourceStyle.color) css.color = sourceStyle.color
        if (sourceStyle.fontSize !== undefined) css.fontSize = px(sourceStyle.fontSize)
        if (sourceStyle.fontWeight) css.fontWeight = sourceStyle.fontWeight
        if (sourceStyle.textAlign) css.textAlign = sourceStyle.textAlign

        // Layout
        if (sourceStyle.display) css.display = sourceStyle.display
        if (sourceStyle.flexDirection) css.flexDirection = sourceStyle.flexDirection
        if (sourceStyle.alignItems) css.alignItems = sourceStyle.alignItems
        if (sourceStyle.justifyContent) css.justifyContent = sourceStyle.justifyContent
        if (sourceStyle.flexWrap) css.flexWrap = sourceStyle.flexWrap
        if (sourceStyle.flexGrow !== undefined) css.flexGrow = sourceStyle.flexGrow
        if (sourceStyle.flexShrink !== undefined) css.flexShrink = sourceStyle.flexShrink
        if (sourceStyle.flexBasis !== undefined) css.flexBasis = px(sourceStyle.flexBasis)

        // Position
        if (sourceStyle.position) css.position = sourceStyle.position
        if (sourceStyle.top !== undefined) css.top = px(sourceStyle.top)
        if (sourceStyle.right !== undefined) css.right = px(sourceStyle.right)
        if (sourceStyle.bottom !== undefined) css.bottom = px(sourceStyle.bottom)
        if (sourceStyle.left !== undefined) css.left = px(sourceStyle.left)
        if (sourceStyle.zIndex !== undefined) css.zIndex = sourceStyle.zIndex

        // Grid Child Props
        if (sourceStyle.gridColumn) css.gridColumn = sourceStyle.gridColumn
        if (sourceStyle.gridRow) css.gridRow = sourceStyle.gridRow
        if (sourceStyle.justifySelf) css.justifySelf = sourceStyle.justifySelf
        if (sourceStyle.alignSelf) css.alignSelf = sourceStyle.alignSelf

        // Media
        if (sourceStyle.objectFit) css.objectFit = sourceStyle.objectFit as any

        return { ...css, ...sourceStyle } // Merge any unhandled keys
    }, [activeStyle])

    // Generate Responsive Visibility Classes
    const responsiveClasses = React.useMemo(() => {
        if (!responsive?.hiddenOn || responsive.hiddenOn.length === 0) return ""
        const classes: string[] = []
        const isHidden = (bp: string) => responsive.hiddenOn?.includes(bp)

        // Mobile (< 768px in standard Tailwind, or 'max-md' usually means < 768px)
        if (isHidden('mobile')) {
            if (isEditing) classes.push('max-md:opacity-25 max-md:outline-dashed max-md:outline-1 max-md:outline-rose-400')
            else classes.push('max-md:hidden')
        }
        // Tablet (768px - 1024px)
        if (isHidden('tablet')) {
            if (isEditing) classes.push('md:max-lg:opacity-25 md:max-lg:outline-dashed md:max-lg:outline-1 md:max-lg:outline-rose-400')
            else classes.push('md:max-lg:hidden')
        }
        // Desktop (>= 1024px)
        if (isHidden('desktop')) {
            if (isEditing) classes.push('lg:opacity-25 lg:outline-dashed lg:outline-1 lg:outline-rose-400')
            else classes.push('lg:hidden')
        }

        return classes.join(" ")
    }, [responsive, isEditing])

    // View Mode Visibility Override (for Editor/Preview simulation)
    const viewModeOverride = React.useMemo(() => {
        if (!deviceMode || !responsive?.hiddenOn) return {}

        if (responsive.hiddenOn.includes(deviceMode)) {
            if (isEditing) {
                // Editor Mode: Visual cue (Simulated)
                return {
                    opacity: 0.25,
                    outline: '1px dashed #fb7185', // rose-400
                    outlineOffset: -1
                }
            } else {
                // Preview Mode: Truly hidden (Simulated)
                return {
                    display: 'none'
                }
            }
        }
        return {}
    }, [deviceMode, responsive, isEditing])

    // Generated CSS for Runtime (if not editing or if we want to preview real media queries)
    // Actually, in Editor we rely on inline style switching (activeStyle).
    // In Runtime (published), we need the <style> block.
    // We can return the CSS string if nodeId is provided.
    const resolvedNodeId = React.useMemo(() => {
        const raw = nodeId || `uid-${localId}`
        return String(raw).replace(/[^a-zA-Z0-9_-]/g, "")
    }, [nodeId, localId])

    const generatedCss = React.useMemo(() => {
        return generateResponsiveCss(resolvedNodeId, style, tabletStyle, mobileStyle, responsive)
    }, [resolvedNodeId, style, tabletStyle, mobileStyle, responsive])

    const uniqueClassName = `c-${resolvedNodeId}`

    React.useEffect(() => {
        if (!generatedCss || typeof document === 'undefined') return
        const styleId = `responsive-style-${uniqueClassName}`
        let styleEl = document.getElementById(styleId) as HTMLStyleElement | null

        if (!styleEl) {
            styleEl = document.createElement('style')
            styleEl.id = styleId
            document.head.appendChild(styleEl)
        }
        styleEl.textContent = generatedCss

        return () => {
            if (styleEl && styleEl.parentNode) {
                styleEl.parentNode.removeChild(styleEl)
            }
        }
    }, [generatedCss, uniqueClassName])

    return {
        style: { ...computedStyle, ...viewModeOverride },
        className: cn(className, responsiveClasses, uniqueClassName),
        css: generatedCss
    }
}

// --- Main API Function ---

export function defineBlock<P extends object>(config: BlockConfig<P>): BlockAPI<P> {
    if (process.env.NODE_ENV !== 'production' && config.settingsConfig) {
        const knownKeys = new Set<string>([
            ...Object.keys((config.defaultProps || {}) as Record<string, unknown>),
            'style',
            'mobileStyle',
            'tabletStyle',
            'responsive',
            'className'
        ])
        Object.keys(config.settingsConfig).forEach((key) => {
            if (!knownKeys.has(key)) {
                console.warn(`[defineBlock:${config.name}] settings key '${key}' is not in defaultProps. Check if this prop is wired in render.`)
            }
        })
    }

    const Component: React.FC<P> = (props) => {
        const { theme } = useEditorTheme()
        const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))
        const deviceContext = useDevice()

        // Call render function directly to expose the underlying element to BlockWrapper
        // This effectively "inlines" the user's component logic into this wrapper,
        // allowing us to inject refs into the returned generic HTML element (e.g. div).
        const rendered = config.render({ ...props, theme, isEditing: enabled, deviceMode: deviceContext?.deviceMode })

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
        const deviceContext = useDevice()
        const Render = config.render
        // Render directly without BlockWrapper
        return <Render {...props} theme={theme} isEditing={false} deviceMode={deviceContext?.deviceMode} />
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
                    <GlobalStylesPanel exclude={config.globalSettings?.exclude} />
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
