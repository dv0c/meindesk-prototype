"use client"

import { useNode, useEditor } from "@craftjs/core"
import { useState, useRef, useEffect, useCallback } from "react"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyColor,
    PropertySelect,
    PropertyButtonGroup,
} from "../components/PropertySection"

interface TextProps {
    text?: string
    fontSize?: number
    fontWeight?: string
    color?: string
    textAlign?: "left" | "center" | "right" | "justify"
    lineHeight?: number
    marginTop?: number
    marginBottom?: number
    className?: string
}

export const Text = ({
    text = "This is a paragraph of text. Click to edit.",
    fontSize = 16,
    fontWeight = "400",
    color = "#374151",
    textAlign = "left",
    lineHeight = 1.6,
    marginTop = 0,
    marginBottom = 16,
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

    const [isEditing, setIsEditing] = useState(false)
    const contentRef = useRef<HTMLParagraphElement>(null)

    const style: React.CSSProperties = {
        fontSize,
        fontWeight,
        color,
        textAlign,
        lineHeight,
        marginTop,
        marginBottom,
        outline: isEditing ? "none" : undefined,
        cursor: isEditing ? "text" : "pointer",
        whiteSpace: isEditing ? "pre-wrap" : undefined,
    }

    // Single click to edit when already selected
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
            range.collapse(false)
            const selection = window.getSelection()
            selection?.removeAllRanges()
            selection?.addRange(range)
        }
    }, [isEditing])

    return (
        <p
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
        </p>
    )
}

// Settings component for Text
export const TextSettings = () => {
    const {
        actions: { setProp },
        text,
        fontSize,
        fontWeight,
        color,
        textAlign,
        lineHeight,
        marginTop,
        marginBottom,
    } = useNode((node) => ({
        text: node.data.props.text,
        fontSize: node.data.props.fontSize,
        fontWeight: node.data.props.fontWeight,
        color: node.data.props.color,
        textAlign: node.data.props.textAlign,
        lineHeight: node.data.props.lineHeight,
        marginTop: node.data.props.marginTop,
        marginBottom: node.data.props.marginBottom,
    }))

    const fontWeightLabel = {
        "300": "Light",
        "400": "Regular",
        "500": "Medium",
        "600": "Semibold",
        "700": "Bold",
    }[fontWeight || "400"] || "Regular"

    const typographySummary = `${fontSize}px, ${fontWeightLabel}, ${textAlign}`
    const marginSummary = `${marginTop || 0}px ${marginBottom || 0}px`

    return (
        <div>
            <PropertySection title="Content">
                <PropertyRow label="Text">
                    <textarea
                        value={text || ""}
                        onChange={(e) => setProp((props: TextProps) => (props.text = e.target.value))}
                        className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md resize-y bg-background"
                        rows={3}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Typography" summary={typographySummary}>
                <PropertyRow label="Font Size">
                    <PropertySlider
                        value={fontSize || 16}
                        onChange={(v) => setProp((props: TextProps) => (props.fontSize = v))}
                        min={10}
                        max={72}
                    />
                </PropertyRow>
                <PropertyRow label="Font Weight">
                    <PropertySelect
                        value={fontWeight || "400"}
                        onChange={(v) => setProp((props: TextProps) => (props.fontWeight = v))}
                        options={[
                            { label: "Light", value: "300" },
                            { label: "Regular", value: "400" },
                            { label: "Medium", value: "500" },
                            { label: "Semibold", value: "600" },
                            { label: "Bold", value: "700" },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Line Height">
                    <PropertySlider
                        value={Math.round((lineHeight || 1.6) * 10)}
                        onChange={(v) => setProp((props: TextProps) => (props.lineHeight = v / 10))}
                        min={10}
                        max={30}
                        unit=""
                    />
                </PropertyRow>
                <PropertyRow label="Text Align">
                    <PropertyButtonGroup
                        value={textAlign || "left"}
                        onChange={(v) => setProp((props: TextProps) => (props.textAlign = v as TextProps["textAlign"]))}
                        options={[
                            { label: "Left", value: "left" },
                            { label: "Center", value: "center" },
                            { label: "Right", value: "right" },
                            { label: "Justify", value: "justify" },
                        ]}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Appearance">
                <PropertyRow label="Color">
                    <PropertyColor
                        value={color || "#374151"}
                        onChange={(v) => setProp((props: TextProps) => (props.color = v))}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Margin" summary={marginSummary} defaultOpen={false}>
                <PropertyRow label="Top">
                    <PropertySlider
                        value={marginTop || 0}
                        onChange={(v) => setProp((props: TextProps) => (props.marginTop = v))}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
                <PropertyRow label="Bottom">
                    <PropertySlider
                        value={marginBottom || 0}
                        onChange={(v) => setProp((props: TextProps) => (props.marginBottom = v))}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

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
