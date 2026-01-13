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
        // Read from style, fall back to root props for legacy support
        text,
        fontSize,
        fontWeight,
        color,
        textAlign,
        lineHeight,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
    } = useNode((node) => ({
        text: node.data.props.text,
        fontSize: node.data.props.style?.fontSize ?? node.data.props.fontSize,
        fontWeight: node.data.props.style?.fontWeight ?? node.data.props.fontWeight,
        color: node.data.props.style?.color ?? node.data.props.color,
        textAlign: node.data.props.style?.textAlign ?? node.data.props.textAlign,
        lineHeight: node.data.props.style?.lineHeight ?? node.data.props.lineHeight,
        marginTop: node.data.props.style?.marginTop ?? node.data.props.marginTop,
        marginBottom: node.data.props.style?.marginBottom ?? node.data.props.marginBottom,
        marginLeft: node.data.props.style?.marginLeft ?? node.data.props.marginLeft,
        marginRight: node.data.props.style?.marginRight ?? node.data.props.marginRight,
        paddingTop: node.data.props.style?.paddingTop ?? node.data.props.paddingTop,
        paddingBottom: node.data.props.style?.paddingBottom ?? node.data.props.paddingBottom,
        paddingLeft: node.data.props.style?.paddingLeft ?? node.data.props.paddingLeft,
        paddingRight: node.data.props.style?.paddingRight ?? node.data.props.paddingRight,
        props: node.data.props,
    }))

    const fontWeightLabel = {
        "300": "Light",
        "400": "Regular",
        "500": "Medium",
        "600": "Semibold",
        "700": "Bold",
    }[fontWeight || "400"] || "Regular"

    const typographySummary = `${fontSize}px, ${fontWeightLabel}, ${textAlign}`

    const updateStyle = (key: string, value: any) => {
        setProp((props: any) => {
            if (!props.style) props.style = {}
            props.style[key] = value
            // Optional: clear legacy prop if desired, or keep for safety
            if (props[key] !== undefined) delete props[key]
        })
    }

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
                        onChange={(v) => updateStyle('fontSize', v)}
                        min={10}
                        max={72}
                    />
                </PropertyRow>
                <PropertyRow label="Font Weight">
                    <PropertySelect
                        value={fontWeight || "400"}
                        onChange={(v) => updateStyle('fontWeight', v)}
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
                        onChange={(v) => updateStyle('lineHeight', v / 10)}
                        min={10}
                        max={30}
                        unit=""
                    />
                </PropertyRow>
                <PropertyRow label="Text Align">
                    <PropertyIconButtonGroup
                        value={textAlign || "left"}
                        onChange={(v) => updateStyle('textAlign', v)}
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
                        onChange={(v) => updateStyle('color', v)}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Spacing" defaultOpen={false}>
                <PropertyRow label="Margin Top">
                    <PropertySlider
                        value={marginTop || 0}
                        onChange={(val) => updateStyle('marginTop', val)}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
                <PropertyRow label="Margin Bottom">
                    <PropertySlider
                        value={marginBottom || 16}
                        onChange={(val) => updateStyle('marginBottom', val)}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
                <PropertyRow label="Margin Left">
                    <PropertySlider
                        value={marginLeft || 0}
                        onChange={(val) => updateStyle('marginLeft', val)}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
                <PropertyRow label="Margin Right">
                    <PropertySlider
                        value={marginRight || 0}
                        onChange={(val) => updateStyle('marginRight', val)}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
                <PropertyRow label="Padding Top">
                    <PropertySlider
                        value={paddingTop || 0}
                        onChange={(val) => updateStyle('paddingTop', val)}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
                <PropertyRow label="Padding Bottom">
                    <PropertySlider
                        value={paddingBottom || 0}
                        onChange={(val) => updateStyle('paddingBottom', val)}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
                <PropertyRow label="Padding Left">
                    <PropertySlider
                        value={paddingLeft || 0}
                        onChange={(val) => updateStyle('paddingLeft', val)}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
                <PropertyRow label="Padding Right">
                    <PropertySlider
                        value={paddingRight || 0}
                        onChange={(val) => updateStyle('paddingRight', val)}
                        min={0}
                        max={100}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}
