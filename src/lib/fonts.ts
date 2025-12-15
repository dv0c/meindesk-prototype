// Font configuration types and utilities

export interface FontConfig {
    family: string          // e.g., "Roboto", "Custom Font"
    type: "google" | "custom"
    weights?: number[]      // e.g., [400, 700]
    subsets?: string[]      // e.g., ["latin", "greek"]
    url?: string            // For custom fonts, URL to font file
    variable?: string       // CSS variable name, e.g., "--font-heading"
}

/**
 * Generate Google Fonts link href
 */
export function generateGoogleFontUrl(font: FontConfig): string {
    const weights = font.weights?.join(';') || '400;700'
    const subsets = font.subsets?.join(',') || 'latin'

    // Format: https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap
    return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family)}:wght@${weights}&subset=${subsets}&display=swap`
}

/**
 * Generate @font-face CSS for custom fonts
 */
export function generateFontFaceCSS(font: FontConfig): string {
    if (!font.url) return ''

    return `
@font-face {
  font-family: '${font.family}';
  src: url('${font.url}') format('${getFontFormat(font.url)}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`.trim()
}

/**
 * Get font format from URL extension
 */
function getFontFormat(url: string): string {
    if (url.endsWith('.woff2')) return 'woff2'
    if (url.endsWith('.woff')) return 'woff'
    if (url.endsWith('.ttf')) return 'truetype'
    if (url.endsWith('.otf')) return 'opentype'
    return 'woff2' // default
}

/**
 * Generate CSS variables for fonts
 */
export function generateFontVariables(fonts: FontConfig[]): string {
    return fonts
        .filter(f => f.variable)
        .map(f => `  ${f.variable}: '${f.family}', ${f.type === 'google' ? 'sans-serif' : 'sans-serif'};`)
        .join('\n')
}

/**
 * Get all font links for Google Fonts
 */
export function getGoogleFontLinks(fonts: FontConfig[]): string[] {
    return fonts
        .filter(f => f.type === 'google')
        .map(f => generateGoogleFontUrl(f))
}

/**
 * Get all custom font CSS
 */
export function getCustomFontCSS(fonts: FontConfig[]): string {
    return fonts
        .filter(f => f.type === 'custom')
        .map(f => generateFontFaceCSS(f))
        .join('\n\n')
}

// Popular Google Fonts for quick selection
export const POPULAR_GOOGLE_FONTS = [
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Inter',
    'Raleway',
    "Literata",
    'Playfair Display',
    'Merriweather',
    'Nunito',
    'Source Sans Pro',
    'Work Sans',
    'Oswald',
    'Ubuntu',
    'PT Sans',
]

// Common font weights
export const FONT_WEIGHTS = [
    { label: 'Thin', value: 100 },
    { label: 'Extra Light', value: 200 },
    { label: 'Light', value: 300 },
    { label: 'Regular', value: 400 },
    { label: 'Medium', value: 500 },
    { label: 'Semi Bold', value: 600 },
    { label: 'Bold', value: 700 },
    { label: 'Extra Bold', value: 800 },
    { label: 'Black', value: 900 },
]

// Common font subsets
export const FONT_SUBSETS = [
    'latin',
    'latin-ext',
    'greek',
    'greek-ext',
    'cyrillic',
    'cyrillic-ext',
    'vietnamese',
]
