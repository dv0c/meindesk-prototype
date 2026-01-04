
/**
 * Resolves a text string containing templates like {title} or {collection.title}
 * against a data object.
 * 
 * @param text The template string (e.g. "By {author}")
 * @param data The data object (e.g. { author: "Taso", title: "My Book" })
 * @returns The resolved string (e.g. "By Taso")
 */
export function resolveCollectionTemplate(text: string, data?: Record<string, any> | null): string {
    if (!text || !data) return text || ""

    // Regex to find {key} or {collection.key} patterns
    return text.replace(/\{([\w\.]+)\}/g, (match, key) => {
        const cleanKey = key.trim()

        // Handle {collection.key} by stripping 'collection.'
        const fieldName = cleanKey.startsWith('collection.')
            ? cleanKey.replace('collection.', '')
            : cleanKey

        // Return value from data or keep original match if not found (or show empty?)
        // Usually keeping match helps debugging, but for end users empty might be cleaner.
        // Let's return the value if it exists, otherwise empty string to avoid ugly broken templates
        // unless it allows partial matches. 
        // Let's try to find it.
        const value = data[fieldName]

        if (value !== undefined && value !== null) {
            return String(value)
        }

        // If not found in data, check if it was 'collection.' prefix, maybe they meant literal? 
        // But assuming user intent, if data is missing, return empty or fallback?
        // Let's return match if distinct from intended usage?
        // No, standard binding behavior: undefined -> empty string.
        return ""
    })
}
