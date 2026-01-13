"use client"

import { useNode, useEditor } from "@craftjs/core"
import { useState, useRef, useEffect, useCallback } from "react"
import { useCollectionItem } from "./collections/CollectionItemContext"
import { resolveCollectionTemplate } from "@/lib/collection-utils"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { TextSettings } from "./TextSettings" // Import settings component

interface TextProps {
    text?: string
    style?: BlockStyle
    className?: string
    // Legacy props mapping
    fontSize?: number
    fontWeight?: string
    color?: string
    textAlign?: "left" | "center" | "right" | "justify"
    lineHeight?: number
}

// Map legacy props to BlockStyle for defaultProps
// This is to support existing properties if they are passed.
const defaultStyles: BlockStyle = {
    width: "100%",
    height: "auto",
    fontSize: 16,
    fontWeight: "400",
    color: "#374151",
    textAlign: "left",
    marginBottom: 16,
    lineHeight: 1.6,
}

export const Text = defineBlock<TextProps>({
    name: "Text",
    category: "Basic",
    description: "Editable text block",
    // Icon can be added here

    defaultProps: {
        text: "This is a paragraph of text. Click to edit.",
        style: defaultStyles
    },

    settings: TextSettings,

    render: ({ text, style, className, theme, ...props }) => {
        const {
            selected,
            id,
            actions: { setProp },
        } = useNode((state) => ({
            selected: state.events.selected,
            id: state.id,
        }))

        const { actions: editorActions, enabled } = useEditor((state) => ({
            enabled: state.options.enabled
        }))
        const collectionContext = useCollectionItem()

        const [isEditing, setIsEditing] = useState(false)
        const contentRef = useRef<HTMLParagraphElement>(null)

        // Resolve variables in text
        const displayText = (isEditing)
            ? text
            : resolveCollectionTemplate(text, collectionContext?.data)

        // Merge legacy props into style if present (backwards compatibility), but prefer style
        // If settings are used, style will be updated directly.
        const mergedStyle: BlockStyle = {
            ...style,
            fontSize: style?.fontSize ?? props.fontSize,
            fontWeight: style?.fontWeight ?? props.fontWeight,
            color: style?.color ?? props.color,
            textAlign: style?.textAlign ?? props.textAlign,
            lineHeight: style?.lineHeight ?? props.lineHeight,
            // Fallback to theme font
            fontFamily: (style?.fontFamily as string) || "var(--design-font-base, inherit)",
            color: (style?.color === "#374151" && !props.color) ? "var(--design-text-body, inherit)" : (style?.color || props.color)
        }

        // Fluid typography calculation
        if (typeof mergedStyle.fontSize === 'number') {
            const fontSize = mergedStyle.fontSize
            const minFontSize = Math.max(10, fontSize * 0.3)
            const vwValue = fontSize * 0.08
            mergedStyle.fontSize = `clamp(${minFontSize / 16}rem, ${vwValue}vw + 0.5rem, ${fontSize / 16}rem)`
        }

        const { style: computedStyle, className: computedClassName } = useBlockStyles({
            style: {
                ...mergedStyle,
                outline: isEditing ? "none" : undefined,
                cursor: isEditing ? "text" : (enabled ? "default" : "auto"),
                whiteSpace: isEditing ? "pre-wrap" : undefined,
            },
            className
        })

        // Double-click to enter edit mode
        const handleDoubleClick = useCallback((e: React.MouseEvent) => {
            e.stopPropagation()
            if (enabled && selected) {
                setIsEditing(true)
            }
        }, [enabled, selected])

        const handleClick = useCallback((e: React.MouseEvent) => {
            e.stopPropagation()
            if (!selected) {
                editorActions.selectNode(id)
            }
        }, [selected, editorActions, id])

        const handleBlur = useCallback(() => {
            setIsEditing(false)
            if (contentRef.current) {
                const newText = contentRef.current.innerText.trim()
                if (newText) {
                    setProp((props: TextProps) => {
                        props.text = newText
                    })
                }
            }
        }, [setProp])

        const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsEditing(false)
                if (contentRef.current) {
                    contentRef.current.innerText = text || ""
                }
            }
        }, [text])

        // Handle focus effect for editing
        useEffect(() => {
            if (isEditing && contentRef.current) {
                contentRef.current.focus()
                const range = document.createRange()
                range.selectNodeContents(contentRef.current)
                range.collapse(false)
                const selection = window.getSelection()
                selection?.removeAllRanges()
                selection?.addRange(range)
            }
        }, [isEditing])

        // Sync editing state
        useEffect(() => {
            if (!selected && isEditing) {
                setIsEditing(false)
            }
        }, [selected, isEditing])

        return (
            <p
                ref={contentRef}
                className={computedClassName}
                style={computedStyle}
                contentEditable={isEditing}
                suppressContentEditableWarning
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            >
                {displayText}
            </p>
        )
    },

    childrenAllowed: false
})

export { TextSettings }
