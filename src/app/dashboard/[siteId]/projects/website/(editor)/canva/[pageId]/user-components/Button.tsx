"use client"

import { useNode, useEditor } from "@craftjs/core"
import { useState, useRef, useEffect, useCallback } from "react"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyColor,
    PropertyInput,
    PropertySelect,
    PropertyButtonGroup,
    PropertyCheckbox,
} from "../components/PropertySection"
import { useDesign } from "../components/DesignContext"

interface ButtonProps {
    text?: string
    variant?: "primary" | "secondary" | "outline" | "ghost"
    size?: "sm" | "md" | "lg"
    url?: string
    openInNewTab?: boolean
    backgroundColor?: string
    textColor?: string
    borderRadius?: number
    fullWidth?: boolean
    className?: string
}

const variantStyles = {
    primary: {
        bg: "#000000",
        text: "#ffffff",
        border: "transparent",
    },
    secondary: {
        bg: "#f1f5f9",
        text: "#0f172a",
        border: "transparent",
    },
    outline: {
        bg: "transparent",
        text: "#000000",
        border: "#000000",
    },
    ghost: {
        bg: "transparent",
        text: "#000000",
        border: "transparent",
    },
}

const sizeStyles = {
    sm: { padding: "8px 16px", fontSize: 14 },
    md: { padding: "12px 24px", fontSize: 16 },
    lg: { padding: "16px 32px", fontSize: 18 },
}

// Add imports
import { useCollectionItem } from "./collections/CollectionItemContext"
import { resolveCollectionTemplate } from "@/lib/collection-utils"

export const Button = ({
    text = "Button",
    variant = "primary",
    size = "md",
    url = "",
    openInNewTab = false,
    backgroundColor,
    textColor,
    borderRadius = 6,
    fullWidth = false,
    className = "",
}: ButtonProps) => {
    const {
        connectors: { connect, drag },
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

    const [isEditing, setIsEditing] = useState(false)
    const contentRef = useRef<HTMLButtonElement>(null)
    const collectionContext = useCollectionItem()

    // Resolve properties
    const resolvedText = resolveCollectionTemplate(text, collectionContext?.data)
    const resolvedUrl = resolveCollectionTemplate(url, collectionContext?.data)

    const { settings: designSettings } = useDesign()

    const variantStyle = variantStyles[variant]
    const sizeStyle = sizeStyles[size]

    // Determine if button should use outline style based on variant AND design setting
    const designButtonStyle = designSettings?.buttonStyle || "filled"
    const isOutline = variant === "outline" || (variant === "primary" && designButtonStyle === "outline")
    const isGhost = variant === "ghost" || (variant === "primary" && designButtonStyle === "ghost")
    const isFilled = !isOutline && !isGhost

    // Use CSS variables from design context with fallbacks
    const style: React.CSSProperties = {
        backgroundColor: backgroundColor || (
            isOutline || isGhost
                ? "transparent"
                : "var(--design-primary, #000000)"
        ),
        color: textColor || (
            isOutline
                ? "var(--design-primary, #000000)"
                : isFilled
                    ? "#ffffff"
                    : variantStyle.text
        ),
        borderColor: isOutline ? "var(--design-primary, #000000)" : variantStyle.border,
        borderWidth: isOutline ? 2 : 0,
        borderStyle: "solid",
        borderRadius: `var(--design-button-radius, ${borderRadius}px)`,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        fontWeight: 500,
        fontFamily: "var(--design-font-base, inherit)",
        cursor: selected ? "text" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: fullWidth ? "100%" : "auto",
        transition: "all 0.2s ease",
        outline: isEditing ? "none" : undefined,
    }

    const displayText = (isEditing) ? text : resolvedText

    // Single click to edit when already selected
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
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
                setProp((p: ButtonProps) => {
                    p.text = newText
                })
            }
        }
    }, [setProp])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            contentRef.current?.blur()
        }
        if (e.key === "Escape") {
            setIsEditing(false)
            if (contentRef.current) {
                contentRef.current.innerText = text || ""
            }
        }
    }, [text])

    // When deselected, exit edit mode
    useEffect(() => {
        if (!selected && isEditing) {
            setIsEditing(false)
        }
    }, [selected, isEditing])

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

    return (
        <button
            ref={(ref: any) => {
                connect(drag(ref))
                contentRef.current = ref
            }}
            className={className}
            style={style}
            onClick={handleClick}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            contentEditable={isEditing}
            suppressContentEditableWarning
        >
            {displayText}
        </button>
    )
}

