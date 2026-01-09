"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNode, useEditor } from '@craftjs/core'

/**
 * Allowed text element types for EditableText
 */
type TextElementType =
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'p' | 'span' | 'div' | 'label'
    | 'strong' | 'em' | 'b' | 'i' | 'u' | 's'
    | 'small' | 'mark' | 'sub' | 'sup'
    | 'blockquote' | 'q' | 'cite'
    | 'a' | 'li'

/**
 * Props for EditableText component
 */
interface EditableTextProps {
    /** The prop name to update when text changes */
    propName: string
    /** Current value of the text */
    value: string
    /** HTML tag to render (default: 'span') */
    as?: TextElementType
    /** Additional class names */
    className?: string
    /** Additional inline styles */
    style?: React.CSSProperties
    /** Children to render (usually not needed, value is rendered) */
    children?: React.ReactNode
    /** Optional resolved value to display when not editing */
    renderValue?: string
}

/**
 * A component that makes text editable inline in the CraftJS editor.
 */
export function EditableText({
    propName,
    value,
    as: Tag = 'span',
    className,
    style,
    children,
    renderValue,
}: EditableTextProps) {
    const {
        selected,
        actions: { setProp },
    } = useNode((state) => ({
        selected: state.events.selected,
    }))

    const { enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }))

    const [isEditing, setIsEditing] = useState(false)
    const contentRef = useRef<HTMLElement>(null)

    const handleClick = useCallback((e: React.MouseEvent) => {
        if (!enabled) return
        e.stopPropagation()
        if (selected) {
            setIsEditing(true)
        }
    }, [enabled, selected])

    const handleBlur = useCallback(() => {
        setIsEditing(false)
        if (contentRef.current) {
            const newText = contentRef.current.innerText.trim()
            if (newText && newText !== value) {
                setProp((props: Record<string, any>) => {
                    props[propName] = newText
                })
            }
        }
    }, [setProp, propName, value])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            contentRef.current?.blur()
        }
        if (e.key === "Escape") {
            setIsEditing(false)
            if (contentRef.current) {
                contentRef.current.innerText = value || ""
            }
        }
    }, [value])

    // When deselected, exit edit mode
    useEffect(() => {
        if (!selected && isEditing) {
            setIsEditing(false)
        }
    }, [selected, isEditing])

    // Focus and select text when entering edit mode
    useEffect(() => {
        if (isEditing && contentRef.current) {
            contentRef.current.focus()
            setTimeout(() => {
                if (contentRef.current) {
                    const range = document.createRange()
                    range.selectNodeContents(contentRef.current)
                    const selection = window.getSelection()
                    selection?.removeAllRanges()
                    selection?.addRange(range)
                }
            }, 0)
        }
    }, [isEditing])

    const combinedStyle: React.CSSProperties = {
        ...style,
        outline: isEditing ? "none" : undefined,
        cursor: enabled ? (isEditing ? "text" : "pointer") : undefined,
    }

    const content = isEditing ? value : (renderValue ?? value)

    return (
        <Tag
            ref={contentRef as any}
            className={className}
            style={combinedStyle}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onClick={handleClick}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
        >
            {children ?? content}
        </Tag>
    )
}
