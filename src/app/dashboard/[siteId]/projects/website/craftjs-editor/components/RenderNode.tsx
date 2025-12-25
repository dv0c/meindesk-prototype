"use client"

import { useNode, useEditor } from "@craftjs/core"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

interface RenderNodeProps {
    render: React.ReactElement
}

export const RenderNode = ({ render }: RenderNodeProps) => {
    const { id } = useNode()
    const { isActive, isHovered, dom, name, moveable, deletable, parent, isResizable } = useNode(
        (node) => ({
            isActive: node.events.selected,
            isHovered: node.events.hovered,
            dom: node.dom,
            name: node.data.displayName || node.data.name || "Component",
            moveable: node.data.custom?.moveable !== false,
            deletable: node.data.custom?.deletable !== false,
            parent: node.data.parent,
            isResizable: node.data.custom?.resizable === true ||
                ["Container", "Image", "Spacer", "Grid"].includes(node.data.displayName || node.data.name || ""),
        })
    )

    const { actions, enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }))

    const [indicatorPosition, setIndicatorPosition] = useState<{ top: number; left: number } | null>(null)
    const [resizeHandlePosition, setResizeHandlePosition] = useState<{ bottom: number; right: number } | null>(null)

    // Update positions when element changes or scrolls
    useEffect(() => {
        if (!dom || !enabled || (!isActive && !isHovered)) {
            setIndicatorPosition(null)
            setResizeHandlePosition(null)
            return
        }

        const updatePositions = () => {
            const rect = dom.getBoundingClientRect()
            setIndicatorPosition({
                top: rect.top - 24,
                left: rect.left,
            })
            if (isActive && isResizable) {
                setResizeHandlePosition({
                    bottom: window.innerHeight - rect.bottom - 4,
                    right: window.innerWidth - rect.right - 4,
                })
            } else {
                setResizeHandlePosition(null)
            }
        }

        updatePositions()

        // Update on scroll and resize
        window.addEventListener("scroll", updatePositions, true)
        window.addEventListener("resize", updatePositions)

        return () => {
            window.removeEventListener("scroll", updatePositions, true)
            window.removeEventListener("resize", updatePositions)
        }
    }, [dom, isActive, isHovered, enabled, isResizable])

    // Apply outline styles
    useEffect(() => {
        if (dom && enabled) {
            if (isActive) {
                dom.style.outline = "2px solid #2680eb"
                dom.style.outlineOffset = "-1px"
            } else if (isHovered) {
                dom.style.outline = "2px solid #2680eb"
                dom.style.outlineOffset = "-1px"
            } else {
                dom.style.outline = "none"
                dom.style.outlineOffset = "0"
            }
        }
    }, [dom, isActive, isHovered, enabled])

    const handleSelectParent = () => {
        if (parent) {
            actions.selectNode(parent)
        }
    }

    const handleDelete = () => {
        actions.delete(id)
    }

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        if (!dom) return
        e.stopPropagation()
        e.preventDefault()

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = dom.offsetWidth
        const startHeight = dom.offsetHeight

        // Store original styles
        const originalTransition = dom.style.transition
        const originalWidth = dom.style.width
        const originalMinWidth = dom.style.minWidth
        const originalMaxWidth = dom.style.maxWidth
        const originalHeight = dom.style.height
        const originalMinHeight = dom.style.minHeight

        dom.style.transition = "none"

        let finalWidth = startWidth
        let finalHeight = startHeight

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY

            finalWidth = Math.max(50, startWidth + deltaX)
            finalHeight = Math.max(20, startHeight + deltaY)

            // Update DOM directly for smooth feedback
            // Override all width-related properties to ensure expansion works
            dom.style.width = `${finalWidth}px`
            dom.style.minWidth = `${finalWidth}px`
            dom.style.maxWidth = `${finalWidth}px`
            dom.style.minHeight = `${finalHeight}px`
            dom.style.height = `${finalHeight}px`

            // Update resize handle position
            const rect = dom.getBoundingClientRect()
            setResizeHandlePosition({
                bottom: window.innerHeight - rect.bottom - 4,
                right: window.innerWidth - rect.right - 4,
            })
        }

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            document.body.style.cursor = ""

            // Restore original transition
            dom.style.transition = originalTransition

            // Clear the temporary inline styles so CraftJS can take over
            dom.style.minWidth = originalMinWidth
            dom.style.height = originalHeight

            // Sync final values to CraftJS state
            actions.setProp(id, (prop: Record<string, any>) => {
                if (prop.width !== undefined || name === "Container" || name === "Grid") {
                    prop.width = `${finalWidth}px`
                }
                if (prop.maxWidth !== undefined) {
                    prop.maxWidth = `${finalWidth}px`
                }
                if (prop.height !== undefined || name === "Spacer") {
                    prop.height = finalHeight
                }
                if (prop.minHeight !== undefined) {
                    prop.minHeight = finalHeight
                }
            })
        }

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = "se-resize"
    }

    return (
        <>
            {render}

            {/* Render indicator as a portal outside the component DOM */}
            {enabled && indicatorPosition && (isHovered || isActive) && typeof window !== "undefined" && createPortal(
                <div
                    style={{
                        position: "fixed",
                        top: indicatorPosition.top,
                        left: indicatorPosition.left,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 8px",
                        background: "#2680eb",
                        color: "white",
                        fontSize: 11,
                        fontWeight: 500,
                        borderRadius: "4px 4px 0 0",
                        zIndex: 9999,
                        pointerEvents: "auto",
                        whiteSpace: "nowrap",
                    }}
                >
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ cursor: "move" }}>
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        <span>{name}</span>
                    </span>
                    {parent && (
                        <button
                            onClick={handleSelectParent}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 18,
                                height: 18,
                                background: "rgba(255,255,255,0.2)",
                                border: "none",
                                borderRadius: 2,
                                color: "white",
                                cursor: "pointer",
                                marginLeft: 4,
                            }}
                        >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 19V5M5 12l7-7 7 7" />
                            </svg>
                        </button>
                    )}
                    {deletable && (
                        <button
                            onClick={handleDelete}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 18,
                                height: 18,
                                background: "rgba(255,255,255,0.2)",
                                border: "none",
                                borderRadius: 2,
                                color: "white",
                                cursor: "pointer",
                            }}
                        >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                        </button>
                    )}
                </div>,
                document.body
            )}

            {/* Render resize handle as a portal */}
            {enabled && resizeHandlePosition && isActive && isResizable && typeof window !== "undefined" && createPortal(
                <div
                    onMouseDown={handleResizeMouseDown}
                    style={{
                        position: "fixed",
                        bottom: resizeHandlePosition.bottom,
                        right: resizeHandlePosition.right,
                        width: 10,
                        height: 10,
                        background: "#2680eb",
                        border: "2px solid white",
                        borderRadius: 2,
                        cursor: "se-resize",
                        zIndex: 9999,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                />,
                document.body
            )}
        </>
    )
}
