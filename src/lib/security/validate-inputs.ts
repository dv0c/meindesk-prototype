/**
 * Input Validation Utilities
 * Validate user inputs to ensure they're safe and in the correct format
 */

/**
 * Validate hex color format
 */
export function validateColor(color: string): { valid: boolean; error?: string } {
    if (!color) return { valid: true }; // Empty is ok

    // Allow hex colors (#RGB or #RRGGBB)
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    // Allow named colors (common CSS colors)
    const namedColors = [
        'transparent', 'black', 'white', 'red', 'green', 'blue', 'yellow',
        'orange', 'purple', 'pink', 'gray', 'brown', 'cyan', 'magenta'
    ];

    if (hexPattern.test(color)) return { valid: true };
    if (namedColors.includes(color.toLowerCase())) return { valid: true };

    return {
        valid: false,
        error: 'Color must be in hex format (#RRGGBB) or a named color'
    };
}

/**
 * Sanitize color input - return safe color or default
 */
export function sanitizeColor(color: string, defaultColor: string = '#000000'): string {
    const { valid } = validateColor(color);
    return valid ? color : defaultColor;
}

/**
 * Validate font family name
 */
export function validateFontFamily(fontFamily: string): { valid: boolean; error?: string } {
    if (!fontFamily) return { valid: true }; // Empty is ok

    // Only allow letters, numbers, spaces, hyphens, and commas
    const safePattern = /^[a-zA-Z0-9\s,'-]+$/;

    // Check length
    if (fontFamily.length > 100) {
        return { valid: false, error: 'Font family name too long (max 100 characters)' };
    }

    // Check for dangerous patterns
    if (!safePattern.test(fontFamily)) {
        return { valid: false, error: 'Font family contains invalid characters' };
    }

    // Block script-like patterns
    if (/script|javascript|vbscript|<|>|&lt;|&gt;/gi.test(fontFamily)) {
        return { valid: false, error: 'Font family contains forbidden keywords' };
    }

    return { valid: true };
}

/**
 * Sanitize font family - remove dangerous characters
 */
export function sanitizeFontFamily(fontFamily: string): string {
    if (!fontFamily) return '';

    // Remove anything that's not alphanumeric, space, comma, hyphen, or apostrophe
    return fontFamily
        .replace(/[^a-zA-Z0-9\s,'-]/g, '')
        .substring(0, 100);
}

/**
 * Validate text input (title, description)
 */
export function validateText(text: string, maxLength: number = 1000): { valid: boolean; error?: string } {
    if (!text) return { valid: true };

    if (text.length > maxLength) {
        return { valid: false, error: `Text too long (max ${maxLength} characters)` };
    }

    // Block script tags
    if (/<script/gi.test(text)) {
        return { valid: false, error: 'Script tags not allowed' };
    }

    return { valid: true };
}

/**
 * Sanitize text - remove script tags and limit length
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
    if (!text) return '';

    return text
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<script[^>]*>/gi, '')
        .substring(0, maxLength);
}

/**
 * Validate URL (for future use with image uploads)
 */
export function validateURL(url: string): { valid: boolean; error?: string } {
    if (!url) return { valid: true };

    try {
        const parsed = new URL(url);

        // Only allow HTTPS (or HTTP for localhost development)
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            return { valid: false, error: 'Only HTTPS URLs are allowed' };
        }

        // Block javascript: and data: URLs
        if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
            return { valid: false, error: 'JavaScript and data URLs not allowed' };
        }

        return { valid: true };
    } catch {
        return { valid: false, error: 'Invalid URL format' };
    }
}
