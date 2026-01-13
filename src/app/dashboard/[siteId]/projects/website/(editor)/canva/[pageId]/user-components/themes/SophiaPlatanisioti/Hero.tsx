"use client"

import { useNode, useEditor } from "@craftjs/core"
import React, { useMemo } from "react"

import { useEditorContent } from "@/hooks/useEditorContent"
import { cn } from "@/lib/utils"
import { CraftComponentProps, propsToStyle, withCraftComponent, EditableText, EditableImage } from "../../../lib/withCraftComponent"

interface HeroProps extends CraftComponentProps {
    content?: string
    thumbnail?: string
    heading1?: string
    heading2?: string
    containerPadding?: string
    containerMargin?: string
    contentFont?: string
}

const HeroBase = React.forwardRef<HTMLDivElement, HeroProps>(({
    content = "<p>Start writing your content here...</p>",
    thumbnail = "",
    heading1 = "Heading 1",
    heading2 = "Heading 2",
    contentFont = "font-sans",
    ...props
}, ref) => {
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))
    const htmlContent = useEditorContent(content)
    const style = propsToStyle(props)


    return (
        <div
            ref={ref}
            className={cn("w-full p-5 transition-colors", props.className)}
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
})

HeroBase.displayName = "HeroBase"

export const Hero = withCraftComponent(HeroBase, {
    displayName: 'Hero',
    defaultProps: {
        content: '<p>Welcome to our story. This is a place to share your journey.</p>',
        thumbnail: 'https://images.unsplash.com/photo-1544967082-d9d3f02b1bd0?q=80&w=800',
        heading1: 'The First Chapter',
        heading2: 'A New Beginning',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        contentFont: 'font-sans',
    },
    settingsConfig: {
        contentFont: {
            label: 'Content Font',
            type: 'select',
            options: [
                { label: 'Sans', value: 'font-sans' },
                { label: 'Serif', value: 'font-serif' },
            ],
        },
        content: {
            label: 'Content',
            type: 'richtext',
        },
        thumbnail: {
            label: 'Thumbnail Image',
            type: 'media'
        },
        heading1: { label: 'Top Heading', type: 'text' },
        heading2: { label: 'Bottom Heading', type: 'text' },
    },
    sectionTitle: 'Hero Settings'
})
