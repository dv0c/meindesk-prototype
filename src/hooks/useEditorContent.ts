import { useMemo } from "react"

/**
 * Hook to extract HTML content from structured editor data
 * @param content - Can be plain HTML string or structured data {html: string, editorState: object}
 * @returns The HTML content string
 */
export function useEditorContent(content?: string): string {
    return useMemo(() => {
        if (!content) return ""

        try {
            const parsed = JSON.parse(content)
            // If it's structured data with html property, return it
            if (parsed && typeof parsed === 'object' && parsed.html) {
                return parsed.html
            }
        } catch {
            // Not JSON, return as-is
        }

        // Return the content as-is (plain HTML or text)
        return content
    }, [content])
}
