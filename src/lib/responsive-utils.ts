
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
        width: 'width',
        height: 'height',
        minWidth: 'min-width',
        minHeight: 'min-height',
        maxWidth: 'max-width',
        maxHeight: 'max-height',

        marginTop: 'margin-top',
        marginRight: 'margin-right',
        marginBottom: 'margin-bottom',
        marginLeft: 'margin-left',

        paddingTop: 'padding-top',
        paddingRight: 'padding-right',
        paddingBottom: 'padding-bottom',
        paddingLeft: 'padding-left',
        gap: 'gap',

        display: 'display',
        flexDirection: 'flex-direction',
        alignItems: 'align-items',
        justifyContent: 'justify-content',
        flexWrap: 'flex-wrap',

        gridTemplateColumns: 'grid-template-columns',
        gridTemplateRows: 'grid-template-rows',

        backgroundColor: 'background-color',
        borderWidth: 'border-width',
        borderColor: 'border-color',
        borderRadius: 'border-radius',

        fontSize: 'font-size',
        textAlign: 'text-align'
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
                'gap', 'borderWidth', 'borderRadius', 'fontSize'
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

    // Helper to generate visibility rules
    const generateVisibility = (breakpoint: 'mobile' | 'tablet' | 'desktop') => {
        if (responsive?.hiddenOn?.includes(breakpoint)) {
            return `display: none !important;`
        }
        return ''
    }

    // Desktop (Default) rules
    // For desktop-specific hiding (rare but possible)
    if (responsive?.hiddenOn?.includes('desktop')) {
        // Desktop is base, so just apply if we are in desktop mode (min-width 1024px usually? or base?)
        // Actually, "desktop" usually means "always" unless overridden by media query? 
        // Or "Large screens". Let's assume standard "lg" breakpoint logic: min-width: 1024px.
        // But if we hide on desktop, we should show on others?
        // Let's stick to max-width logic for consistency with previous "mobile-first" or "desktop-first" assumptions.
        // The previous implementation was "hidden on desktop" -> `lg:hidden`.
        // So @media (min-width: 1024px) { display: none !important }
        css += `@media (min-width: 1024px) { .${className} { display: none !important; } }\n`
    } else if (desktopStyle) {
        const rules = styleToCss(desktopStyle)
        if (rules) {
            css += `.${className} { ${rules} }\n`
        }
    }

    // Tablet (max-width: 1024px) AND min-width 768px? 
    // `md:max-lg:hidden` targetted 768px -> 1023px.
    // To replicate strictly: @media (min-width: 768px) and (max-width: 1023px)
    if (responsive?.hiddenOn?.includes('tablet')) {
        css += `@media (min-width: 768px) and (max-width: 1023px) { .${className} { display: none !important; } }\n`
    } else if (tabletStyle) {
        const rules = styleToCss(tabletStyle)
        if (rules) {
            css += `@media (max-width: 1024px) { .${className} { ${rules} } }\n`
        }
    }

    // Mobile (max-width: 768px)
    if (responsive?.hiddenOn?.includes('mobile')) {
        css += `@media (max-width: 767px) { .${className} { display: none !important; } }\n`
    } else if (mobileStyle) {
        const rules = styleToCss(mobileStyle)
        if (rules) {
            css += `@media (max-width: 767px) { .${className} { ${rules} } }\n`
        }
    }

    return css
}
