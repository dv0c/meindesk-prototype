import type { LayoutNode } from "@/lib/types"
import { useSnippets } from "./snippets-context"

// Helper component to show proper name for layers
function LayerNodeName({ node }: { node: LayoutNode }) {
    const { getSnippet } = useSnippets()

    if (node.type === "SnippetRef" && node.snippetId) {
        const snippet = getSnippet(node.snippetId)
        if (snippet) {
            return (
                <span className="flex-1 truncate font-medium text-sm select-none flex items-center gap-1">
                    <span className="text-purple-600 dark:text-purple-400">🔗</span>
                    {snippet.name}
                </span>
            )
        }
        return (
            <span className="flex-1 truncate font-medium text-sm select-none text-orange-500">
                📦 Missing Snippet
            </span>
        )
    }

    return <span className="flex-1 truncate font-medium text-sm select-none">{node.type}</span>
}
