import React from "react"
import { useNode } from "@craftjs/core"
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react"
import {
    PropertySection,
    PropertyRow,
    PropertySelect,
    PropertySlider,
    PropertyColor,
    PropertyIconButtonGroup,
    PropertyBoxModel,
} from "../../components/PropertySection"

export const ArticleTitleSettings = () => {
    const {
        actions: { setProp },
        fontSize,
        fontWeight,
        textAlign,
        color,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
    } = useNode((node) => ({
        fontSize: node.data.props.style?.fontSize,
        fontWeight: node.data.props.style?.fontWeight,
        textAlign: node.data.props.style?.textAlign,
        color: node.data.props.style?.color,
        marginTop: node.data.props.style?.marginTop,
        marginBottom: node.data.props.style?.marginBottom,
        marginLeft: node.data.props.style?.marginLeft,
        marginRight: node.data.props.style?.marginRight,
        paddingTop: node.data.props.style?.paddingTop,
        paddingBottom: node.data.props.style?.paddingBottom,
        paddingLeft: node.data.props.style?.paddingLeft,
        paddingRight: node.data.props.style?.paddingRight,
    }))

    const updateStyle = (key: string, value: any) => {
        setProp((props: any) => {
            if (!props.blockStyle) props.blockStyle = {}
            props.blockStyle[key] = value
        })
    }

    return (
        <div>
            <PropertySection title="Typography">
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
                        value={textAlign || "center"}
                        onChange={(val) => {
                            // Update both prop (legacy/direct) and style for compatibility
                            setProp((props: any) => props.textAlign = val)
                            updateStyle('textAlign', val)
                        }}
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
        </div>
    )
}
