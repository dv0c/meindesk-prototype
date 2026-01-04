import React from "react"
import { useNode } from "@craftjs/core"
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"
import {
    PropertySection,
    PropertyRow,
    PropertySlider,
    PropertyColor,
    PropertySelect,
    PropertyIconButtonGroup,
} from "../components/PropertySection"

// Interface for Text Props (matching Text.tsx)
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
                <div className="px-4 pb-2 text-xs text-muted-foreground">
                    Tip: Use <code>{`{field_name}`}</code> to display dynamic collection data.
                </div>
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
                    <PropertyIconButtonGroup
                        value={textAlign || "left"}
                        onChange={(v) => setProp((props: TextProps) => (props.textAlign = v as TextProps["textAlign"]))}
                        options={[
                            { label: "Left", value: "left", icon: AlignLeft },
                            { label: "Center", value: "center", icon: AlignCenter },
                            { label: "Right", value: "right", icon: AlignRight },
                            { label: "Justify", value: "justify", icon: AlignJustify },
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
        </div>
    )
}
