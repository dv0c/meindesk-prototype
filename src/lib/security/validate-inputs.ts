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

        // Block javascript: and data: URLs first
        if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
            return { valid: false, error: 'JavaScript and data URLs not allowed' };
        }

        // Only allow HTTPS (or HTTP for localhost development)
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
            return { valid: false, error: 'Only HTTPS URLs are allowed' };
        }


        return { valid: true };
    } catch {
        return { valid: false, error: 'Invalid URL format' };
    }
}

/**
 * Validate SEO keywords (comma-separated)
 */
export function validateKeywords(keywords: string): { valid: boolean; error?: string } {
    if (!keywords) return { valid: true };

    // Check length
    if (keywords.length > 500) {
        return { valid: false, error: 'Keywords too long (max 500 characters)' };
    }

    // Block script-like patterns
    if (/<script|javascript|vbscript/gi.test(keywords)) {
        return { valid: false, error: 'Keywords contain forbidden patterns' };
    }

    return { valid: true };
}

/**
 * Sanitize keywords
 */
export function sanitizeKeywords(keywords: string): string {
    if (!keywords) return '';
    return keywords
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/[<>]/g, '')
        .substring(0, 500);
}

/**
 * Validate robots meta tag
 */
export function validateRobots(robots: string): { valid: boolean; error?: string } {
    if (!robots) return { valid: true };

    const validValues = ['index', 'noindex', 'follow', 'nofollow', 'none', 'noarchive', 'nosnippet', 'noimageindex'];
    const parts = robots.toLowerCase().split(',').map(s => s.trim());

    for (const part of parts) {
        if (!validValues.includes(part)) {
            return { valid: false, error: `Invalid robots value: ${part}` };
        }
    }

    return { valid: true };
}

/**
 * Validate Twitter handle (should start with @)
 */
export function validateTwitterHandle(handle: string): { valid: boolean; error?: string } {
    if (!handle) return { valid: true };

    // Twitter handles should be @username format, 1-15 characters after @
    const twitterPattern = /^@[A-Za-z0-9_]{1,15}$/;

    if (!twitterPattern.test(handle)) {
        return { valid: false, error: 'Twitter handle must be in format @username (1-15 characters)' };
    }

    return { valid: true };
}

/**
 * Sanitize Twitter handle
 */
export function sanitizeTwitterHandle(handle: string): string {
    if (!handle) return '';

    // Ensure it starts with @
    let sanitized = handle.trim();
    if (!sanitized.startsWith('@')) {
        sanitized = '@' + sanitized;
    }

    // Remove invalid characters and limit length
    return sanitized.replace(/[^@A-Za-z0-9_]/g, '').substring(0, 16); // @ + 15 chars
}

/**
 * Validate theme mode
 */
export function validateThemeMode(mode: string): { valid: boolean; error?: string } {
    if (!mode) return { valid: true };

    const validModes = ['light', 'dark', 'auto'];

    if (!validModes.includes(mode)) {
        return { valid: false, error: 'Theme mode must be light, dark, or auto' };
    }

    return { valid: true };
}

/**
 * Validate Open Graph type
 */
export function validateOgType(type: string): { valid: boolean; error?: string } {
    if (!type) return { valid: true };

    const validTypes = [
        'website', 'article', 'book', 'profile', 'music.song', 'music.album',
        'music.playlist', 'music.radio_station', 'video.movie', 'video.episode',
        'video.tv_show', 'video.other'
    ];

    if (!validTypes.includes(type)) {
        return { valid: false, error: 'Invalid Open Graph type' };
    }

    return { valid: true };
}

