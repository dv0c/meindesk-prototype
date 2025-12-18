"use client"

import type React from "react"
import { use, useEffect, useState } from "react"
import { useBuilderStore } from "@/lib/store"
import { Sidebar } from "../../../(editor)/canva/[pageId]/components/editor/sidebar"
import { Canvas } from "../../../(editor)/canva/[pageId]/components/editor/canvas"
import { ContextMenu } from "../../../(editor)/canva/[pageId]/components/editor/context-menu"
import type { ComponentDefinition, LayoutNode } from "@/lib/types"
import { createNode, generateNodeId } from "@/lib/component-registry"
import { Button } from "@/components/ui/button"
import { Save, ArrowLeft, Puzzle } from "lucide-react"
import {
    DndContext,
    DragOverlay,
    type DragEndEvent,
    useSensor,
    useSensors,
    PointerSensor,
} from "@dnd-kit/core"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { SnippetsProvider } from "../../../(editor)/canva/[pageId]/components/editor/snippets-context"

// Helper: find node's parent recursively
function findNodeParent(id: string, nodes: LayoutNode[]): { parent: LayoutNode | null; index: number } | null {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (node.children) {
            const childIndex = node.children.findIndex((c) => c.id === id)
            if (childIndex !== -1) return { parent: node, index: childIndex }

            const result = findNodeParent(id, node.children)
            if (result) return result
        }
    }

    const rootIndex = nodes.findIndex((n) => n.id === id)
    if (rootIndex !== -1) return { parent: null, index: rootIndex }

    return null
}

