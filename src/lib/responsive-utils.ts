
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
    mobileStyle?: BlockStyle
): string {
    if (!nodeId) return ''

    let css = ''
    const className = `c-${nodeId}`

    // Desktop (Default)
    if (desktopStyle) {
        const rules = styleToCss(desktopStyle)
        if (rules) {
            css += `.${className} { ${rules} }\n`
        }
    }

    // Tablet (max-width: 1024px)
    if (tabletStyle) {
        const rules = styleToCss(tabletStyle)
        if (rules) {
            css += `@media (max-width: 1024px) { .${className} { ${rules} } }\n`
        }
    }

    // Mobile (max-width: 768px)
    if (mobileStyle) {
        const rules = styleToCss(mobileStyle)
        if (rules) {
            css += `@media (max-width: 768px) { .${className} { ${rules} } }\n`
        }
    }

    return css
}