// Settings component for Button
export const ButtonSettings = () => {
    const {
        actions: { setProp },
        text,
        variant,
        size,
        url,
        openInNewTab,
        backgroundColor,
        textColor,
        borderRadius,
        fullWidth,
    } = useNode((node) => ({
        text: node.data.props.text,
        variant: node.data.props.variant,
        size: node.data.props.size,
        url: node.data.props.url,
        openInNewTab: node.data.props.openInNewTab,
        backgroundColor: node.data.props.backgroundColor,
        textColor: node.data.props.textColor,
        borderRadius: node.data.props.borderRadius,
        fullWidth: node.data.props.fullWidth,
    }))

    return (
        <div>
            <PropertySection title="Content">
                <PropertyRow label="Button Text">
                    <PropertyInput
                        value={text || ""}
                        onChange={(v) => setProp((props: ButtonProps) => (props.text = v))}
                    />
                </PropertyRow>
                <div className="px-4 pb-2 text-xs text-muted-foreground">
                    Tip: Use <code>{`{field_name}`}</code> for dynamic text or URL.
                </div>
                <PropertyRow label="URL">
                    <PropertyInput
                        type="url"
                        value={url || ""}
                        onChange={(v) => setProp((props: ButtonProps) => (props.url = v))}
                        placeholder="https://..."
                    />
                </PropertyRow>
                <PropertyCheckbox
                    id="openInNewTab"
                    label="Open in new tab"
                    checked={openInNewTab || false}
                    onChange={(v) => setProp((props: ButtonProps) => (props.openInNewTab = v))}
                />
            </PropertySection>

            <PropertySection title="Style" summary={`${variant}, ${size?.toUpperCase()}`}>
                <PropertyRow label="Variant">
                    <PropertySelect
                        value={variant || "primary"}
                        onChange={(v) => setProp((props: ButtonProps) => (props.variant = v as ButtonProps["variant"]))}
                        options={[
                            { label: "Primary", value: "primary" },
                            { label: "Secondary", value: "secondary" },
                            { label: "Outline", value: "outline" },
                            { label: "Ghost", value: "ghost" },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Size">
                    <PropertyButtonGroup
                        value={size || "md"}
                        onChange={(v) => setProp((props: ButtonProps) => (props.size = v as ButtonProps["size"]))}
                        options={[
                            { label: "SM", value: "sm" },
                            { label: "MD", value: "md" },
                            { label: "LG", value: "lg" },
                        ]}
                    />
                </PropertyRow>
                <PropertyCheckbox
                    id="fullWidth"
                    label="Full width"
                    checked={fullWidth || false}
                    onChange={(v) => setProp((props: ButtonProps) => (props.fullWidth = v))}
                />
            </PropertySection>

            <PropertySection title="Colors" defaultOpen={false}>
                <PropertyRow label="Background (Override)">
                    <PropertyColor
                        value={backgroundColor || ""}
                        onChange={(v) => setProp((props: ButtonProps) => (props.backgroundColor = v))}
                        placeholder="Use variant default"
                    />
                </PropertyRow>
                <PropertyRow label="Text (Override)">
                    <PropertyColor
                        value={textColor || ""}
                        onChange={(v) => setProp((props: ButtonProps) => (props.textColor = v))}
                        placeholder="Use variant default"
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Decoration" summary={`${borderRadius}px radius`} defaultOpen={false}>
                <PropertyRow label="Border Radius">
                    <PropertySlider
                        value={borderRadius || 6}
                        onChange={(v) => setProp((props: ButtonProps) => (props.borderRadius = v))}
                        min={0}
                        max={50}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

Button.craft = {
    displayName: "Button",
    props: {
        text: "Button",
        variant: "primary",
        size: "md",
        url: "",
        openInNewTab: false,
        borderRadius: 6,
        fullWidth: false,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: ButtonSettings,
    },
}
