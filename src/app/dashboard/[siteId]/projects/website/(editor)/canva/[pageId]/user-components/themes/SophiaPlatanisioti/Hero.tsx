"use client"

import React from "react"
import { useEditor, useNode } from "@craftjs/core"
import { defineBlock } from "@/lib/block-api"
import { cn } from "@/lib/utils"
import { EditableText, EditableImage } from "@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/lib/withCraftComponent"
import { LayoutTemplate } from "lucide-react"
import {
    PropertySection,
    PropertyRow,
    PropertyInput,
    PropertyTextArea,
    PropertySlider
} from "../../../components/PropertySection"

export interface HeroProps {
    headline?: string
    subtext?: string
    buttonText?: string
    image1?: string
    image2?: string
    image3?: string
    image4?: string
    paddingTop?: number
    paddingBottom?: number
    className?: string
}

const defaultProps: HeroProps = {
    headline: "I’m a short heading for this section.",
    subtext: "Nam commodo suscipit quam. Fusce ac felis sit amet ligula pharetra condimentum.",
    buttonText: "Button Text",
    image1: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80",
    image2: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    image3: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    image4: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
    paddingTop: 80,
    paddingBottom: 80,
}

const HeroSettings = () => {
    const {
        actions: { setProp },
        headline,
        subtext,
        buttonText,
        image1,
        image2,
        image3,
        image4,
        paddingTop,
        paddingBottom,
    } = useNode((node) => ({
        headline: node.data.props.headline,
        subtext: node.data.props.subtext,
        buttonText: node.data.props.buttonText,
        image1: node.data.props.image1,
        image2: node.data.props.image2,
        image3: node.data.props.image3,
        image4: node.data.props.image4,
        paddingTop: node.data.props.paddingTop,
        paddingBottom: node.data.props.paddingBottom,
    }))

    return (
        <div className="space-y-4 pt-2">
            <PropertySection title="Spacing" defaultOpen={true}>
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
            </PropertySection>

            <PropertySection title="Content" defaultOpen={true}>
                <PropertyRow label="Button Text">
                    <PropertyInput
                        value={buttonText || ""}
                        onChange={(val) => setProp((props: any) => props.buttonText = val)}
                    />
                </PropertyRow>
                <PropertyRow label="Image 1">
                    <PropertyInput
                        value={image1 || ""}
                        onChange={(val) => setProp((props: any) => props.image1 = val)}
                    />
                </PropertyRow>
                <PropertyRow label="Image 2">
                    <PropertyInput
                        value={image2 || ""}
                        onChange={(val) => setProp((props: any) => props.image2 = val)}
                    />
                </PropertyRow>
                <PropertyRow label="Image 3">
                    <PropertyInput
                        value={image3 || ""}
                        onChange={(val) => setProp((props: any) => props.image3 = val)}
                    />
                </PropertyRow>
                <PropertyRow label="Image 4">
                    <PropertyInput
                        value={image4 || ""}
                        onChange={(val) => setProp((props: any) => props.image4 = val)}
                    />
                </PropertyRow>
            </PropertySection>
        </div>
    )
}

export const Hero = defineBlock<HeroProps>({
    name: "Hero",
    category: "Sophia Platanisioti",
    icon: <LayoutTemplate className="w-4 h-4" />,
    description: "Masonry Layout Hero",
    defaultProps,
    settings: HeroSettings,
    render: ({
        headline = defaultProps.headline,
        subtext = defaultProps.subtext,
        buttonText = defaultProps.buttonText,
        image1 = defaultProps.image1,
        image2 = defaultProps.image2,
        image3 = defaultProps.image3,
        image4 = defaultProps.image4,
        paddingTop = defaultProps.paddingTop,
        paddingBottom = defaultProps.paddingBottom,
        className
    }) => {
        return (
            <div
                className={cn("w-full bg-[#FAF3E0]", className)}
                style={{ paddingTop, paddingBottom }}
            >
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
                        {/* Left Content */}
                        <div className="w-full md:w-1/2 space-y-8">
                            <div className="space-y-6">
                                <EditableText
                                    propName="headline"
                                    value={headline}
                                    as="h1"
                                    className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]"
                                />
                                <EditableText
                                    propName="subtext"
                                    value={subtext}
                                    as="p"
                                    className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-lg"
                                />
                            </div>
                            <div>
                                <EditableText
                                    propName="buttonText"
                                    value={buttonText}
                                    as="button"
                                    className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors inline-block"
                                />
                            </div>
                        </div>

                        {/* Right Masonry Grid */}
                        <div className="w-full md:w-1/2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4 pt-8"> {/* Offset first column */}
                                    {image1 && (
                                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm">
                                            <EditableImage
                                                propName="image1"
                                                src={image1}
                                                alt="Gallery 1"
                                                className="object-cover w-full h-full"
                                                width={400}
                                                height={500}
                                            />
                                        </div>
                                    )}
                                    {image3 && (
                                        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm">
                                            <EditableImage
                                                propName="image3"
                                                src={image3}
                                                alt="Gallery 3"
                                                className="object-cover w-full h-full"
                                                width={400}
                                                height={500}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {image2 && (
                                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
                                            <EditableImage
                                                propName="image2"
                                                src={image2}
                                                alt="Gallery 2"
                                                className="object-cover w-full h-full"
                                                width={400}
                                                height={300}
                                            />
                                        </div>
                                    )}
                                    {image4 && (
                                        <div className="relative aspect-[3/5] rounded-2xl overflow-hidden shadow-sm">
                                            <EditableImage
                                                propName="image4"
                                                src={image4}
                                                alt="Gallery 4"
                                                className="object-cover w-full h-full"
                                                width={400}
                                                height={600}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})
