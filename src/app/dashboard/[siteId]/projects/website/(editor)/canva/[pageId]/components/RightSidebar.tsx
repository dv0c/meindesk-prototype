"use client"

import { useEditor } from "@craftjs/core"
import { Button } from "@/components/ui/button"
import { ChevronRight, Trash2, Eye, EyeOff, Layers, ChevronDown, Box, Type, Image as ImageIcon, Video, MousePointerClick, LayoutGrid } from "lucide-react"
import { TemplatesPanel } from "./TemplatesPanel"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

// Animation variants
const contentVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
}

export function RightSidebar({
    showTemplates,
    setShowTemplates,
    showLayers,
    setShowLayers
}: {
    showTemplates: boolean,
    setShowTemplates: (show: boolean) => void,
    showLayers: boolean,
    setShowLayers: (show: boolean) => void
}) {

    // Prioritize Templates over Layers
    if (showTemplates) {
        return (
            <div className="w-[320px] bg-background border-l h-full flex flex-col shadow-xl z-20">
                <TemplatesPanel onClose={() => setShowTemplates(false)} />
            </div>
        )
    }

    // Show Layers if active
    if (showLayers) {
        return (
            <div className="w-[320px] bg-background border-l h-full flex flex-col shadow-xl z-20">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">Layers</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full hover:bg-muted"
                        onClick={() => setShowLayers(false)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <LayersView />
            </div>
        )
    }

    return null
}

function LayersView() {
    const { nodeIds } = useEditor((state) => {
        const rootNode = state.nodes["ROOT"]
        if (!rootNode) return { nodeIds: [] }

        const childIds = rootNode.data.nodes || []
        const linkedNodeIds = rootNode.data.linkedNodes ? Object.values(rootNode.data.linkedNodes) : []

        return {
            nodeIds: [...childIds, ...linkedNodeIds] as string[],
        }
    })

    return (
        <ScrollArea className="flex-1">
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
    )
}

interface LayerNodeProps {
    nodeId: string
    depth?: number
}

function LayerNode({ nodeId, depth = 0 }: LayerNodeProps) {
    const { node, actions, selected, hovered, childNodes } = useEditor((state) => {
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

    // Determine Icon based on name
    const getIcon = () => {
        const name = displayName.toLowerCase()
        if (name.includes("container") || name.includes("section") || name.includes("box")) return <Box className="h-3 w-3" />
        if (name.includes("text") || name.includes("heading")) return <Type className="h-3 w-3" />
        if (name.includes("image")) return <ImageIcon className="h-3 w-3" />
        if (name.includes("video")) return <Video className="h-3 w-3" />
        if (name.includes("button")) return <MousePointerClick className="h-3 w-3" />
        if (name.includes("column") || name.includes("grid")) return <LayoutGrid className="h-3 w-3" />
        return <Box className="h-3 w-3" />
    }

    const handleSelect = useCallback(() => {
        actions.selectNode(nodeId)
    }, [actions, nodeId])

    const handleToggleVisibility = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        setIsHidden(!isHidden)

        const dom = node?.dom as HTMLElement | null
        if (dom) {
            dom.style.visibility = isHidden ? "visible" : "hidden"
            dom.style.opacity = isHidden ? "1" : "0" // For better persistence if we supported it
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
        <div className="select-none font-sans">
            <div
                className={cn(
                    "group flex items-center h-8 cursor-pointer text-xs border-b border-white/5 transition-colors relative hover:bg-white/5",
                    selected ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    isHidden && "opacity-50"
                )}
                onClick={handleSelect}
            >
                {/* Visibility Toggle (Photoshop style: Left Column) */}
                <div
                    className="w-8 h-full flex items-center justify-center border-r border-white/5 hover:bg-black/10 transition-colors"
                    onClick={handleToggleVisibility}
                >
                    {isHidden ? (
                        <EyeOff className="h-3 w-3 opacity-50" />
                    ) : (
                        <Eye className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                    )}
                </div>

                {/* Indentation & Expand */}
                <div
                    className="flex-1 flex items-center h-full overflow-hidden"
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                >
                    {/* Expand Arrow or Spacer */}
                    <div className="w-4 flex items-center justify-center mr-1">
                        {hasChildren && (
                            <button
                                className="p-0.5 hover:bg-black/10 rounded"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsExpanded(!isExpanded)
                                }}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="h-2.5 w-2.5" />
                                ) : (
                                    <ChevronRight className="h-2.5 w-2.5" />
                                )}
                            </button>
                        )}
                    </div>

                    {/* Type Icon */}
                    <div className="mr-2 opacity-70">
                        {getIcon()}
                    </div>

                    {/* Name */}
                    <span className="truncate font-medium">{displayName}</span>
                </div>

                {/* Right Actions (Delete, etc) - Only show on hover or selected */}
                {(hovered || selected) && (
                    <div className="flex items-center px-2">
                        <button
                            className="p-1 hover:bg-black/20 rounded text-foreground/80 hover:text-destructive transition-colors"
                            onClick={handleDelete}
                            title="Delete Layer"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>
                )}
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
