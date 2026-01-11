import { Button } from "@/components/ui/button"
import { useEditor } from "@craftjs/core"
import { BookTemplate, Loader2, Plus, Sparkles, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SavedComponent {
    id: string
    name: string
    description?: string
    content: any // NodeTree
    createdAt: string
}

export function SavedComponentsPanel({ siteId }: { siteId?: string }) {
    const { actions, query, resolvers } = useEditor((state) => ({
        resolvers: state.options.resolver
    }))
    const [components, setComponents] = useState<SavedComponent[]>([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (siteId) {
            fetchComponents()
        }
    }, [siteId])

    const fetchComponents = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/team/${siteId}/components`)
            if (res.ok) {
                const data = await res.json()
                setComponents(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddComponent = (component: SavedComponent) => {
        try {
            // Get the selected node or root
            const selectedId = query.getEvent("selected").first()
            const parentId = selectedId || "ROOT"

            console.log("Adding component:", component.name, "to parent:", parentId)

            // Hydrate the tree (convert strings back to component functions)
            const hydratedContent = hydrateNodeTree(component.content, resolvers)
            console.log("Hydrated Content:", hydratedContent)

            // Add the saved tree
            actions.addNodeTree(hydratedContent, parentId)

            toast.success("Component added to canvas")
        } catch (error: any) {
            console.error("Failed to add component:", error)
            toast.error(`Failed to add: ${error.message}`)
        }
    }

    // Helper to hydrate NodeTree (convert strings back to component functions)
    const hydrateNodeTree = (tree: any, resolvers: any) => {
        if (!resolvers) return tree

        const newNodes: any = {}
        for (const [id, node] of Object.entries(tree.nodes)) {
            // Deep clone to avoid mutating original
            const newNode = JSON.parse(JSON.stringify(node))

            // If type is a string, try to resolve it
            if (typeof newNode.data.type === 'string') {
                const componentName = newNode.data.type
                const ResolvedComponent = resolvers[componentName]

                if (ResolvedComponent) {
                    newNode.data.type = ResolvedComponent
                    newNode.data.name = componentName
                }
            }
            newNodes[id] = newNode
        }
        return { ...tree, nodes: newNodes }
    }

    if (!siteId) {
        return <div className="p-4 text-xs text-muted-foreground text-center">Save site to access library</div>
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                    <BookTemplate className="w-3 h-3" />
                    Saved Library
                </h3>
                <p className="text-[10px] text-muted-foreground">
                    Your AI generated components
                </p>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : components.length === 0 ? (
                        <div className="text-center p-8 border border-dashed rounded-md bg-muted/20">
                            <Sparkles className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-xs text-muted-foreground font-medium">No saved components</p>
                            <p className="text-[10px] text-muted-foreground/70 mt-1">
                                Use "AI Build" and check "Save to Library"
                            </p>
                        </div>
                    ) : (
                        components.map((comp) => (
                            <div
                                key={comp.id}
                                className="group relative border rounded-lg bg-card p-3 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer"
                                onClick={() => handleAddComponent(comp)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <h4 className="font-semibold text-xs truncate max-w-[180px]">{comp.name}</h4>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-4 w-4 opacity-0 group-hover:opacity-100">
                                        <Plus className="w-3 h-3" />
                                    </Button>
                                </div>

                                <div className="text-[10px] text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded">
                                    {comp.description}
                                </div>
                                <div className="mt-2 text-[9px] text-muted-foreground/50 text-right">
                                    {new Date(comp.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
