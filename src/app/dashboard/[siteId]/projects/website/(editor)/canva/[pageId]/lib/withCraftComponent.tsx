import { useNode, useEditor, UserComponent } from '@craftjs/core'
import React, { useState, useRef, useEffect, useCallback, type JSX } from 'react'
import { generateSettings, SettingsConfig } from './generateSettings'
import { useSite } from '@/components/Contexts/site-id-context'
import { useDevice } from '../components/DeviceContext'
import MediaLibraryDialog, { MediaItem } from '@/components/MediaGallery/media-select'
import { STANDARD_DEFAULTS, StandardStyleSettings, createCombinedSettings } from './StandardStyleSettings'

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
    responsive?: {
        hiddenOn?: Array<'desktop' | 'tablet' | 'mobile'>
    }
}

/**
 * Options for withCraftComponent HOC
 */
interface WithCraftComponentOptions<P> {
    displayName: string
    defaultProps?: Partial<P>
    settingsConfig?: SettingsConfig  // Auto-generate content settings
    sectionTitle?: string  // Section title for auto-generated settings

    // Standard settings options
    includeStyleSettings?: boolean  // Auto-include style settings (default: true)
    includeStandardDefaults?: boolean  // Merge standard defaults (default: true)
    customSettings?: React.ComponentType  // Custom settings component (instead of auto-generated)
}

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
 * Allowed text element types for EditableText
 * Using a constrained union instead of `keyof JSX.IntrinsicElements` 
 * to avoid "union type too complex" TypeScript errors
 */
type TextElementType =
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'p' | 'span' | 'div' | 'label'
    | 'strong' | 'em' | 'b' | 'i' | 'u' | 's'
    | 'small' | 'mark' | 'sub' | 'sup'
    | 'blockquote' | 'q' | 'cite'
    | 'a' | 'li'

/**
 * Props for EditableText component
 */
interface EditableTextProps {
    /** The prop name to update when text changes */
    propName: string
    /** Current value of the text */
    value: string
    /** HTML tag to render (default: 'span') */
    as?: TextElementType
    /** Additional class names */
    className?: string
    /** Additional inline styles */
    style?: React.CSSProperties
    /** Children to render (usually not needed, value is rendered) */
    children?: React.ReactNode
    /** Optional resolved value to display when not editing */
    renderValue?: string
}

/**
 * A component that makes text editable inline in the CraftJS editor.
 * Use this inside components wrapped with withCraftComponent.
 * 
 * Usage:
 * <EditableText propName="heading" value={heading} as="h1" className="text-xl" />
 */
export function EditableText({
    propName,
    value,
    as: Tag = 'span',
    className,
    style,
    children,
    renderValue,
}: EditableTextProps) {
    const {
        selected,
        actions: { setProp },
    } = useNode((state) => ({
        selected: state.events.selected,
    }))

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }))

    const [isEditing, setIsEditing] = useState(false)
    const contentRef = useRef<HTMLElement>(null)

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!enabled) return
        e.stopPropagation()
        if (selected) {
            setIsEditing(true)
        }
    }, [enabled, selected])

    const handleBlur = useCallback(() => {
        setIsEditing(false)
        if (contentRef.current) {
            const newText = contentRef.current.innerText.trim()
            if (newText && newText !== value) {
                setProp((props: Record<string, any>) => {
                    props[propName] = newText
                })
            }
        }
    }, [setProp, propName, value])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            contentRef.current?.blur()
        }
        if (e.key === "Escape") {
            setIsEditing(false)
            if (contentRef.current) {
                contentRef.current.innerText = value || ""
            }
        }
    }, [value])

    // When deselected, exit edit mode
    useEffect(() => {
        if (!selected && isEditing) {
            setIsEditing(false)
        }
    }, [selected, isEditing])

    // Focus and select text when entering edit mode
    useEffect(() => {
        if (isEditing && contentRef.current) {
            contentRef.current.focus()

            // If checking switching from resolved to raw, we need to ensure content is raw
            // React render cycle handles the DOM update via children below, 
            // BUT contentEditable might need help if the DOM node was just updated

            // Small timeout safely ensures DOM is updated with 'value' before we select
            setTimeout(() => {
                if (contentRef.current) {
                    const range = document.createRange()
                    range.selectNodeContents(contentRef.current)
                    const selection = window.getSelection()
                    selection?.removeAllRanges()
                    selection?.addRange(range)
                }
            }, 0)
        }
    }, [isEditing])

    const combinedStyle: React.CSSProperties = {
        ...style,
        outline: isEditing ? "none" : undefined,
        cursor: enabled ? (isEditing ? "text" : "pointer") : undefined,
    }

    // Display logic: 
    // If editing: show raw value (template)
    // If not editing: show renderValue (resolved) if available, else value
    const content = isEditing ? value : (renderValue ?? value)

    return (
        <Tag
            ref={contentRef as any}
            className={className}
            style={combinedStyle}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onClick={handleClick}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
        >
            {children ?? content}
        </Tag>
    )
}

