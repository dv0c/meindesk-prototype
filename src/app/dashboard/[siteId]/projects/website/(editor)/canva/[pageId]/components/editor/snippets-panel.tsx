"use client"

import { useEffect, useState, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Loader2, Search, Trash2, MoreVertical, FolderOpen,
    Puzzle, Edit2
} from "lucide-react"
import { useDraggable } from "@dnd-kit/core"
import type { LayoutNode } from "@/lib/types"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Snippet {
    id: string
    name: string
    description?: string
    category: string
    thumbnail?: string
    content: LayoutNode[]
    createdAt: string
    updatedAt: string
}

interface SnippetsPanelProps {
    siteId: string
    onInsertSnippet: (snippetId: string, snippetName: string) => void
}

// Individual snippet card component
function DraggableSnippetItem({
    snippet,
    onInsert,
    onDelete,
    onEdit
}: {
    snippet: Snippet
    onInsert: () => void
    onDelete: () => void
    onEdit: () => void
}) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `snippet-${snippet.id}`,
        data: {
            type: "snippet-item",
            snippet,
        },
    })

    // Count components in snippet
    const componentCount = countNodes(snippet.content)

    return (
        <div
            ref={setNodeRef}
            className="touch-none"
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <div
                {...listeners}
                {...attributes}
                className="group relative flex flex-col p-3 border rounded-lg hover:border-primary hover:bg-accent/30 cursor-grab active:cursor-grabbing transition-all bg-card"
                onClick={onInsert}
            >
                {/* Thumbnail or icon placeholder */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Puzzle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{snippet.name}</h4>
                        <p className="text-[10px] text-muted-foreground">
                            {componentCount} component{componentCount !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Actions dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreVertical className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
                                <Edit2 className="w-3 h-3 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); onDelete() }}
                                className="text-destructive"
                            >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {snippet.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {snippet.description}
                    </p>
                )}

                {/* Category badge */}
                <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground capitalize">
                        {snippet.category}
                    </span>
                </div>
            </div>
        </div>
    )
}

// Helper function to count nodes recursively
function countNodes(nodes: LayoutNode[]): number {
    let count = 0
    for (const node of nodes) {
        count++
        if (node.children) {
            count += countNodes(node.children)
        }
    }
    return count
}

// Helper to generate unique IDs for cloned nodes
function generateUniqueId(): string {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Deep clone nodes with new unique IDs
export function cloneNodesWithNewIds(nodes: LayoutNode[]): LayoutNode[] {
    return nodes.map(node => ({
        ...node,
        id: generateUniqueId(),
        children: node.children ? cloneNodesWithNewIds(node.children) : undefined,
    }))
}

export function SnippetsPanel({ siteId, onInsertSnippet }: SnippetsPanelProps) {
    const [snippets, setSnippets] = useState<Snippet[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [deleteTarget, setDeleteTarget] = useState<Snippet | null>(null)
    const [deleting, setDeleting] = useState(false)

    const loadSnippets = useCallback(async () => {
        if (!siteId) return

        setLoading(true)
        try {
            const response = await fetch(`/api/v1/${siteId}/snippets`)
            if (response.ok) {
                const data = await response.json()
                setSnippets(data)
            }
        } catch (error) {
            console.error("Failed to load snippets:", error)
        } finally {
            setLoading(false)
        }
    }, [siteId])

    useEffect(() => {
        loadSnippets()
    }, [loadSnippets])

    const handleInsertSnippet = (snippet: Snippet) => {
        // Pass snippet ID and name for linked insertion
        onInsertSnippet(snippet.id, snippet.name)
    }

    const handleDeleteSnippet = async (snippet: Snippet) => {
        setDeleting(true)
        try {
            const response = await fetch(`/api/v1/${siteId}/snippets/${snippet.id}`, {
                method: "DELETE",
            })
            if (response.ok) {
                setSnippets(prev => prev.filter(s => s.id !== snippet.id))
                toast.success(`Snippet "${snippet.name}" deleted`)
            } else {
                toast.error("Failed to delete snippet")
            }
        } catch (error) {
            console.error("Failed to delete snippet:", error)
            toast.error("Failed to delete snippet")
        } finally {
            setDeleting(false)
            setDeleteTarget(null)
        }
    }

    const handleEditSnippet = (snippet: Snippet) => {
        // Open snippet in full editor
        window.open(`/dashboard/${siteId}/projects/website/snippets/${snippet.id}/edit`, '_blank')
    }

    const filteredSnippets = snippets.filter(
        (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    )

    const categories = Array.from(new Set(filteredSnippets.map((s) => s.category)))

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Search */}
            <div className="p-4 border-b space-y-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search snippets..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-6">
                    {snippets.length === 0 ? (
                        <div className="text-center py-12">
                            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">
                                No snippets yet
                            </h3>
                            <p className="text-xs text-muted-foreground/70">
                                Right-click any component and select
                                <br />
                                &quot;Save as Snippet&quot; to create one
                            </p>
                        </div>
                    ) : filteredSnippets.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-8">
                            No snippets found
                        </div>
                    ) : (
                        categories.map((category) => (
                            <div key={category} className="space-y-3">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                                    {category}
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {filteredSnippets
                                        .filter((s) => s.category === category)
                                        .map((snippet) => (
                                            <DraggableSnippetItem
                                                key={snippet.id}
                                                snippet={snippet}
                                                onInsert={() => handleInsertSnippet(snippet)}
                                                onDelete={() => setDeleteTarget(snippet)}
                                                onEdit={() => handleEditSnippet(snippet)}
                                            />
                                        ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Delete confirmation dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Snippet</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteTarget && handleDeleteSnippet(deleteTarget)}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
