"use client"

import React from "react"
import type { LayoutNode } from "@/lib/types"
import { useSnippets } from "./snippets-context"
import { Puzzle, AlertTriangle, Link2 } from "lucide-react"
import { DraggableWrapper } from "./draggable-wrapper"

interface SnippetInstanceProps {
    node: LayoutNode
    isEditor?: boolean
    onSelect?: (id: string) => void
    isSelected?: boolean
    onContextMenu?: (e: React.MouseEvent, id: string) => void
    renderContent: (nodes: LayoutNode[]) => React.ReactNode
}

export function SnippetInstance({
    node,
    isEditor = false,
    onSelect,
    isSelected = false,
    onContextMenu,
    renderContent,
}: SnippetInstanceProps) {
    const { getSnippet, loading } = useSnippets()

    const snippetId = node.snippetId
    const snippet = snippetId ? getSnippet(snippetId) : undefined

    // Loading state
    if (loading) {
        return (
            <div className="p-4 border border-dashed rounded-lg animate-pulse bg-muted/30">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Puzzle className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading snippet...</span>
                </div>
            </div>
        )
    }

    // Snippet not found
    if (!snippet) {
        if (isEditor) {
            return (
                <DraggableWrapper
                    id={node.id}
                    isSelected={isSelected}
                    onSelect={onSelect}
                    onContextMenu={onContextMenu}
                    isContainer={false}
                    data={{ type: "component", isContainer: false, component: node }}
                >
                    <div className="p-6 border rounded-lg flex flex-col items-center justify-center gap-3 text-center min-h-[100px] bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                        <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-semibold text-amber-800 dark:text-amber-200">Snippet Not Found</h4>
                            <p className="text-sm text-amber-600 dark:text-amber-400">
                                The linked snippet was deleted or doesn&apos;t exist.
                            </p>
                        </div>
                    </div>
                </DraggableWrapper>
            )
        }
        return null
    }

    // Handle right-click on snippet content - forward to parent with SnippetRef's node ID
    const handleContentContextMenu = (e: React.MouseEvent) => {
        if (isEditor && onContextMenu) {
            e.preventDefault()
            e.stopPropagation()
            onContextMenu(e, node.id) // Use the SnippetRef's node ID, not child's
        }
    }

    // Render the actual snippet content
    const content = (
        <div
            className="relative group"
            onContextMenu={handleContentContextMenu}
        >
            {/* Linked snippet indicator in editor mode */}
            {isEditor && (
                <div className="absolute -top-2 -left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-medium rounded-full shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">
                    <Link2 className="h-3 w-3" />
                    <span>{snippet.name}</span>
                </div>
            )}

            {/* Render snippet content */}
            {renderContent(snippet.content)}
        </div>
    )

    if (isEditor) {
        return (
            <DraggableWrapper
                id={node.id}
                isSelected={isSelected}
                onSelect={onSelect}
                onContextMenu={onContextMenu}
                isContainer={false}
                data={{ type: "snippet-ref", isContainer: false, component: node, snippetId }}
            >
                {content}
            </DraggableWrapper>
        )
    }

    return <div data-node-id={node.id} data-snippet-id={snippetId}>{content}</div>
}
