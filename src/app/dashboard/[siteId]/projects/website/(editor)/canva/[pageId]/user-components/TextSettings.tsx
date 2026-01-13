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
    PropertyBoxModel, // Added import
    PropertySliderWithUnit
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
        width,
        height,
        maxWidth,
        maxHeight,
        minHeight,
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
        width: node.data.props.style?.width ?? node.data.props.width,
        height: node.data.props.style?.height ?? node.data.props.height,
        maxWidth: node.data.props.style?.maxWidth ?? node.data.props.maxWidth,
        maxHeight: node.data.props.style?.maxHeight ?? node.data.props.maxHeight,
        minHeight: node.data.props.style?.minHeight ?? node.data.props.minHeight,
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
                <PropertyBoxModel
                    margin={{
                        top: marginTop || 0,
                        right: marginRight || 0,
                        bottom: marginBottom || 0,
                        left: marginLeft || 0
                    }}
                    padding={{
                        top: paddingTop || 0,
                        right: paddingRight || 0,
                        bottom: paddingBottom || 0,
                        left: paddingLeft || 0
                    }}
                    onChangeMargin={(side, value) => updateStyle(`margin${side.charAt(0).toUpperCase() + side.slice(1)}`, parseInt(value) || 0)}
                    onChangePadding={(side, value) => updateStyle(`padding${side.charAt(0).toUpperCase() + side.slice(1)}`, parseInt(value) || 0)}
                />
            </PropertySection>

            <PropertySection title="Dimensions" defaultOpen={false}>
                <PropertyRow label="Width">
                    <PropertySliderWithUnit
                        value={parseInt(width) || 0}
                        unit={width?.toString().replace(/[0-9.]/g, '') || 'percent'}
                        onChange={(val, unit) => updateStyle('width', `${val}${unit}`)}
                        min={0}
                        max={100}
                        units={['px', '%', 'vw', 'rem', 'auto']}
                    />
                </PropertyRow>
                <PropertyRow label="Height">
                    <PropertySliderWithUnit
                        value={parseInt(height) || 0}
                        unit={height?.toString().replace(/[0-9.]/g, '') || 'auto'}
                        onChange={(val, unit) => updateStyle('height', `${val}${unit}`)}
                        min={0}
                        max={100}
                        units={['px', '%', 'vh', 'rem', 'auto']}
                    />
                </PropertyRow>
                <PropertyRow label="Min Height">
                    <PropertySliderWithUnit
                        value={parseInt(minHeight) || 0}
                        unit={minHeight?.toString().replace(/[0-9.]/g, '') || 'px'}
                        onChange={(val, unit) => updateStyle('minHeight', `${val}${unit}`)}
                        min={0}
                        max={100}
                        units={['px', '%', 'vh', 'rem']}
                    />
                </PropertyRow>
                <PropertyRow label="Max Width">
                    <PropertySliderWithUnit
                        value={parseInt(maxWidth) || 0}
                        unit={maxWidth?.toString().replace(/[0-9.]/g, '') || 'none'}
                        onChange={(val, unit) => updateStyle('maxWidth', `${val}${unit}`)}
                        min={0}
                        max={100}
                        units={['px', '%', 'vw', 'rem', 'none']}
                    />
                </PropertyRow>
                <PropertyRow label="Max Height">
                    <PropertySliderWithUnit
                        value={parseInt(maxHeight) || 0}
                        unit={maxHeight?.toString().replace(/[0-9.]/g, '') || 'none'}
                        onChange={(val, unit) => updateStyle('maxHeight', `${val}${unit}`)}
                        min={0}
                        max={100}
                        units={['px', '%', 'vh', 'rem', 'none']}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}
