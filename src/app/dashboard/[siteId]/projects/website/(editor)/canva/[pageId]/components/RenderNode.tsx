"use client"

import { useNode, useEditor } from "@craftjs/core"
import { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { CraftContextMenu } from "./CraftContextMenu"
import { componentMap } from "../user-components"
import { useHoverContext } from "./HoverContext"

interface RenderNodeProps {
    render: React.ReactElement
}

export const RenderNode = ({ render }: RenderNodeProps) => {
    const { id } = useNode()
    const { isActive, isHovered, dom, name, moveable, deletable, parent, isResizable, connectors, displayName } = useNode(
        (node) => {
            return {
                isActive: node.events.selected,
                isHovered: node.events.hovered,
                dom: node.dom,
                name: node.data.custom?.displayName || node.data.displayName || node.data.name || "Component",
                displayName: node.data.displayName || node.data.name || "",
                moveable: node.data.custom?.moveable !== false,
                deletable: node.data.custom?.deletable !== false,
                parent: node.data.parent,
                isResizable: node.data.custom?.resizable === true ||
                    ["Container", "Image", "Spacer", "Grid"].includes(node.data.displayName || node.data.name || ""),
                connectors: node.related.connectors,
            }
        }
    )

    const { actions, enabled, isParentOfSelected, query, nodes } = useEditor((state) => {
        const selected = state.events.selected
        let isParent = false
        if (selected.size > 0) {
            const selectedId = selected.values().next().value
            if (selectedId) {
                const node = state.nodes[selectedId]
                if (node && node.data.parent === id) {
                    isParent = true
                }
            }
        }

        return {
            enabled: state.options.enabled,
            isParentOfSelected: isParent,
            nodes: state.nodes,
        }
    })

    // Hover context for parent hierarchy visualization
    const { hoveredAncestors, setHoveredNode } = useHoverContext()

    // Check if this node is an ancestor of the currently hovered node
    const isAncestorOfHovered = hoveredAncestors.includes(id)

    // Check if this is a container-type component that should show hierarchy outlines
    const isContainerType = ["Container", "Grid", "MeindeskContainer", "CollectionContainer"].includes(displayName)

    // Build ancestor chain when this node is hovered
    const getAncestorChain = useCallback((nodeId: string): string[] => {
        const ancestors: string[] = []
        let currentId = nodeId
        let safetyCounter = 0
        const maxDepth = 50  // Prevent infinite loops

        while (currentId && safetyCounter < maxDepth) {
            const node = nodes[currentId]
            if (!node || !node.data.parent) break
            ancestors.push(node.data.parent)
            currentId = node.data.parent
            safetyCounter++
        }
        return ancestors
    }, [nodes])

    // Update hover context when this node is hovered
    useEffect(() => {
        if (isHovered && enabled) {
            const ancestors = getAncestorChain(id)
            setHoveredNode(id, ancestors)
        }
    }, [isHovered, enabled, id, getAncestorChain, setHoveredNode])

    const [indicatorPosition, setIndicatorPosition] = useState<{ top: number; left: number } | null>(null)
    const [resizeHandlePosition, setResizeHandlePosition] = useState<{ bottom: number; right: number } | null>(null)
    const [boxModel, setBoxModel] = useState<{
        rect: DOMRect
        margin: { top: number; right: number; bottom: number; left: number }
        padding: { top: number; right: number; bottom: number; left: number }
    } | null>(null)
    const [spacingDrag, setSpacingDrag] = useState<{
        type: "padding" | "margin"
        side: "top" | "right" | "bottom" | "left"
        value: number
        x: number
        y: number
    } | null>(null)
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

    // Handle right-click
    const handleContextMenu = (e: React.MouseEvent) => {
        if (!enabled) return
        e.preventDefault()
        e.stopPropagation()

        // Select the node first
        actions.selectNode(id)

        // Show context menu
        setContextMenu({ x: e.clientX, y: e.clientY })
    }

    // Listen for custom events from context menu
    useEffect(() => {
        const handleDuplicate = (e: CustomEvent) => {
            if (e.detail.nodeId === id) {
                try {
                    const nodeTree = query.node(id).toSerializedNode()
                    if (parent) {
                        // Parse the serialized node to get a proper tree
                        const parsedTree = query.parseSerializedNode(nodeTree).toNode()
                        actions.add(parsedTree, parent)
                    }
                } catch (err) {
                    console.error("Error duplicating node:", err)
                }
            }
        }

        const handleMoveUp = (e: CustomEvent) => {
            if (e.detail.nodeId === id && parent) {
                const parentNode = query.node(parent).get()
                const childNodes = parentNode.data.nodes || []
                const currentIndex = childNodes.indexOf(id)

                if (currentIndex > 0) {
                    actions.move(id, parent, currentIndex - 1)
                }
            }
        }

        const handleMoveDown = (e: CustomEvent) => {
            if (e.detail.nodeId === id && parent) {
                const parentNode = query.node(parent).get()
                const childNodes = parentNode.data.nodes || []
                const currentIndex = childNodes.indexOf(id)

                if (currentIndex < childNodes.length - 1) {
                    actions.move(id, parent, currentIndex + 1)
                }
            }
        }

        const handleDeleteNode = (e: CustomEvent) => {
            // Allow deletion unless this IS the ROOT node itself
            if (e.detail.nodeId === id && deletable && id !== 'ROOT') {
                actions.delete(id)
            }
        }

        window.addEventListener('craftjs-duplicate', handleDuplicate as EventListener)
        window.addEventListener('craftjs-moveup', handleMoveUp as EventListener)
        window.addEventListener('craftjs-movedown', handleMoveDown as EventListener)
        window.addEventListener('craftjs-delete', handleDeleteNode as EventListener)

        return () => {
            window.removeEventListener('craftjs-duplicate', handleDuplicate as EventListener)
            window.removeEventListener('craftjs-moveup', handleMoveUp as EventListener)
            window.removeEventListener('craftjs-movedown', handleMoveDown as EventListener)
            window.removeEventListener('craftjs-delete', handleDeleteNode as EventListener)
        }
    }, [id, parent, actions, query])

    // Update positions when element changes or scrolls
    useEffect(() => {
        if (!dom || !enabled || (!isActive && !isHovered && !isParentOfSelected)) {
            setIndicatorPosition(null)
            setResizeHandlePosition(null)
            setBoxModel(null)
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

            // Get computed styles for margin and padding (only when selected or parent of selected)
            if (isActive || isParentOfSelected) {
                const computed = window.getComputedStyle(dom)
                setBoxModel({
                    rect,
                    margin: {
                        top: parseFloat(computed.marginTop) || 0,
                        right: parseFloat(computed.marginRight) || 0,
                        bottom: parseFloat(computed.marginBottom) || 0,
                        left: parseFloat(computed.marginLeft) || 0,
                    },
                    padding: {
                        top: parseFloat(computed.paddingTop) || 0,
                        right: parseFloat(computed.paddingRight) || 0,
                        bottom: parseFloat(computed.paddingBottom) || 0,
                        left: parseFloat(computed.paddingLeft) || 0,
                    },
                })
            } else {
                setBoxModel(null)
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
    }, [dom, isActive, isHovered, enabled, isResizable, isParentOfSelected])

    // Apply outline styles - including parent hierarchy visualization
    useEffect(() => {
        if (dom && enabled) {
            if (isActive) {
                // Selected element - solid blue outline
                dom.style.outline = "2px solid #2680eb"
                dom.style.outlineOffset = "-1px"
            } else if (isHovered) {
                // Hovered element - solid blue outline
                dom.style.outline = "2px solid #2680eb"
                dom.style.outlineOffset = "-1px"
            } else if (isAncestorOfHovered && isContainerType) {
                // Parent container of hovered element - dashed lighter outline
                dom.style.outline = "1px dashed rgba(38, 128, 235, 0.6)"
                dom.style.outlineOffset = "-1px"
            } else {
                dom.style.outline = "none"
                dom.style.outlineOffset = "0"
            }
        }

        // Cleanup when component unmounts or conditions change
        return () => {
            if (dom) {
                // Only clear if we're not being hovered/active anymore
                if (!isActive && !isHovered && !isAncestorOfHovered) {
                    dom.style.outline = "none"
                    dom.style.outlineOffset = "0"
                }
            }
        }
    }, [dom, isActive, isHovered, enabled, isAncestorOfHovered, isContainerType])

    const handleSelectParent = () => {
        if (parent) {
            actions.selectNode(parent)
        }
    }

    const handleDelete = () => {
        // Allow deletion unless this IS the ROOT node itself
        if (deletable && id !== 'ROOT') {
            actions.delete(id)
        }
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

            let newWidth = Math.max(50, startWidth + deltaX)
            let newHeight = Math.max(20, startHeight + deltaY)

            // Get parent width for % calculation
            const parentWidth = dom.parentElement?.getBoundingClientRect().width || window.innerWidth

            // Snapping Logic
            const node = query.node(id).get()
            const shouldSnap = node.data.props.enableSnapping === true

            if (shouldSnap) {
                const breakpoints = [640, 768, 1024, 1280, 1536]
                const threshold = 20

                for (const bp of breakpoints) {
                    if (Math.abs(newWidth - bp) < threshold) {
                        newWidth = bp
                        break
                    }
                }
            }

            // Constraint: Don't go higher than screen width (or parent width)
            // Applied AFTER snapping to ensure we don't snap outside the container
            newWidth = Math.min(newWidth, parentWidth)

            // Convert to percentage
            let widthPercent = (newWidth / parentWidth) * 100

            // Hard clamp to 100% to handle precision issues
            if (widthPercent > 100) widthPercent = 100

            finalWidth = newWidth // Keep pixel value for height calculation if needed
            finalHeight = newHeight

            // Update DOM directly for smooth feedback
            dom.style.width = `${widthPercent}%`
            dom.style.minWidth = `${widthPercent}%`
            dom.style.maxWidth = `${widthPercent}%`
            dom.style.minHeight = `${finalHeight}px` // Height usually stays px for images unless ratio locked? 
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

            // Calculate final % for saving
            const parentWidth = dom.parentElement?.getBoundingClientRect().width || window.innerWidth
            const finalPercent = (finalWidth / parentWidth) * 100

            // Sync final values to CraftJS state
            actions.setProp(id, (prop: Record<string, any>) => {
                if (prop.width !== undefined || name === "Container" || name === "Grid") {
                    prop.width = `${finalPercent.toFixed(2)}%`
                }
                if (prop.maxWidth !== undefined) {
                    prop.maxWidth = `${finalPercent.toFixed(2)}%`
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

    // Handler for dragging padding/margin edges
    const createSpacingDragHandler = (
        type: "padding" | "margin",
        side: "top" | "right" | "bottom" | "left",
        cursor: string
    ) => (e: React.MouseEvent) => {
        if (!dom || !boxModel) return
        e.stopPropagation()
        e.preventDefault()

        const startPos = side === "top" || side === "bottom" ? e.clientY : e.clientX
        const startValue = boxModel[type][side]

        // Store original transition
        const originalTransition = dom.style.transition
        dom.style.transition = "none"

        let finalValue = startValue

        // Set initial drag state
        setSpacingDrag({
            type,
            side,
            value: startValue,
            x: e.clientX,
            y: e.clientY,
        })

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const currentPos = side === "top" || side === "bottom" ? moveEvent.clientY : moveEvent.clientX
            let delta = currentPos - startPos

            // Invert delta for top/left (dragging up/left increases spacing)
            if (side === "top" || side === "left") {
                delta = -delta
            }

            finalValue = Math.max(0, Math.round(startValue + delta))

            // Update drag state for tooltip
            setSpacingDrag({
                type,
                side,
                value: finalValue,
                x: moveEvent.clientX,
                y: moveEvent.clientY,
            })

            // Update DOM directly for smooth feedback
            const propName = type === "padding"
                ? `padding${side.charAt(0).toUpperCase() + side.slice(1)}`
                : `margin${side.charAt(0).toUpperCase() + side.slice(1)}`

            dom.style[propName as any] = `${finalValue}px`

            // Update box model state for visual feedback
            const rect = dom.getBoundingClientRect()
            const computed = window.getComputedStyle(dom)
            setBoxModel({
                rect,
                margin: {
                    top: parseFloat(computed.marginTop) || 0,
                    right: parseFloat(computed.marginRight) || 0,
                    bottom: parseFloat(computed.marginBottom) || 0,
                    left: parseFloat(computed.marginLeft) || 0,
                },
                padding: {
                    top: parseFloat(computed.paddingTop) || 0,
                    right: parseFloat(computed.paddingRight) || 0,
                    bottom: parseFloat(computed.paddingBottom) || 0,
                    left: parseFloat(computed.paddingLeft) || 0,
                },
            })
        }

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
            document.body.style.cursor = ""

            // Clear drag state
            setSpacingDrag(null)

            // Restore transition
            dom.style.transition = originalTransition

            // Sync final value to CraftJS state
            actions.setProp(id, (prop: Record<string, any>) => {
                if (type === "padding") {
                    if (side === "top") prop.paddingTop = finalValue
                    else if (side === "right") prop.paddingRight = finalValue
                    else if (side === "bottom") prop.paddingBottom = finalValue
                    else if (side === "left") prop.paddingLeft = finalValue
                    // Also update base padding if it exists
                    if (prop.padding !== undefined && side === "top") {
                        prop.padding = finalValue
                    }
                } else {
                    if (side === "top") prop.marginTop = finalValue
                    else if (side === "right") prop.marginRight = finalValue
                    else if (side === "bottom") prop.marginBottom = finalValue
                    else if (side === "left") prop.marginLeft = finalValue
                }
            })
        }

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = cursor
    }

    return (
        <>
            <div onContextMenu={handleContextMenu} style={{ width: "100%" }}>
                {render}
            </div>

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
                        zIndex: 5,
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
                    {deletable && id !== 'ROOT' && (
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
                        zIndex: 5,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                />,
                document.body
            )}

            {/* Render margin overlays (orange) - draggable */}
            {enabled && boxModel && (isActive || isParentOfSelected) && typeof window !== "undefined" && createPortal(
                <>
                    {/* Margin Top */}
                    {boxModel.margin.top >= 0 && (
                        <div
                            onMouseDown={createSpacingDragHandler("margin", "top", "ns-resize")}
                            style={{
                                position: "fixed",
                                top: boxModel.rect.top - Math.max(boxModel.margin.top, 8),
                                left: boxModel.rect.left,
                                width: boxModel.rect.width,
                                height: Math.max(boxModel.margin.top, 8),
                                background: boxModel.margin.top > 0 ? `rgba(255, 165, 0, ${isActive ? 0.3 : 0.1})` : "transparent",
                                cursor: "ns-resize",
                                zIndex: 4,
                            }}
                        />
                    )}
                    {/* Margin Bottom */}
                    {boxModel.margin.bottom >= 0 && (
                        <div
                            onMouseDown={createSpacingDragHandler("margin", "bottom", "ns-resize")}
                            style={{
                                position: "fixed",
                                top: boxModel.rect.bottom,
                                left: boxModel.rect.left,
                                width: boxModel.rect.width,
                                height: Math.max(boxModel.margin.bottom, 8),
                                background: boxModel.margin.bottom > 0 ? `rgba(255, 165, 0, ${isActive ? 0.3 : 0.1})` : "transparent",
                                cursor: "ns-resize",
                                zIndex: 4,
                            }}
                        />
                    )}
                    {/* Margin Left */}
                    {boxModel.margin.left >= 0 && (
                        <div
                            onMouseDown={createSpacingDragHandler("margin", "left", "ew-resize")}
                            style={{
                                position: "fixed",
                                top: boxModel.rect.top - boxModel.margin.top,
                                left: boxModel.rect.left - Math.max(boxModel.margin.left, 8),
                                width: Math.max(boxModel.margin.left, 8),
                                height: boxModel.rect.height + boxModel.margin.top + boxModel.margin.bottom,
                                background: boxModel.margin.left > 0 ? `rgba(255, 165, 0, ${isActive ? 0.3 : 0.1})` : "transparent",
                                cursor: "ew-resize",
                                zIndex: 4,
                            }}
                        />
                    )}
                    {/* Margin Right */}
                    {boxModel.margin.right >= 0 && (
                        <div
                            onMouseDown={createSpacingDragHandler("margin", "right", "ew-resize")}
                            style={{
                                position: "fixed",
                                top: boxModel.rect.top - boxModel.margin.top,
                                left: boxModel.rect.right,
                                width: Math.max(boxModel.margin.right, 8),
                                height: boxModel.rect.height + boxModel.margin.top + boxModel.margin.bottom,
                                background: boxModel.margin.right > 0 ? `rgba(255, 165, 0, ${isActive ? 0.3 : 0.1})` : "transparent",
                                cursor: "ew-resize",
                                zIndex: 4,
                            }}
                        />
                    )}
                </>,
                document.body
            )}

            {/* Render padding overlays (green) - draggable */}
            {enabled && boxModel && (isActive || isParentOfSelected) && typeof window !== "undefined" && createPortal(
                <>
                    {/* Padding Top */}
                    {boxModel.padding.top >= 0 && (
                        <div
                            onMouseDown={createSpacingDragHandler("padding", "top", "ns-resize")}
                            style={{
                                position: "fixed",
                                top: boxModel.rect.top,
                                left: boxModel.rect.left,
                                width: boxModel.rect.width,
                                height: Math.max(boxModel.padding.top, 8),
                                background: boxModel.padding.top > 0 ? `rgba(0, 200, 100, ${isActive ? 0.3 : 0.1})` : "transparent",
                                cursor: "ns-resize",
                                zIndex: 4,
                            }}
                        />
                    )}
                    {/* Padding Bottom */}
                    {boxModel.padding.bottom >= 0 && (
                        <div
                            onMouseDown={createSpacingDragHandler("padding", "bottom", "ns-resize")}
                            style={{
                                position: "fixed",
                                top: boxModel.rect.bottom - Math.max(boxModel.padding.bottom, 8),
                                left: boxModel.rect.left,
                                width: boxModel.rect.width,
                                height: Math.max(boxModel.padding.bottom, 8),
                                background: boxModel.padding.bottom > 0 ? `rgba(0, 200, 100, ${isActive ? 0.3 : 0.1})` : "transparent",
                                cursor: "ns-resize",
                                zIndex: 4,
                            }}
                        />
                    )}
                    {/* Padding Left */}
                    {boxModel.padding.left >= 0 && (
                        <div
                            onMouseDown={createSpacingDragHandler("padding", "left", "ew-resize")}
                            style={{
                                position: "fixed",
                                top: boxModel.rect.top + boxModel.padding.top,
                                left: boxModel.rect.left,
                                width: Math.max(boxModel.padding.left, 8),
                                height: boxModel.rect.height - boxModel.padding.top - boxModel.padding.bottom,
                                background: boxModel.padding.left > 0 ? `rgba(0, 200, 100, ${isActive ? 0.3 : 0.1})` : "transparent",
                                cursor: "ew-resize",
                                zIndex: 4,
                            }}
                        />
                    )}
                    {/* Padding Right */}
                    {boxModel.padding.right >= 0 && (
                        <div
                            onMouseDown={createSpacingDragHandler("padding", "right", "ew-resize")}
                            style={{
                                position: "fixed",
                                top: boxModel.rect.top + boxModel.padding.top,
                                left: boxModel.rect.right - Math.max(boxModel.padding.right, 8),
                                width: Math.max(boxModel.padding.right, 8),
                                height: boxModel.rect.height - boxModel.padding.top - boxModel.padding.bottom,
                                background: boxModel.padding.right > 0 ? `rgba(0, 200, 100, ${isActive ? 0.3 : 0.1})` : "transparent",
                                cursor: "ew-resize",
                                zIndex: 4,
                            }}
                        />
                    )}
                </>,
                document.body
            )}

            {/* Spacing drag tooltip */}
            {spacingDrag && typeof window !== "undefined" && createPortal(
                <div
                    style={{
                        position: "fixed",
                        top: spacingDrag.y + 16,
                        left: spacingDrag.x + 16,
                        padding: "6px 12px",
                        background: spacingDrag.type === "padding" ? "#00c864" : "#ffa500",
                        color: spacingDrag.type === "padding" ? "white" : "black",
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 6,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        zIndex: 5,
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <span style={{ textTransform: "capitalize" }}>
                        {spacingDrag.type} {spacingDrag.side}
                    </span>
                    <span style={{
                        background: "rgba(0,0,0,0.15)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontFamily: "monospace",
                    }}>
                        {spacingDrag.value}px
                    </span>
                </div>,
                document.body
            )}

            {/* Context Menu */}
            {contextMenu && typeof window !== "undefined" && createPortal(
                <CraftContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    nodeId={id}
                    onClose={() => setContextMenu(null)}
                    isTopLevel={id === 'ROOT'}
                />,
                document.body
            )}
        </>
    )
}
