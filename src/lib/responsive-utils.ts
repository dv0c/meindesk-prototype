
import { BlockStyle } from "./block-api"

export const px = (val: string | number | undefined) => {
    if (val === undefined || val === null) return undefined
    if (typeof val === 'string' && val.trim() === '') return undefined
    return typeof val === 'number' ? `${val}px` : val
}

export function styleToCss(style: BlockStyle): string {
    const css: string[] = []

    // Map common properties to kebab-case CSS
    const propMap: Record<string, string> = {
        // Dimensions
        width: 'width',
        height: 'height',
        minWidth: 'min-width',
        minHeight: 'min-height',
        maxWidth: 'max-width',
        maxHeight: 'max-height',

        // Spacing
        marginTop: 'margin-top',
        marginRight: 'margin-right',
        marginBottom: 'margin-bottom',
        marginLeft: 'margin-left',
        paddingTop: 'padding-top',
        paddingRight: 'padding-right',
        paddingBottom: 'padding-bottom',
        paddingLeft: 'padding-left',
        gap: 'gap',

        // Flexbox / Layout
        display: 'display',
        flexDirection: 'flex-direction',
        alignItems: 'align-items',
        justifyContent: 'justify-content',
        flexWrap: 'flex-wrap',
        flexGrow: 'flex-grow',
        flexShrink: 'flex-shrink',
        flexBasis: 'flex-basis',

        // Grid
        gridTemplateColumns: 'grid-template-columns',
        gridTemplateRows: 'grid-template-rows',
        gridColumn: 'grid-column',
        gridRow: 'grid-row',
        justifySelf: 'justify-self',
        alignSelf: 'align-self',

        // Decoration
        backgroundColor: 'background-color',
        backgroundImage: 'background-image',
        backgroundSize: 'background-size',
        backgroundPosition: 'background-position',
        backgroundRepeat: 'background-repeat',
        borderWidth: 'border-width',
        borderColor: 'border-color',
        borderStyle: 'border-style',
        borderRadius: 'border-radius',
        boxShadow: 'box-shadow',
        opacity: 'opacity',

        // Typography
        fontSize: 'font-size',
        fontWeight: 'font-weight',
        textAlign: 'text-align',
        color: 'color',

        // Position
        position: 'position',
        top: 'top',
        right: 'right',
        bottom: 'bottom',
        left: 'left',
        zIndex: 'z-index',

        // Extras
        objectFit: 'object-fit'
    }

    Object.entries(style).forEach(([key, value]) => {
        const cssProp = propMap[key]
        if (cssProp && value !== undefined && value !== null && value !== '') {
            let processedValue = value

            // Handle px units for dimension/spacing props
            if ([
                'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
                'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
                'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                'gap', 'borderWidth', 'borderRadius', 'fontSize',
                'top', 'right', 'bottom', 'left', 'flexBasis'
            ].includes(key)) {
                processedValue = px(value)
            }

            css.push(`${cssProp}: ${processedValue};`)
        }
    })

    return css.join(' ')
}

export function generateResponsiveCss(
    nodeId: string,
    desktopStyle?: BlockStyle,
    tabletStyle?: BlockStyle,
    mobileStyle?: BlockStyle,
    responsive?: { hiddenOn?: string[] },
    options?: {
        disableHiddenOn?: boolean
    }
): string {
    if (!nodeId) return ''

    let css = ''
    const className = `c-${nodeId}`

    const disableHiddenOn = Boolean(options?.disableHiddenOn)

    // Desktop (Default / Base)
    if (!disableHiddenOn && responsive?.hiddenOn?.includes('desktop')) {
        css += `@media (min-width: 1024px) { .${className} { display: none !important; } }\n`
    } else if (desktopStyle) {
        // Base styles (no media query)
    }

    // Tablet (768px - 1023.98px)
    if (!disableHiddenOn && responsive?.hiddenOn?.includes('tablet')) {
        css += `@media (min-width: 768px) and (max-width: 1023.98px) { .${className} { display: none !important; } }\n`
    } else if (tabletStyle) {
        const rules = styleToCss(tabletStyle)
        if (rules) {
            css += `@media (min-width: 768px) and (max-width: 1023.98px) { .${className} { ${rules} } }\n`
        }
    }

    // Mobile (< 768px)
    if (!disableHiddenOn && responsive?.hiddenOn?.includes('mobile')) {
        css += `@media (max-width: 767.98px) { .${className} { display: none !important; } }\n`
    } else if (mobileStyle) {
        const rules = styleToCss(mobileStyle)
        if (rules) {
            css += `@media (max-width: 767.98px) { .${className} { ${rules} } }\n`
        }
    }

    return css
}
