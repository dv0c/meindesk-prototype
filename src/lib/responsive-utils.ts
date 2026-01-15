
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
    responsive?: { hiddenOn?: string[] }
): string {
    if (!nodeId) return ''

    let css = ''
    const className = `c-${nodeId}`

    // Desktop (Default / Base)
    // We assume desktop is the base style.
    // However, if we want to be strictly specific about overrides:
    if (responsive?.hiddenOn?.includes('desktop')) {
        css += `@media (min-width: 1024px) { .${className} { display: none !important; } }\n`
    } else if (desktopStyle) {
        // We usually don't wrap desktop styles in a media query if they are the "default".
        // BUT, if we want to ensure they don't leak into mobile if mobile overwrites them?
        // Standard approach: Base styles are mobile-first or desktop-first.
        // Given the code structure, Desktop seems to be the "Default".
        // So we apply them without query? Or min-width: 1024px?
        // If we apply without query, they apply everywhere.
        // Then tablet/mobile overrides them. This is "Desktop First" logic IF the overrides work.
        // Let's stick to base styles (no media query) for desktop for now, as that's standard
        // unless we want to strictly isolate them.
        // Re-reading previous logic: it was applying base styles via inline styles usually?
        // Actually `useBlockStyles` applies base style to the `style` prop of the React element.
        // So we ONLY need to generate CSS for the RESPONSIVE overrides (Tablet/Mobile).
        // AND for Desktop specific overrides if we were doing mobile-first.
        // Here, we successfully apply tablet/mobile overrides via media queries.
    }

    // Tablet (768px - 1023.98px)
    // This range ensures no overlap with 1024px desktop start.
    if (responsive?.hiddenOn?.includes('tablet')) {
        css += `@media (min-width: 768px) and (max-width: 1023.98px) { .${className} { display: none !important; } }\n`
    } else if (tabletStyle) {
        const rules = styleToCss(tabletStyle)
        if (rules) {
            css += `@media (min-width: 768px) and (max-width: 1023.98px) { .${className} { ${rules} } }\n`
        }
    }

    // Mobile (< 768px)
    // Using 767.98px to be safe against subpixel rounding issues.
    if (responsive?.hiddenOn?.includes('mobile')) {
        css += `@media (max-width: 767.98px) { .${className} { display: none !important; } }\n`
    } else if (mobileStyle) {
        const rules = styleToCss(mobileStyle)
        if (rules) {
            css += `@media (max-width: 767.98px) { .${className} { ${rules} } }\n`
        }
    }

    return css
}
