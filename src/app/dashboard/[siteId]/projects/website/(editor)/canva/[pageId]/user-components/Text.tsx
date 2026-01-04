"use client"

import { useNode, useEditor } from "@craftjs/core"
import { useState, useRef, useEffect, useCallback } from "react"
import { useCollectionItem } from "./collections/CollectionItemContext"
import { resolveCollectionTemplate } from "@/lib/collection-utils"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyColor,
    PropertySelect,
} from "../components/PropertySection"

interface TextProps {
    text?: string
    fontSize?: number
    fontWeight?: string
    color?: string
    textAlign?: "left" | "center" | "right" | "justify"
    lineHeight?: number
    marginTop?: string | number
    marginRight?: string | number
    marginBottom?: string | number
    marginLeft?: string | number
    paddingTop?: string | number
    paddingRight?: string | number
    paddingBottom?: string | number
    paddingLeft?: string | number
    backgroundColor?: string
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    boxShadow?: string
    className?: string
}

export const Text = ({
    text = "This is a paragraph of text. Click to edit.",
    fontSize = 16,
    fontWeight = "400",
    color = "#374151",
    textAlign = "left",
    lineHeight = 1.6,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    backgroundColor,
    borderRadius,
    borderWidth,
    borderColor,
    boxShadow,
    className = "",
}: TextProps) => {
    const {
        connectors: { connect, drag },
        selected,
        id,
        actions: { setProp },
    } = useNode((state) => ({
        selected: state.events.selected,
        id: state.id,
    }))

    const { actions: editorActions } = useEditor()
    const collectionContext = useCollectionItem()

    const [isEditing, setIsEditing] = useState(false)
    const contentRef = useRef<HTMLParagraphElement>(null)

    // Resolve variables in text if we are in a collection context
    // Only resolve when NOT editing, so the user sees the raw template when typing
    const displayText = (isEditing)
        ? text
        : resolveCollectionTemplate(text, collectionContext?.data)

    const style: React.CSSProperties = {
        width: "100%",
        fontSize,
        fontWeight,
        fontFamily: "var(--design-font-base, inherit)",
        color: color === "#374151" ? "var(--design-neutral, #374151)" : color,
        textAlign,
        lineHeight,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        backgroundColor,
        borderRadius: borderRadius ? `${borderRadius}px` : undefined,
        borderWidth: borderWidth ? `${borderWidth}px` : undefined,
        borderColor,
        borderStyle: borderWidth ? "solid" : undefined,
        boxShadow,
        outline: isEditing ? "none" : undefined,
        cursor: selected ? "text" : "pointer",
        whiteSpace: isEditing ? "pre-wrap" : undefined,
    }

    // Logic for editing state
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        if (selected) {
            setIsEditing(true)
        } else {
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
            ref={(ref: any) => connect(drag(ref))}
            className={className}
            style={style}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onClick={handleClick}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            ref={(ref: any) => {
                connect(drag(ref))
                contentRef.current = ref
            }}
        >
            {displayText}
        </p>
    )
}


// Settings component for Text
// Import from external file
import { TextSettings } from "./TextSettings"
export { TextSettings }

Text.craft = {
    displayName: "Text",
    props: {
        text: "This is a paragraph of text. Click to edit.",
        fontSize: 16,
        fontWeight: "400",
        color: "#374151",
        textAlign: "left",
        lineHeight: 1.6,
        marginTop: 0,
        marginBottom: 16,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: TextSettings,
    },
}
