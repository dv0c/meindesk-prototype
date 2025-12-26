"use client"

import { useEditor } from "@craftjs/core"
import { useState, useCallback, useEffect, useRef } from "react"
import { ChevronRight, ChevronDown, Eye, EyeOff, Trash2, GripVertical, Layers, X, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface LayerNodeProps {
    nodeId: string
    depth?: number
}

function LayerNode({ nodeId, depth = 0 }: LayerNodeProps) {
    const { node, actions, selected, hovered, childNodes } = useEditor((state, query) => {
        const node = state.nodes[nodeId]
        if (!node) return { node: null, childNodes: [], selected: false, hovered: false }

        const childIds = node.data.nodes || []
        const linkedNodeIds = node.data.linkedNodes ? Object.values(node.data.linkedNodes) : []
        const allChildIds = [...childIds, ...linkedNodeIds] as string[]

        return {
            node,
            childNodes: allChildIds,
            selected: state.events.selected?.has(nodeId) || false,
            hovered: state.events.hovered?.has(nodeId) || false,
        }
    })

    const [isExpanded, setIsExpanded] = useState(true)
    const [isHidden, setIsHidden] = useState(false)

    const hasChildren = childNodes.length > 0
    const displayName = node?.data.displayName || node?.data.name || "Component"

    const handleSelect = useCallback(() => {
        actions.selectNode(nodeId)
    }, [actions, nodeId])

    const handleToggleVisibility = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        setIsHidden(!isHidden)

        const dom = node?.dom as HTMLElement | null
        if (dom) {
            dom.style.visibility = isHidden ? "visible" : "hidden"
            dom.style.opacity = isHidden ? "1" : "0"
        }
    }, [isHidden, node])

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        actions.delete(nodeId)
    }, [actions, nodeId])

    if (!node) return null

    if (nodeId === "ROOT") {
        return (
            <>
                {childNodes.map((childId) => (
                    <LayerNode key={childId} nodeId={childId} depth={0} />
                ))}
            </>
        )
    }

    return (
        <div className="select-none">
            <div
                className={cn(
                    "group flex items-center gap-1.5 py-1.5 px-2 cursor-pointer text-sm rounded-lg transition-all",
                    selected && "bg-primary/10 border border-primary/20",
                    hovered && !selected && "bg-muted/50",
                    !selected && !hovered && "hover:bg-muted/30",
                    isHidden && "opacity-50"
                )}
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
                onClick={handleSelect}
            >
                <button
                    className={cn(
                        "p-0.5 h-5 w-5 flex items-center justify-center rounded transition-colors",
                        hasChildren ? "hover:bg-accent" : "opacity-0 pointer-events-none"
                    )}
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsExpanded(!isExpanded)
                    }}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                    )}
                </button>

                <GripVertical className="h-3.5 w-3.5 text-muted-foreground opacity-50 group-hover:opacity-100" />

                <span className="flex-1 truncate text-sm">{displayName}</span>

                {hasChildren && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                        {childNodes.length}
                    </span>
                )}

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        className="p-1 hover:bg-muted rounded transition-colors"
                        onClick={handleToggleVisibility}
                        title={isHidden ? "Show" : "Hide"}
                    >
                        {isHidden ? (
                            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                    </button>

                    <button
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                        onClick={handleDelete}
                        title="Delete"
                    >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div>
                    {childNodes.map((childId) => (
                        <LayerNode key={childId} nodeId={childId} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

interface CraftLayersPopupProps {
    isOpen: boolean
    onClose: () => void
}

export function CraftLayersPopup({ isOpen, onClose }: CraftLayersPopupProps) {
    const [position, setPosition] = useState({ x: 0, y: 80 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const panelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            setPosition({ x: window.innerWidth - 340, y: 80 })
        }
    }, [])

    const { nodeIds } = useEditor((state) => {
        const rootNode = state.nodes["ROOT"]
        if (!rootNode) return { nodeIds: [] }

        const childIds = rootNode.data.nodes || []
        const linkedNodeIds = rootNode.data.linkedNodes ? Object.values(rootNode.data.linkedNodes) : []

        return {
            nodeIds: [...childIds, ...linkedNodeIds] as string[],
        }
    })

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest("button")) return
        setIsDragging(true)
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }

    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({
                x: Math.max(0, Math.min(window.innerWidth - 320, e.clientX - dragStart.x)),
                y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragStart.y)),
            })
        }

        const handleMouseUp = () => setIsDragging(false)

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseup", handleMouseUp)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isDragging, dragStart])

    if (!isOpen) return null

    return (
        <div
            ref={panelRef}
            className="fixed z-50 bg-background/95 backdrop-blur-xl border rounded-2xl shadow-2xl w-80 max-h-[500px] flex flex-col overflow-hidden"
            style={{ left: position.x, top: position.y }}
        >
            {/* Header - Draggable */}
            <div
                className="flex items-center justify-between px-4 py-3 border-b cursor-move bg-muted/30"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Layers</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {nodeIds.length}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-destructive/10"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 max-h-[400px]">
                <div className="p-2">
                    {nodeIds.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No components yet.
                            <br />
                            Drag components from the sidebar.
                        </div>
                    ) : (
                        nodeIds.map((nodeId) => (
                            <LayerNode key={nodeId} nodeId={nodeId} depth={0} />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
