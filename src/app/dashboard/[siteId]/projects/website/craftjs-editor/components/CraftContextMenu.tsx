"use client"

import { useEffect, useRef } from "react"
import { Copy, Trash2, ArrowUp, ArrowDown, Settings } from "lucide-react"

interface CraftContextMenuProps {
    x: number
    y: number
    nodeId: string
    onClose: () => void
    isTopLevel?: boolean
}

export function CraftContextMenu({ x, y, nodeId, onClose, isTopLevel = false }: CraftContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscape)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [onClose])

    // Calculate position to ensure menu stays within viewport
    const adjustedPosition = () => {
        const menuWidth = 200
        const menuHeight = 300
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let adjustedX = x
        let adjustedY = y

        if (x + menuWidth > viewportWidth) {
            adjustedX = viewportWidth - menuWidth - 10
        }

        if (y + menuHeight > viewportHeight) {
            adjustedY = viewportHeight - menuHeight - 10
        }

        return { x: adjustedX, y: adjustedY }
    }

    const { x: finalX, y: finalY } = adjustedPosition()

    return (
        <div
            ref={menuRef}
            className="fixed z-[9999] animate-in fade-in-0 zoom-in-95 duration-200"
            style={{ left: finalX, top: finalY }}
        >
            <div
                className="bg-popover/95 backdrop-blur-xl border rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-1.5">
                    {/* Edit Properties */}
                    <ContextMenuItem
                        icon={<Settings className="h-4 w-4 text-primary" />}
                        label="Edit Properties"
                        onClick={() => {
                            // Selection is already handled by RenderNode
                            onClose()
                        }}
                        bgColor="bg-primary/10"
                        hoverBgColor="bg-primary/20"
                    />

                    {/* Duplicate */}
                    <ContextMenuItem
                        icon={<Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                        label="Duplicate"
                        onClick={() => {
                            // Will be handled in RenderNode
                            const event = new CustomEvent('craftjs-duplicate', { detail: { nodeId } })
                            window.dispatchEvent(event)
                            onClose()
                        }}
                        bgColor="bg-blue-500/10"
                        hoverBgColor="bg-blue-500/20"
                    />

                    {/* Move Up */}
                    <ContextMenuItem
                        icon={<ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />}
                        label="Move Up"
                        onClick={() => {
                            const event = new CustomEvent('craftjs-moveup', { detail: { nodeId } })
                            window.dispatchEvent(event)
                            onClose()
                        }}
                        bgColor="bg-green-500/10"
                        hoverBgColor="bg-green-500/20"
                    />

                    {/* Move Down */}
                    <ContextMenuItem
                        icon={<ArrowDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                        label="Move Down"
                        onClick={() => {
                            const event = new CustomEvent('craftjs-movedown', { detail: { nodeId } })
                            window.dispatchEvent(event)
                            onClose()
                        }}
                        bgColor="bg-amber-500/10"
                        hoverBgColor="bg-amber-500/20"
                    />

                    {/* Divider */}
                    <div className="border-t border-border/50 my-1.5" />

                    {/* Delete - only for nested nodes */}
                    {!isTopLevel && (
                        <ContextMenuItem
                            icon={<Trash2 className="h-4 w-4 text-destructive" />}
                            label="Delete"
                            onClick={() => {
                                const event = new CustomEvent('craftjs-delete', { detail: { nodeId } })
                                window.dispatchEvent(event)
                                onClose()
                            }}
                            bgColor="bg-destructive/10"
                            hoverBgColor="bg-destructive/20"
                            textColor="text-destructive"
                            isDestructive
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

interface ContextMenuItemProps {
    icon: React.ReactNode
    label: string
    onClick: () => void
    bgColor: string
    hoverBgColor: string
    textColor?: string
    isDestructive?: boolean
}

function ContextMenuItem({ icon, label, onClick, bgColor, hoverBgColor, textColor, isDestructive }: ContextMenuItemProps) {
    return (
        <button
            className={`w-full px-3 py-2.5 text-sm font-medium hover:bg-accent/50 rounded-lg flex items-center gap-3 text-left transition-all duration-150 group ${isDestructive ? 'hover:bg-destructive/10' : ''}`}
            onClick={onClick}
        >
            <div className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center group-hover:${hoverBgColor} transition-colors`}>
                {icon}
            </div>
            <span className={textColor}>{label}</span>
        </button>
    )
}
