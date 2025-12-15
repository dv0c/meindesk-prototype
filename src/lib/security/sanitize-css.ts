/**
 * CSS Sanitization Utility
 * Removes dangerous CSS patterns that could lead to XSS or other exploits
 */

// Dangerous CSS properties and patterns
const DANGEROUS_PROPERTIES = [
    'expression',
    'behavior',
    'binding',
    '-moz-binding',
];

const DANGEROUS_PATTERNS = [
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /<script/gi,
    /<\/script/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
];

const DANGEROUS_AT_RULES = [
    /@import.*url\s*\(\s*["']?(?!https?:\/\/fonts\.googleapis\.com)/gi, // Block @import except Google Fonts
];

/**
 * Sanitize CSS input to remove potentially dangerous code
 */
export function sanitizeCSS(css: string): string {
    if (!css || typeof css !== 'string') return '';

    let sanitized = css;

    // Remove dangerous properties
    DANGEROUS_PROPERTIES.forEach(prop => {
        const regex = new RegExp(`${prop}\\s*:`, 'gi');
        sanitized = sanitized.replace(regex, `/* blocked: ${prop} */`);
    });

    // Remove dangerous patterns
    DANGEROUS_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '/* blocked */');
    });

    // Remove dangerous @-rules
    DANGEROUS_AT_RULES.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '/* blocked @import */');
    });

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Limit length to prevent DoS
    const MAX_CSS_LENGTH = 50000; // 50KB
    if (sanitized.length > MAX_CSS_LENGTH) {
        sanitized = sanitized.substring(0, MAX_CSS_LENGTH);
    }

    return sanitized;
}

/**
 * Validate if CSS appears safe (for warnings)
 */
export function validateCSS(css: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!css) return { valid: true, errors: [] };

    // Check for dangerous properties
    DANGEROUS_PROPERTIES.forEach(prop => {
        const regex = new RegExp(`${prop}\\s*:`, 'gi');
        if (regex.test(css)) {
            errors.push(`Dangerous property detected: ${prop}`);
        }
    });

    // Check for dangerous patterns
    if (/javascript:/gi.test(css)) errors.push('JavaScript URLs not allowed');
    if (/vbscript:/gi.test(css)) errors.push('VBScript URLs not allowed');
    if (/<script/gi.test(css)) errors.push('Script tags not allowed');
    if (/@import/gi.test(css) && !/@import.*fonts\.googleapis\.com/gi.test(css)) {
        errors.push('@import from external sources not allowed (except Google Fonts)');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