/**
 * Props for EditableImage component
 */
interface EditableImageProps {
    /** The prop name to update when image changes */
    propName: string
    /** Current image URL */
    src: string
    /** Alt text for the image */
    alt?: string
    /** Additional class names */
    className?: string
    /** Additional inline styles */
    style?: React.CSSProperties
    /** Width of the image */
    width?: number | string
    /** Height of the image */
    height?: number | string
}

/**
 * A component that makes an image editable in the CraftJS editor.
 * Clicking on the image opens the media picker dialog.
 * Use this inside components wrapped with withCraftComponent.
 * 
 * Usage:
 * <EditableImage propName="thumbnail" src={thumbnail} alt="Hero Image" className="w-full h-auto" />
 */
export function EditableImage({
    propName,
    src,
    alt = "Image",
    className,
    style,
    width,
    height,
}: EditableImageProps) {
    const {
        selected,
        actions: { setProp },
    } = useNode((state) => ({
        selected: state.events.selected,
    }))

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }))

    const { siteId } = useSite()
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!enabled) return
        e.stopPropagation()
        if (selected) {
            setIsMediaPickerOpen(true)
        }
    }, [enabled, selected])

    const handleMediaSelect = useCallback((items: MediaItem[]) => {
        if (items.length > 0) {
            setProp((props: Record<string, any>) => {
                props[propName] = items[0].url
            })
        }
        setIsMediaPickerOpen(false)
    }, [setProp, propName])

    const combinedStyle: React.CSSProperties = {
        ...style,
        cursor: enabled && selected ? "pointer" : undefined,
    }

    return (
        <>
            <img
                src={src || "/placeholder.svg"}
                alt={alt}
                width={width}
                height={height}
                className={className}
                style={combinedStyle}
                onClick={handleClick}
            />
            {siteId && (
                <MediaLibraryDialog
                    siteId={siteId}
                    isOpen={isMediaPickerOpen}
                    onClose={() => setIsMediaPickerOpen(false)}
                    onSelect={handleMediaSelect}
                    multiSelect={false}
                />
            )}
        </>
    )
}

/**
 * Hook for inline text editing in CraftJS components
 * Returns props and handlers to make an element editable when clicked in the editor
 */
export function useInlineEdit<T extends HTMLElement = HTMLElement>(
    propName: string,
    currentValue: string
) {
    const {
        connectors: { connect, drag },
        selected,
        id,
        actions: { setProp },
    } = useNode((state) => ({
        selected: state.events.selected,
        id: state.id,
    }))

    const { actions: editorActions, enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }))

    const [isEditing, setIsEditing] = useState(false)
    const contentRef = useRef<T>(null)

    // Single click to edit when already selected (only in editor mode)
    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!enabled) return
        e.stopPropagation()
        if (selected) {
            setIsEditing(true)
        } else {
            editorActions.selectNode(id)
        }
    }, [enabled, selected, editorActions, id])

    const handleBlur = useCallback(() => {
        setIsEditing(false)
        if (contentRef.current) {
            const newText = contentRef.current.innerText.trim()
            if (newText) {
                setProp((props: Record<string, any>) => {
                    props[propName] = newText
                })
            }
        }
    }, [setProp, propName])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            contentRef.current?.blur()
        }
        if (e.key === "Escape") {
            setIsEditing(false)
            if (contentRef.current) {
                contentRef.current.innerText = currentValue || ""
            }
        }
    }, [currentValue])

    // When deselected, exit edit mode
    useEffect(() => {
        if (!selected && isEditing) {
            setIsEditing(false)
        }
    }, [selected, isEditing])

    // Focus and select text when entering edit mode
    useEffect(() => {
        if (isEditing && contentRef.current) {
            contentRef.current.focus()
            const range = document.createRange()
            range.selectNodeContents(contentRef.current)
            const selection = window.getSelection()
            selection?.removeAllRanges()
            selection?.addRange(range)
        }
    }, [isEditing])

    // Ref callback that combines content ref with CraftJS connectors
    const refCallback = useCallback((ref: T | null) => {
        (contentRef as React.MutableRefObject<T | null>).current = ref
        if (ref) connect(drag(ref))
    }, [connect, drag])

    return {
        // State
        isEditing,
        enabled,
        selected,

        // Refs
        contentRef,
        refCallback,

        // Handlers
        handleClick,
        handleBlur,
        handleKeyDown,

        // Props to spread on the element
        editableProps: {
            contentEditable: isEditing,
            suppressContentEditableWarning: true,
            onClick: handleClick,
            onBlur: handleBlur,
            onKeyDown: handleKeyDown,
        },

        // Style helpers
        editableStyle: {
            outline: isEditing ? "none" : undefined,
            cursor: enabled ? (isEditing ? "text" : "pointer") : undefined,
        } as React.CSSProperties,
    }
}