export default function SnippetEditorPage({ params }: { params: { siteId: string; snippetId: string } }) {
    const { siteId: tenantId, snippetId } = use(params as any) as any
    const router = useRouter()
    const [snippetName, setSnippetName] = useState<string>("Loading...")
    const [snippetData, setSnippetData] = useState<any>(null)
    const [isSaving, setSaving] = useState(false)
    const [activeDragItem, setActiveDragItem] = useState<ComponentDefinition | null>(null)
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [validComponentNames, setValidComponentNames] = useState<string[]>([])

    const {
        nodes,
        selectedNodeId,
        addNode,
        updateNode,
        removeNode,
        selectNode,
        clearCanvas,
        findNode,
        moveNode,
        websiteSettings,
    } = useBuilderStore()

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    )

    useEffect(() => {
        async function init() {
            await loadSnippet()
            await loadSettings()
            loadComponents()
        }
        init()
    }, [])

    async function loadComponents() {
        try {
            const { getAvailableComponents } = await import("@/lib/component-registry")
            const components = await getAvailableComponents(tenantId as string)
            setValidComponentNames(components.map(c => c.name))
        } catch (error) {
            console.error("Failed to load components:", error)
        }
    }

    async function loadSnippet() {
        setLoading(true)
        try {
            const response = await fetch(`/api/v1/${tenantId}/snippets/${snippetId}`)
            if (response.ok) {
                const snippet = await response.json()
                setSnippetData(snippet)
                setSnippetName(snippet.name)

                // Load snippet content into canvas
                const content = snippet.content as LayoutNode[]
                useBuilderStore.setState({ nodes: content || [] })
            } else {
                toast.error("Failed to load snippet")
                router.back()
            }
        } catch (error) {
            console.error("Failed to load snippet:", error)
            toast.error("Failed to load snippet")
            router.back()
        } finally {
            setLoading(false)
        }
    }

    async function loadSettings() {
        try {
            const response = await fetch(`/api/v1/${tenantId}/settings`)
            if (response.ok) {
                const settings = await response.json()
                useBuilderStore.setState({ websiteSettings: settings })
            }
        } catch (error) {
            console.error("Failed to load settings:", error)
        }
    }

    async function handleSave() {
        setSaving(true)
        try {
            const response = await fetch(`/api/v1/${tenantId}/snippets/${snippetId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: snippetName,
                    description: snippetData?.description,
                    category: snippetData?.category,
                    content: nodes,
                }),
            })

            if (response.ok) {
                toast.success("Snippet saved successfully")
                // Trigger refresh on all pages using this snippet
                window.dispatchEvent(new CustomEvent("snippets-refresh"))
            } else {
                throw new Error("Failed to save")
            }
        } catch (error) {
            console.error("Failed to save snippet:", error)
            toast.error("Failed to save snippet")
        } finally {
            setSaving(false)
        }
    }

    // Keyboard shortcuts
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // Ctrl+S or Cmd+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                handleSave()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [snippetName, snippetData, nodes])

    function handleAddComponent(component: ComponentDefinition) {
        const node = createNode(component.name, component)
        addNode(node)
        toast(`Component Added`, {
            description: `${component.name} has been added to the canvas`,
        })
    }

    function handleUpdateNode(updates: Partial<LayoutNode>) {
        if (selectedNodeId) updateNode(selectedNodeId, updates)
    }

    function handleDeleteNode() {
        if (selectedNodeId) {
            removeNode(selectedNodeId)
            selectNode(null)
            toast("Component Deleted", { description: "Component has been removed from the canvas" })
        }
    }

    function handleDragStart(event: any) {
        const { active } = event
        if (active.data.current?.type === "palette-item") setActiveDragItem(active.data.current.component)
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveDragItem(null)
        if (!over) return

        // Adding new component
        if (active.data.current?.type === "palette-item") {
            const component = active.data.current.component as ComponentDefinition
            const newNode = createNode(component.name, component)
            let parentId: string | null = null
            let index = 0

            if (over.id === "canvas-root") {
                parentId = null
                index = nodes.length
            } else {
                const overId = over.id as string
                const overNode = findNode(overId, nodes)
                const isContainer = over.data.current?.isContainer || (overNode && overNode.children !== undefined)

                if (isContainer) {
                    parentId = overId
                    index = overNode?.children?.length || 0
                } else {
                    const parentInfo = findNodeParent(overId, nodes)
                    if (parentInfo) {
                        parentId = parentInfo.parent ? parentInfo.parent.id : null
                        index = parentInfo.index + 1
                    } else {
                        parentId = null
                        index = nodes.length
                    }
                }
            }

            addNode(newNode, parentId as string)
            toast("Component Added", { description: `${component.name} has been added to the canvas` })
        }

        // Moving existing component
        else if (active.id !== over.id) {
            const activeId = active.id as string
            const overId = over.id as string
            if (activeId === overId) return

            let newParentId: string | null = null
            let newIndex = 0

            if (overId === "canvas-root") {
                newParentId = null
                newIndex = nodes.length
            } else {
                const overNode = findNode(overId, nodes)
                const isContainer = over.data.current?.isContainer || (overNode && overNode.children !== undefined)
                const isEmptyContainer = isContainer && overNode?.children?.length === 0

                if (isEmptyContainer) {
                    newParentId = overId
                    newIndex = 0
                } else {
                    const parentInfo = findNodeParent(overId, nodes)
                    if (parentInfo) {
                        newParentId = parentInfo.parent ? parentInfo.parent.id : null
                        newIndex = parentInfo.index
                    }
                }
            }

            moveNode(activeId, newParentId, newIndex)
        }
    }

    function handleContextMenu(e: React.MouseEvent, nodeId: string) {
        e.preventDefault()
        setContextMenu({ x: e.clientX, y: e.clientY, nodeId })
        selectNode(nodeId)
    }

    function handleDuplicateNode() {
        if (!contextMenu) return
        const node = findNode(contextMenu.nodeId, nodes)
        if (!node) return

        function cloneNode(original: LayoutNode): LayoutNode {
            return {
                ...original,
                id: generateNodeId(),
                children: original.children?.map(cloneNode),
            }
        }

        const clonedNode = cloneNode(node)
        const parentInfo = findNodeParent(contextMenu.nodeId, nodes)
        if (parentInfo && parentInfo.parent) {
            const parent = parentInfo.parent
            const newChildren = [...(parent.children || [])]
            newChildren.splice(parentInfo.index + 1, 0, clonedNode)
            updateNode(parent.id, { children: newChildren })
        } else {
            const rootIndex = nodes.findIndex((n) => n.id === contextMenu.nodeId)
            const newNodes = [...nodes]
            newNodes.splice(rootIndex + 1, 0, clonedNode)
            useBuilderStore.setState({ nodes: newNodes })
        }

        toast("Component Duplicated", { description: "Component has been duplicated" })
    }

    function handleMoveNodeUp() {
        if (!contextMenu) return
        const parentInfo = findNodeParent(contextMenu.nodeId, nodes)
        if (!parentInfo || parentInfo.index === 0) return

        if (parentInfo.parent) {
            const newChildren = [...(parentInfo.parent.children || [])]
            const [movedNode] = newChildren.splice(parentInfo.index, 1)
            newChildren.splice(parentInfo.index - 1, 0, movedNode)
            updateNode(parentInfo.parent.id, { children: newChildren })
        } else {
            const newNodes = [...nodes]
            const [movedNode] = newNodes.splice(parentInfo.index, 1)
            newNodes.splice(parentInfo.index - 1, 0, movedNode)
            useBuilderStore.setState({ nodes: newNodes })
        }
    }

    function handleMoveNodeDown() {
        if (!contextMenu) return
        const parentInfo = findNodeParent(contextMenu.nodeId, nodes)
        if (!parentInfo) return
        const siblings = parentInfo.parent ? parentInfo.parent.children || [] : nodes
        if (parentInfo.index >= siblings.length - 1) return

        if (parentInfo.parent) {
            const newChildren = [...siblings]
            const [movedNode] = newChildren.splice(parentInfo.index, 1)
            newChildren.splice(parentInfo.index + 1, 0, movedNode)
            updateNode(parentInfo.parent.id, { children: newChildren })
        } else {
            const newNodes = [...nodes]
            const [movedNode] = newNodes.splice(parentInfo.index, 1)
            newNodes.splice(parentInfo.index + 1, 0, movedNode)
            useBuilderStore.setState({ nodes: newNodes })
        }
    }

    // Loading Skeleton
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-muted/10">
                <div className="w-full max-w-[1200px] p-6 animate-pulse">
                    <div className="h-8 w-1/4 bg-muted rounded mb-6"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-3">
                            <div className="h-64 bg-muted rounded"></div>
                            <div className="h-40 bg-muted rounded"></div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-12 bg-muted rounded"></div>
                            <div className="h-12 bg-muted rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Main Editor
    return (
        <SnippetsProvider siteId={tenantId}>
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="h-screen flex flex-col bg-muted/10 overflow-hidden">
                    {/* Top Bar - Snippet Editor Theme */}
                    <header className="h-16 border-b backdrop-blur-xl bg-gradient-to-r from-purple-500/5 via-background/80 to-background/80 shadow-sm flex items-center justify-between px-6 z-30 shrink-0">
                        {/* Left: Back button and snippet name */}
                        <div className="flex items-center gap-4">
                            <Button onClick={() => router.back()} variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="h-8 w-px bg-border/50" />
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                    <Puzzle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Snippet</span>
                                </div>
                                <div>
                                    <Input
                                        size={snippetName.length || 8}
                                        maxLength={30}
                                        onChange={(e) => setSnippetName(e.target.value)}
                                        value={snippetName || ""}
                                        placeholder="Untitled Snippet"
                                        className="h-9 bg-transparent border-none font-semibold text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                                    />
                                    <p className="text-xs text-muted-foreground">Press Ctrl+S to save</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={clearCanvas}>
                                Clear
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isSaving}>
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? "Saving..." : "Save Snippet"}
                            </Button>
                        </div>
                    </header>

                    <div className="flex-1 flex h-full overflow-hidden">
                        <Sidebar
                            onAddComponent={handleAddComponent}
                            onUpdateNode={handleUpdateNode}
                            onDeleteNode={handleDeleteNode}
                            onInsertSnippet={() => { }}
                            siteId={tenantId}
                            hideSnippets={true}
                            hideSettings={true}
                        />
                        <div className="flex-1 h-full overflow-hidden flex flex-col relative">
                            <div className="overflow-auto h-full bg-zinc-50 dark:bg-zinc-900">
                                {/* Inject Global Settings */}
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                    .canvas-preview {
                                        ${websiteSettings.theme.backgroundColor ? `background-color: ${websiteSettings.theme.backgroundColor};` : ''}
                                        ${websiteSettings.theme.textColor ? `color: ${websiteSettings.theme.textColor};` : ''}
                                        ${websiteSettings.theme.fontFamily ? `font-family: '${websiteSettings.theme.fontFamily}', sans-serif;` : ''}
                                    }
                                    .canvas-preview * {
                                        ${websiteSettings.theme.fontFamily ? `font-family: '${websiteSettings.theme.fontFamily}', sans-serif;` : ''}
                                    }
                                    ${websiteSettings.globalCss || ''}
                                `
                                }} />
                                <div
                                    onClickCapture={(e) => {
                                        const target = e.target as HTMLElement
                                        if (target.closest("a")) {
                                            e.preventDefault()
                                        }
                                    }}
                                    className={`canvas-preview shadow-lg h-fit transition-all duration-300 ${nodes.length ? "min-h-full h-fit" : "h-full"} w-full`}
                                >
                                    <Canvas
                                        nodes={nodes}
                                        selectedNodeId={selectedNodeId}
                                        onSelectNode={selectNode}
                                        onContextMenu={handleContextMenu}
                                        onDuplicate={handleDuplicateNode}
                                        onDelete={(id) => {
                                            removeNode(id)
                                            selectNode(null)
                                        }}
                                        validComponentNames={validComponentNames}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {contextMenu && (
                        <ContextMenu
                            x={contextMenu.x}
                            y={contextMenu.y}
                            onClose={() => setContextMenu(null)}
                            onEdit={() => selectNode(contextMenu.nodeId)}
                            onDuplicate={handleDuplicateNode}
                            onDelete={() => {
                                removeNode(contextMenu.nodeId)
                                selectNode(null)
                            }}
                            onMoveUp={handleMoveNodeUp}
                            onMoveDown={handleMoveNodeDown}
                            onSaveAsSnippet={() => { }}
                            isSnippetRef={false}
                            onUnlinkSnippet={() => { }}
                            onEditSnippet={() => { }}
                        />
                    )}

                    <DragOverlay dropAnimation={null}>
                        {activeDragItem ? (
                            <div className="flex flex-col items-center justify-center p-3 h-24 w-36 border-2 border-primary rounded-md bg-card shadow-xl cursor-grabbing">
                                <span className="text-xs text-center font-medium leading-tight">{activeDragItem.name}</span>
                            </div>
                        ) : null}
                    </DragOverlay>
                </div>
            </DndContext>
        </SnippetsProvider>
    )
}
