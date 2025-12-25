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
} from "../components/PropertySection"

interface HeadingProps {
    text?: string
    level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    fontSize?: number
    fontWeight?: string
    color?: string
    textAlign?: "left" | "center" | "right"
    marginTop?: number
    marginBottom?: number
    className?: string
}

export const Heading = ({
    text = "Heading",
    level = "h2",
    fontSize = 32,
    fontWeight = "700",
    color = "#000000",
    textAlign = "left",
    marginTop = 0,
    marginBottom = 16,
    className = "",
}: HeadingProps) => {
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

    const [isEditing, setIsEditing] = useState(false)
    const contentRef = useRef<HTMLElement>(null)

    const Tag = level

    const style: React.CSSProperties = {
        fontSize,
        fontWeight,
        color,
        textAlign,
        marginTop,
        marginBottom,
        lineHeight: 1.2,
        outline: isEditing ? "none" : undefined,
        cursor: isEditing ? "text" : "pointer",
    }

    // Single click to edit when already selected
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        if (selected) {
            // Already selected, enter edit mode
            setIsEditing(true)
        } else {
            // Select this node
            editorActions.selectNode(id)
        }
    }, [selected, editorActions, id])

    const handleBlur = useCallback(() => {
        setIsEditing(false)
        if (contentRef.current) {
            const newText = contentRef.current.innerText.trim()
            if (newText) {
                setProp((props: HeadingProps) => {
                    props.text = newText
                })
            }
        }
    }, [setProp])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
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
            const range = document.createRange()
            range.selectNodeContents(contentRef.current)
            const selection = window.getSelection()
            selection?.removeAllRanges()
            selection?.addRange(range)
        }
    }, [isEditing])

    return (
        <Tag
            ref={(ref) => {
                contentRef.current = ref
                if (ref) connect(drag(ref))
            }}
            className={className}
            style={style}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onClick={handleClick}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
        >
            {text}
        </Tag>
    )
}

// Settings component for Heading
export const HeadingSettings = () => {
    const {
        actions: { setProp },
        text,
        level,
        fontSize,
        fontWeight,
        color,
        textAlign,
        marginTop,
        marginBottom,
    } = useNode((node) => ({
        text: node.data.props.text,
        level: node.data.props.level,
        fontSize: node.data.props.fontSize,
        fontWeight: node.data.props.fontWeight,
        color: node.data.props.color,
        textAlign: node.data.props.textAlign,
        marginTop: node.data.props.marginTop,
        marginBottom: node.data.props.marginBottom,
    }))

    const fontWeightLabel = {
        "400": "Regular",
        "500": "Medium",
        "600": "Semibold",
        "700": "Bold",
        "800": "Extra Bold",
    }[fontWeight || "700"] || "Bold"

    const typographySummary = `${fontSize}px, ${fontWeightLabel}, ${textAlign}`
    const marginSummary = `${marginTop || 0}px ${marginBottom || 0}px`

    return (
        <div>
            <PropertySection title="Content">
                <PropertyRow label="Text">
                    <PropertyInput
                        value={text || ""}
                        onChange={(v) => setProp((props: HeadingProps) => (props.text = v))}
                    />
                </PropertyRow>
                <PropertyRow label="Level">
                    <PropertySelect
                        value={level || "h2"}
                        onChange={(v) => setProp((props: HeadingProps) => (props.level = v as HeadingProps["level"]))}
                        options={[
                            { label: "H1", value: "h1" },
                            { label: "H2", value: "h2" },
                            { label: "H3", value: "h3" },
                            { label: "H4", value: "h4" },
                            { label: "H5", value: "h5" },
                            { label: "H6", value: "h6" },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Typography" summary={typographySummary}>
                <PropertyRow label="Font Size">
                    <PropertySlider
                        value={fontSize || 32}
                        onChange={(v) => setProp((props: HeadingProps) => (props.fontSize = v))}
                        min={12}
                        max={120}
                    />
                </PropertyRow>
                <PropertyRow label="Font Weight">
                    <PropertySelect
                        value={fontWeight || "700"}
                        onChange={(v) => setProp((props: HeadingProps) => (props.fontWeight = v))}
                        options={[
                            { label: "Regular", value: "400" },
                            { label: "Medium", value: "500" },
                            { label: "Semibold", value: "600" },
                            { label: "Bold", value: "700" },
                            { label: "Extra Bold", value: "800" },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Text Align">
                    <PropertyButtonGroup
                        value={textAlign || "left"}
                        onChange={(v) => setProp((props: HeadingProps) => (props.textAlign = v as HeadingProps["textAlign"]))}
                        options={[
                            { label: "Left", value: "left" },
                            { label: "Center", value: "center" },
                            { label: "Right", value: "right" },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Appearance">
                <PropertyRow label="Color">
                    <PropertyColor
                        value={color || "#000000"}
                        onChange={(v) => setProp((props: HeadingProps) => (props.color = v))}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Margin" summary={marginSummary} defaultOpen={false}>
                <PropertyRow label="Top">
                    <PropertySlider
                        value={marginTop || 0}
                        onChange={(v) => setProp((props: HeadingProps) => (props.marginTop = v))}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
                <PropertyRow label="Bottom">
                    <PropertySlider
                        value={marginBottom || 0}
                        onChange={(v) => setProp((props: HeadingProps) => (props.marginBottom = v))}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

Heading.craft = {
    displayName: "Heading",
    props: {
        text: "Heading",
        level: "h2",
        fontSize: 32,
        fontWeight: "700",
        color: "#000000",
        textAlign: "left",
        marginTop: 0,
        marginBottom: 16,
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: HeadingSettings,
    },
}
