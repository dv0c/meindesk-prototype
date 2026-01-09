import React from "react"
import { useNode } from "@craftjs/core"
import {
    PropertySection,
    PropertyRow,
    PropertyInput,
    PropertySlider,
    PropertySliderWithUnit,
    PropertyColor,
    PropertySelect,
    PropertyBoxModel,
    PropertyShadowSelect,
    PropertyIconButtonGroup,
    PropertyButtonGroup
} from "@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/PropertySection"
import {
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    ArrowRight, ArrowDown, ArrowUp, ArrowLeft,
    LayoutGrid, Box, Type, MousePointer2
} from "lucide-react"

export const UniversalStyleTab = () => {
    const {
        actions: { setProp },
        style = {}
    } = useNode((node) => ({
        style: node.data.props.style || {}
    }))

    const setStyle = (key: string, value: any) => {
        setProp((props: any) => {
            if (!props.style) props.style = {}
            props.style[key] = value
        })
    }

    // Helper for box model (margin/padding)
    const updateSpacing = (type: 'margin' | 'padding', side: string, value: string) => {
        setStyle(`${type}${side.charAt(0).toUpperCase() + side.slice(1)}`, value)
    }

    const {
        marginTop, marginRight, marginBottom, marginLeft,
        paddingTop, paddingRight, paddingBottom, paddingLeft,
        width, height, maxWidth, minHeight,
        display, flexDirection, alignItems, justifyContent, gap,
        backgroundColor, borderRadius, borderWidth, borderColor, boxShadow,
        opacity, position, zIndex
    } = style

    return (
        <div className="space-y-4">
            {/* Dimensions */}
            <PropertySection title="Dimensions" summary={`${width || 'Auto'} x ${height || 'Auto'}`}>
                <PropertyRow label="Width">
                    <PropertyInput
                        value={width || ""}
                        onChange={(v) => setStyle('width', v)}
                        placeholder="auto, 100%, 50px"
                    />
                </PropertyRow>
                <PropertyRow label="Height">
                    <PropertyInput
                        value={height || ""}
                        onChange={(v) => setStyle('height', v)}
                        placeholder="auto, 100%, 500px"
                    />
                </PropertyRow>
                <div className="grid grid-cols-2 gap-2">
                    <PropertyRow label="Max Width">
                        <PropertyInput
                            value={maxWidth || ""}
                            onChange={(v) => setStyle('maxWidth', v)}
                            placeholder="none"
                        />
                    </PropertyRow>
                    <PropertyRow label="Min Height">
                        <PropertyInput
                            value={minHeight || ""}
                            onChange={(v) => setStyle('minHeight', v)}
                            placeholder="0px"
                        />
                    </PropertyRow>
                </div>
            </PropertySection>

            {/* Layout */}
            <PropertySection title="Layout" summary={display === 'flex' ? 'Flexbox' : display === 'grid' ? 'Grid' : 'Block'}>
                <PropertyRow label="Display">
                    <PropertySelect
                        value={display || "block"}
                        onChange={(v) => setStyle('display', v)}
                        options={[
                            { label: "Block", value: "block" },
                            { label: "Flex", value: "flex" },
                            { label: "Grid", value: "grid" },
                            { label: "Inline", value: "inline-block" },
                            { label: "None", value: "none" },
                        ]}
                    />
                </PropertyRow>

                {display === 'flex' && (
                    <>
                        <PropertyRow label="Direction">
                            <PropertyIconButtonGroup
                                value={flexDirection || "row"}
                                onChange={(v) => setStyle('flexDirection', v)}
                                options={[
                                    { label: "Row", value: "row", icon: ArrowRight },
                                    { label: "Column", value: "column", icon: ArrowDown },
                                    { label: "Row Rev", value: "row-reverse", icon: ArrowLeft },
                                    { label: "Col Rev", value: "column-reverse", icon: ArrowUp },
                                ]}
                            />
                        </PropertyRow>
                        <PropertyRow label="Align Items">
                            <PropertyIconButtonGroup
                                value={alignItems || "stretch"}
                                onChange={(v) => setStyle('alignItems', v)}
                                options={[
                                    { label: "Start", value: "flex-start", icon: AlignLeft },
                                    { label: "Center", value: "center", icon: AlignCenter },
                                    { label: "End", value: "flex-end", icon: AlignRight },
                                    { label: "Stretch", value: "stretch", icon: AlignJustify },
                                ]}
                            />
                        </PropertyRow>
                        <PropertyRow label="Justify Content">
                            <PropertyIconButtonGroup
                                value={justifyContent || "flex-start"}
                                onChange={(v) => setStyle('justifyContent', v)}
                                options={[
                                    { label: "Start", value: "flex-start", icon: AlignLeft },
                                    { label: "Center", value: "center", icon: AlignCenter },
                                    { label: "End", value: "flex-end", icon: AlignRight },
                                    { label: "Between", value: "space-between", icon: AlignJustify },
                                ]}
                            />
                        </PropertyRow>
                        <PropertyRow label="Gap">
                            <PropertySlider
                                value={parseInt(gap) || 0}
                                onChange={(v) => setStyle('gap', v)}
                                max={100}
                            />
                        </PropertyRow>
                    </>
                )}
            </PropertySection>

            {/* Spacing (Box Model) */}
            <PropertySection title="Spacing" summary="Margin & Padding">
                <PropertyBoxModel
                    margin={{
                        top: marginTop || 0,
                        right: marginRight || 0,
                        bottom: marginBottom || 0,
                        left: marginLeft || 0,
                    }}
                    padding={{
                        top: paddingTop || 0,
                        right: paddingRight || 0,
                        bottom: paddingBottom || 0,
                        left: paddingLeft || 0,
                    }}
                    onChangeMargin={(side, val) => updateSpacing('margin', side, val)}
                    onChangePadding={(side, val) => updateSpacing('padding', side, val)}
                />
            </PropertySection>

            {/* Decoration */}
            <PropertySection title="Decoration" defaultOpen={false}>
                <PropertyRow label="Background">
                    <PropertyColor
                        value={backgroundColor || ""}
                        onChange={(v) => setStyle('backgroundColor', v)}
                    />
                </PropertyRow>
                <PropertyRow label="Border Radius">
                    <PropertySlider
                        value={parseInt(borderRadius) || 0}
                        onChange={(v) => setStyle('borderRadius', v)}
                        max={100}
                    />
                </PropertyRow>
                <div className="grid grid-cols-2 gap-2">
                    <PropertyRow label="Border Width">
                        <PropertySlider
                            value={parseInt(borderWidth) || 0}
                            onChange={(v) => setStyle('borderWidth', v)}
                            max={20}
                        />
                    </PropertyRow>
                    <PropertyRow label="Border Color">
                        <PropertyColor
                            value={borderColor || ""}
                            onChange={(v) => setStyle('borderColor', v)}
                        />
                    </PropertyRow>
                </div>
                <PropertyRow label="Shadow">
                    <PropertyShadowSelect
                        value={boxShadow || "none"}
                        onChange={(v) => setStyle('boxShadow', v)}
                    />
                </PropertyRow>
                <PropertyRow label="Opacity">
                    <PropertySlider
                        value={opacity !== undefined ? opacity * 100 : 100}
                        onChange={(v) => setStyle('opacity', v / 100)}
                        max={100}
                        unit="%"
                    />
                </PropertyRow>
            </PropertySection>

            {/* Position */}
            <PropertySection title="Position" defaultOpen={false}>
                <PropertyRow label="Type">
                    <PropertySelect
                        value={position || "static"}
                        onChange={(v) => setStyle('position', v)}
                        options={[
                            { label: "Static", value: "static" },
                            { label: "Relative", value: "relative" },
                            { label: "Absolute", value: "absolute" },
                            { label: "Fixed", value: "fixed" },
                            { label: "Sticky", value: "sticky" },
                        ]}
                    />
                </PropertyRow>
                {position && position !== 'static' && (
                    <div className="grid grid-cols-2 gap-2">
                        <PropertyRow label="Top">
                            <PropertyInput value={style.top || ""} onChange={(v) => setStyle('top', v)} />
                        </PropertyRow>
                        <PropertyRow label="Right">
                            <PropertyInput value={style.right || ""} onChange={(v) => setStyle('right', v)} />
                        </PropertyRow>
                        <PropertyRow label="Bottom">
                            <PropertyInput value={style.bottom || ""} onChange={(v) => setStyle('bottom', v)} />
                        </PropertyRow>
                        <PropertyRow label="Left">
                            <PropertyInput value={style.left || ""} onChange={(v) => setStyle('left', v)} />
                        </PropertyRow>
                        <PropertyRow label="Z-Index">
                            <PropertyInput type="number" value={zIndex || ""} onChange={(v) => setStyle('zIndex', parseInt(v))} />
                        </PropertyRow>
                    </div>
                )}
            </PropertySection>
        </div>
    )
}
