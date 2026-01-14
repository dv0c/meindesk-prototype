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
    responsive?: { hiddenOn?: string[] }
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
        style: defaultStyles,
        responsive: { hiddenOn: [] }
    },

    settings: TextSettings,

    render: ({ text, style, className, theme, isEditing: isEditorEnv, responsive, deviceMode, ...props }) => {
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

        const [isInlineEditing, setIsInlineEditing] = useState(false)
        const contentRef = useRef<HTMLParagraphElement>(null)

        // Resolve variables in text
        const displayText = (isInlineEditing)
            ? text
            : resolveCollectionTemplate(text, collectionContext?.data)

        // Prepare style object
        const mergedStyle: BlockStyle = {
            ...style,
            fontFamily: (style?.fontFamily as string) || "var(--design-font-base, inherit)",
            color: (style?.color === "#374151") ? "var(--design-text-body, inherit)" : style?.color
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
                outline: isInlineEditing ? "none" : undefined,
                cursor: isInlineEditing ? "text" : (enabled ? "default" : "auto"),
                whiteSpace: isInlineEditing ? "pre-wrap" : undefined,
            },
            className,
            responsive,
            isEditing: isEditorEnv,
            deviceMode
        })

        // Double-click to enter edit mode
        const handleDoubleClick = useCallback((e: React.MouseEvent) => {
            e.stopPropagation()
            if (enabled && selected) {
                setIsInlineEditing(true)
            }
        }, [enabled, selected])

        const handleClick = useCallback((e: React.MouseEvent) => {
            e.stopPropagation()
            if (!selected) {
                editorActions.selectNode(id)
            }
        }, [selected, editorActions, id])

        const handleBlur = useCallback(() => {
            setIsInlineEditing(false)
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
                setIsInlineEditing(false)
                if (contentRef.current) {
                    contentRef.current.innerText = text || ""
                }
            }
        }, [text])

        // Handle focus effect for editing
        useEffect(() => {
            if (isInlineEditing && contentRef.current) {
                contentRef.current.focus()
                const range = document.createRange()
                range.selectNodeContents(contentRef.current)
                range.collapse(false)
                const selection = window.getSelection()
                selection?.removeAllRanges()
                selection?.addRange(range)
            }
        }, [isInlineEditing])

        // Sync editing state
        useEffect(() => {
            if (!selected && isInlineEditing) {
                setIsInlineEditing(false)
            }
        }, [selected, isInlineEditing])

        return (
            <p
                ref={contentRef}
                className={computedClassName}
                style={computedStyle}
                contentEditable={isInlineEditing}
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
