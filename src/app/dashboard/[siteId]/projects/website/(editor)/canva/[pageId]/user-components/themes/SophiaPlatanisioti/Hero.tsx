"use client"

import React from "react"
import { useEditor, useNode } from "@craftjs/core"
import { defineBlock, useBlockStyles, BlockStyle } from "@/lib/block-api"
import { useEditorContent } from "@/hooks/useEditorContent"
import { cn } from "@/lib/utils"
import { EditableText, EditableImage } from "@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/lib/withCraftComponent"
import { LayoutTemplate } from "lucide-react"
import {
    PropertySection,
    PropertyRow,
    PropertyInput,
    PropertySelect,
    PropertyTextArea,
    PropertySlider
} from "../../../components/PropertySection"

export interface HeroProps {
    content?: string
    thumbnail?: string
    heading1?: string
    heading2?: string
    contentFont?: string
    paddingTop?: number
    paddingBottom?: number
    paddingLeft?: number
    paddingRight?: number
    className?: string
}

const defaultProps: HeroProps = {
    content: '<p>Welcome to our story. This is a place to share your journey.</p>',
    thumbnail: 'https://images.unsplash.com/photo-1544967082-d9d3f02b1bd0?q=80&w=800',
    heading1: 'The First Chapter',
    heading2: 'A New Beginning',
    contentFont: 'font-sans',
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 20,
    paddingRight: 20
}

const HeroSettings = () => {
    const {
        actions: { setProp },
        content,
        thumbnail,
        heading1,
        heading2,
        contentFont,
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight
    } = useNode((node) => ({
        content: node.data.props.content,
        thumbnail: node.data.props.thumbnail,
        heading1: node.data.props.heading1,
        heading2: node.data.props.heading2,
        contentFont: node.data.props.contentFont,
        paddingTop: node.data.props.paddingTop,
        paddingBottom: node.data.props.paddingBottom,
        paddingLeft: node.data.props.paddingLeft,
        paddingRight: node.data.props.paddingRight
    }))

    return (
        <div className="space-y-4 pt-2">
            <PropertySection title="Layout & Spacing" defaultOpen={true}>
                <PropertyRow label="Padding Top">
                    <PropertySlider
                        value={paddingTop || 0}
                        min={0}
                        max={200}
                        onChange={(val) => setProp((props: any) => props.paddingTop = val)}
                    />
                </PropertyRow>
                <PropertyRow label="Padding Bottom">
                    <PropertySlider
                        value={paddingBottom || 0}
                        min={0}
                        max={200}
                        onChange={(val) => setProp((props: any) => props.paddingBottom = val)}
                    />
                </PropertyRow>
                <PropertyRow label="Padding Left">
                    <PropertySlider
                        value={paddingLeft || 0}
                        min={0}
                        max={200}
                        onChange={(val) => setProp((props: any) => props.paddingLeft = val)}
                    />
                </PropertyRow>
                <PropertyRow label="Padding Right">
                    <PropertySlider
                        value={paddingRight || 0}
                        min={0}
                        max={200}
                        onChange={(val) => setProp((props: any) => props.paddingRight = val)}
                    />
                </PropertyRow>
            </PropertySection>

            <PropertySection title="Content" defaultOpen={true}>
                <PropertyRow label="Top Heading">
                    <PropertyInput
                        value={heading1 || ""}
                        onChange={(val) => setProp((props: any) => props.heading1 = val)}
                    />
                </PropertyRow>
                <PropertyRow label="Bottom Heading">
                    <PropertyInput
                        value={heading2 || ""}
                        onChange={(val) => setProp((props: any) => props.heading2 = val)}
                    />
                </PropertyRow>
                <PropertyRow label="Thumbnail URL">
                    <PropertyInput
                        value={thumbnail || ""}
                        onChange={(val) => setProp((props: any) => props.thumbnail = val)}
                    />
                </PropertyRow>
                <PropertyRow label="Content Font">
                    <PropertySelect
                        value={contentFont || 'font-sans'}
                        options={[
                            { label: 'Sans', value: 'font-sans' },
                            { label: 'Serif', value: 'font-serif' },
                        ]}
                        onChange={(val) => setProp((props: any) => props.contentFont = val)}
                    />
                </PropertyRow>
                <PropertyRow label="Body Content">
                    <PropertyTextArea
                        value={content || ""}
                        onChange={(val) => setProp((props: any) => props.content = val)}
                        rows={5}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

export const Hero = defineBlock<HeroProps>({
    name: "Hero",
    category: "Sophia Platanisioti", // Group under theme name
    icon: <LayoutTemplate className="w-4 h-4" />,
    description: "Theme Hero Section",
    defaultProps,
    settings: HeroSettings,
    childrenAllowed: true,

    render: ({
        content = defaultProps.content,
        thumbnail = defaultProps.thumbnail,
        heading1 = defaultProps.heading1,
        heading2 = defaultProps.heading2,
        contentFont = defaultProps.contentFont,
        paddingTop = defaultProps.paddingTop,
        paddingBottom = defaultProps.paddingBottom,
        paddingLeft = defaultProps.paddingLeft,
        paddingRight = defaultProps.paddingRight,
        className
    }) => {
        const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))
        const htmlContent = useEditorContent(content)

        // Construct style object from individual props
        const style: React.CSSProperties = {
            paddingTop: paddingTop,
            paddingBottom: paddingBottom,
            paddingLeft: paddingLeft,
            paddingRight: paddingRight,
        }

        return (
            <div
                className={cn("w-full transition-colors", className)}
                style={style}
            >
                <div className="max-w-210 mx-auto">
                    <div className="text-[18px] space-y-5 text-muted-foreground">
                        {thumbnail && (
                            <EditableImage
                                propName="thumbnail"
                                src={thumbnail}
                                alt="Hero Image"
                                width={380}
                                height={460}
                                className="float-left mr-8 mb-5 object-cover max-w-full sm:max-w-[380px]"
                            />
                        )}

                        {htmlContent && (
                            <div
                                className={cn(`prose-sm ${contentFont} homepage prose-p:pt-0 prose-p:leading-snug max-w-full text-muted-foreground prose-headings:text-primary prose-a:text-primary`)}
                                dangerouslySetInnerHTML={{ __html: htmlContent }}
                            />
                        )}

                        {(heading1 || heading2) && (
                            <div className="clear-both pt-8">
                                <hr className="border-black/30 mb-10" />
                                <div className="text-center space-y-3 pb-20">
                                    {heading1 && (
                                        <EditableText
                                            propName="heading1"
                                            value={heading1}
                                            as="h2"
                                            className="text-[var(--design-text-heading,#7f2e2d)] text-[120%] font-serif font-bold"
                                        />
                                    )}
                                    {heading2 && (
                                        <EditableText
                                            propName="heading2"
                                            value={heading2}
                                            as="h2"
                                            className="text-[var(--design-text-heading,#7f2e2d)] text-[120%] font-serif font-bold"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }
})