/**
 * Higher-order component that wraps a component with CraftJS functionality
 * 
 * Features:
 * - Automatic standard style settings (margin, padding, colors, border, etc.)
 * - Standard default props merged with component defaults
 * - Auto-generated content settings from settingsConfig
 * - CraftJS connectors (connect, drag) automatically applied
 */
export function withCraftComponent<P extends CraftComponentProps, E extends HTMLElement = HTMLElement>(
    Component: React.ForwardRefExoticComponent<P & React.RefAttributes<E>>,
    options: Partial<WithCraftComponentOptions<P>>
) {
    if (process.env.NODE_ENV !== 'production' && options.settingsConfig) {
        const known = new Set<string>([
            ...Object.keys((options.defaultProps || {}) as Record<string, unknown>),
            ...Object.keys(STANDARD_DEFAULTS),
            'style',
            'className'
        ])

        Object.keys(options.settingsConfig).forEach((key) => {
            if (!known.has(key)) {
                console.warn(`[withCraftComponent:${options.displayName || Component.displayName || 'Component'}] settings key '${key}' is not in defaultProps/standard props. Verify render wiring.`)
            }
        })
    }

    // Determine settings behavior
    const includeStyleSettings = options.includeStyleSettings !== false // Default: true
    const includeStandardDefaults = options.includeStandardDefaults !== false // Default: true

    const WrappedComponent: React.FC<P> = (props) => {
        const { connectors: { connect, drag }, nodeProps } = useNode((node) => ({
            nodeProps: node.data.props
        }))
        const { enabled } = useEditor((state) => ({
            enabled: state.options.enabled
        }))
        const deviceContext = useDevice()
        const currentDevice = deviceContext?.deviceMode

        const responsive = (nodeProps as any)?.responsive
        const hiddenOn = responsive?.hiddenOn || []
        const responsiveClasses = enabled
            ? ''
            : [
                hiddenOn.includes('mobile') ? 'max-md:hidden' : '',
                hiddenOn.includes('tablet') ? 'md:max-lg:hidden' : '',
                hiddenOn.includes('desktop') ? 'lg:hidden' : '',
            ].filter(Boolean).join(' ')

        const isHiddenOnCurrentDevice = Boolean(
            enabled && currentDevice && hiddenOn.includes(currentDevice)
        )

        const stylePreviewOverride = isHiddenOnCurrentDevice
            ? {
                opacity: 0.25,
                outline: '1px dashed #fb7185',
                outlineOffset: -1,
            }
            : {}

        const mergedClassName = cn(
            (props as any).className,
            (nodeProps as any)?.className,
            responsiveClasses
        )

        const mergedStyle = {
            ...((props as any).style || {}),
            ...((nodeProps as any)?.style || {}),
            ...stylePreviewOverride,
        }

        return (
            <Component
                {...props}
                {...(nodeProps as Partial<P>)}
                className={mergedClassName as any}
                style={mergedStyle as any}
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

    // Build merged default props (standard defaults + component defaults)
    const mergedDefaults = includeStandardDefaults
        ? { ...STANDARD_DEFAULTS, ...(options.defaultProps || {}) }
        : (options.defaultProps || {})

    // Build settings component
    let SettingsComponent: React.ComponentType | undefined = undefined

    if (options.customSettings) {
        // Use custom settings if provided
        SettingsComponent = includeStyleSettings
            ? createCombinedSettings(options.customSettings, { showStyles: true })
            : options.customSettings
    } else if (options.settingsConfig) {
        // Auto-generate content settings
        const ContentSettings = generateSettings<P>(
            options.settingsConfig,
            options.sectionTitle || 'Content',
            options.defaultProps
        )
        SettingsComponent = includeStyleSettings
            ? createCombinedSettings(ContentSettings, { showStyles: true })
            : ContentSettings
    } else if (includeStyleSettings) {
        // Only style settings (no content settings)
        SettingsComponent = StandardStyleSettings
    }

    craftComponent.craft = {
        displayName: options.displayName || 'Component',
        props: mergedDefaults,
        related: {
            settings: SettingsComponent
        },
        custom: {
            resizable: true,
            deletable: true,
        }
    }

    return craftComponent
}
