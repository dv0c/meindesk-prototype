import React from "react"
import { useNode } from "@craftjs/core"
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"
import {
    PropertySection,
    PropertyRow,
    PropertyInput,
    PropertySelect,
    PropertySlider,
    PropertyColor,
    PropertyIconButtonGroup,
} from "../components/PropertySection"

export const HeadingSettings = () => {
    const {
        actions: { setProp },
        text,
        level,
        fontSize,
        fontWeight,
        textAlign,
        color,
        marginTop,
        marginBottom,
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
    } = useNode((node) => ({
        text: node.data.props.text,
        level: node.data.props.level,
        fontSize: node.data.props.style?.fontSize ?? node.data.props.fontSize,
        fontWeight: node.data.props.style?.fontWeight ?? node.data.props.fontWeight,
        textAlign: node.data.props.style?.textAlign ?? node.data.props.textAlign,
        color: node.data.props.style?.color ?? node.data.props.color,
        marginTop: node.data.props.style?.marginTop ?? node.data.props.marginTop,
        marginBottom: node.data.props.style?.marginBottom ?? node.data.props.marginBottom,
        paddingTop: node.data.props.style?.paddingTop ?? node.data.props.paddingTop,
        paddingBottom: node.data.props.style?.paddingBottom ?? node.data.props.paddingBottom,
        paddingLeft: node.data.props.style?.paddingLeft ?? node.data.props.paddingLeft,
        paddingRight: node.data.props.style?.paddingRight ?? node.data.props.paddingRight,
    }))

    const updateStyle = (key: string, value: any) => {
        setProp((props: any) => {
            if (!props.style) props.style = {}
            props.style[key] = value
            if (props[key] !== undefined) delete props[key]
        })
    }

    return (
        <div>
            <PropertySection title="Typography">
                <PropertyRow label="Text">
                    <div className="flex flex-col gap-2">
                        <PropertyInput
                            value={text || ""}
                            onChange={(val) => setProp((props: any) => (props.text = val))}
                        />
                        <div className="text-[10px] text-muted-foreground">
                            Tip: Use <code>{`{field_name}`}</code> to bind data
                        </div>
                    </div>
                </PropertyRow>
                <PropertyRow label="Level">
                    <PropertySelect
                        value={level || "h2"}
                        onChange={(val) => setProp((props: any) => (props.level = val as any))}
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
                <PropertyRow label="Font Size">
                    <PropertySlider
                        value={fontSize || 32}
                        onChange={(val) => updateStyle('fontSize', val)}
                        min={12}
                        max={120}
                    />
                </PropertyRow>
                <PropertyRow label="Font Weight">
                    <PropertySelect
                        value={fontWeight || "700"}
                        onChange={(val) => updateStyle('fontWeight', val)}
                        options={[
                            { label: "Regular", value: "400" },
                            { label: "Medium", value: "500" },
                            { label: "Semibold", value: "600" },
                            { label: "Bold", value: "700" },
                            { label: "Extra Bold", value: "800" },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Alignment">
                    <PropertyIconButtonGroup
                        value={textAlign || "left"}
                        onChange={(val) => updateStyle('textAlign', val)}
                        options={[
                            { label: "Left", value: "left", icon: AlignLeft },
                            { label: "Center", value: "center", icon: AlignCenter },
                            { label: "Right", value: "right", icon: AlignRight },
                            { label: "Justify", value: "justify", icon: AlignJustify },
                        ]}
                    />
                </PropertyRow>
                <PropertyRow label="Color">
                    <PropertyColor
                        value={color}
                        onChange={(val) => updateStyle('color', val)}
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
