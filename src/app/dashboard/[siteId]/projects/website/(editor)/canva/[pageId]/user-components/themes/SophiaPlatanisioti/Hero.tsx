"use client"

import { useEditorContent } from "@/hooks/useEditorContent"
import { defineBlock } from "@/lib/block-api"
import { cn } from "@/lib/utils"
import { useNode } from "@craftjs/core"
import { LayoutTemplate } from "lucide-react"
import {
    PropertyInput,
    PropertyRichText,
    PropertyRow,
    PropertySection,
    PropertySelect,
    PropertySlider
} from "../../../components/PropertySection"

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface HeroProps {
    content?: string
    thumbnail?: string
    heading1?: string
    heading2?: string
    fontFamily?: string
    className?: string
}

const defaultProps: HeroProps = {
    content: '<p>Welcome to our story. This is a place to share your journey.</p>',
    thumbnail: 'https://images.unsplash.com/photo-1764377849133-635add556929?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    heading1: 'The First Chapter',
    heading2: 'A New Beginning',
    fontFamily: 'font-serif',
}

// -----------------------------------------------------------------------------
// Settings Component
// -----------------------------------------------------------------------------

const HeroSettings = () => {
    const {
        actions: { setProp },
        content,
        thumbnail,
        heading1,
        heading2,
        fontFamily,
    } = useNode((node) => ({
        content: node.data.props.content,
        thumbnail: node.data.props.thumbnail,
        heading1: node.data.props.heading1,
        heading2: node.data.props.heading2,
        fontFamily: node.data.props.fontFamily,
    }))

    return (
        <div className="space-y-4 pt-2">
            <PropertySection title="Typography">
                <PropertyRow label="Font Family">
                    <PropertySelect
                        value={fontFamily || "font-sans"}
                        onChange={(val) => setProp((props: any) => props.fontFamily = val)}
                        options={[
                            { label: 'Serif', value: 'font-serif' },
                            { label: 'Sans', value: 'font-sans' },
                        ]}
                    />
                </PropertyRow>

            </PropertySection>

            <PropertySection title="Content" defaultOpen={true}>

                <PropertyRichText
                    label="Main Content"
                    value={content || ""}
                    onChange={(val) => setProp((props: any) => props.content = val)}
                />

                <PropertyRow label="Thumbnail Image URL">
                    <PropertyInput
                        value={thumbnail || ""}
                        onChange={(val) => setProp((props: any) => props.thumbnail = val)}
                    />
                </PropertyRow>

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
            </PropertySection>
        </div>
    )
}

// -----------------------------------------------------------------------------
// View Component (Shared)
// -----------------------------------------------------------------------------

export const HeroView = ({
    content = defaultProps.content,
    thumbnail = defaultProps.thumbnail,
    heading1 = defaultProps.heading1,
    heading2 = defaultProps.heading2,
    fontFamily = defaultProps.fontFamily,
    className,
}: HeroProps) => {
    const htmlContent = useEditorContent(content)

    return (
        <div className={cn("w-full transition-colors", className)}>
            <div className="max-w-[52.5rem] mx-auto">
                <div
                    className={cn("text-muted-foreground space-y-5", fontFamily)}
                >
                    {thumbnail && (
                        <img
                            width={380}
                            height={460}
                            className="w-full sm:w-auto mb-5 rounded-md object-cover sm:float-left sm:mr-8 sm:max-w-[380px]"
                            alt="Hero Image"
                            src={thumbnail}
                        />
                    )}

                    {htmlContent && (
                        <div
                            className={cn(`prose-sm homepage prose-p:pt-0 prose-p:leading-snug max-w-full text-muted-foreground prose-headings:text-primary prose-a:text-primary`)}
                            style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    )}

                    {(heading1 || heading2) && (
                        <div className="clear-both pt-8">
                            <hr className="border-black/30 mb-10" />
                            <div className="text-center space-y-3 pb-20">
                                {heading1 && (
                                    <h2 className="text-[#7f2e2d] text-[120%] font-serif font-bold">
                                        {heading1}
                                    </h2>
                                )}
                                {heading2 && (
                                    <h2 className="text-[#7f2e2d] text-[120%] font-serif font-bold">
                                        {heading2}
                                    </h2>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// -----------------------------------------------------------------------------
// Craft Component
// -----------------------------------------------------------------------------

export const Hero = defineBlock<HeroProps>({
    name: "Hero",
    category: "Sophia Platanisioti",
    icon: <LayoutTemplate className="w-4 h-4" />,
    description: "About Me section with bio, split layout and quote",
    defaultProps,
    settings: HeroSettings,
    render: HeroView,
})