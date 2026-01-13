"use client"

import React from "react"
import { useNode, useEditor } from "@craftjs/core"
import { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { CraftContextMenu } from "./CraftContextMenu"
import { componentMap } from "../user-components"
// import { useHoverContext } from "./HoverContext"

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

    // Hover context removed for performance
    const isAncestorOfHovered = false
    const isContainerType = ["Container", "Grid", "MeindeskContainer", "CollectionContainer"].includes(displayName)

    const [indicatorPosition, setIndicatorPosition] = useState<{ top: number; left: number } | null>(null)
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

            setBoxModel(null)
            return
        }

        const updatePositions = () => {
            const rect = dom.getBoundingClientRect()
            setIndicatorPosition({
                top: rect.top - 24,
                left: rect.left,
            })

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
    }, [dom, isActive, isHovered, enabled, isParentOfSelected])

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
                // Check if we should use style object (standard for new blocks)
                const useStyle = prop.style && typeof prop.style === 'object';
                const target = useStyle ? prop.style : prop;

                if (type === "padding") {
                    if (side === "top") target.paddingTop = finalValue
                    else if (side === "right") target.paddingRight = finalValue
                    else if (side === "bottom") target.paddingBottom = finalValue
                    else if (side === "left") target.paddingLeft = finalValue

                    // Also update base padding if it exists on root and we are writing to root
                    if (!useStyle && prop.padding !== undefined && side === "top") {
                        prop.padding = finalValue
                    }
                } else {
                    if (side === "top") target.marginTop = finalValue
                    else if (side === "right") target.marginRight = finalValue
                    else if (side === "bottom") target.marginBottom = finalValue
                    else if (side === "left") target.marginLeft = finalValue
                }
            })
        }

        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = cursor
    }

    // Attach context menu listener directly to DOM
    useEffect(() => {
        if (dom && enabled) {
            const handleRightClick = (e: MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()

                // Select the node
                actions.selectNode(id)

                // Show context menu
                setContextMenu({ x: e.clientX, y: e.clientY })
            }

            dom.addEventListener("contextmenu", handleRightClick)

            return () => {
                dom.removeEventListener("contextmenu", handleRightClick)
            }
        }
    }, [dom, enabled, id, actions])

    // Clone the render element
    // We don't need to pass onContextMenu here anymore as we're attaching it to the DOM
    const renderWithContextMenu = React.cloneElement(render)

    return (
        <>
            {renderWithContextMenu}

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
