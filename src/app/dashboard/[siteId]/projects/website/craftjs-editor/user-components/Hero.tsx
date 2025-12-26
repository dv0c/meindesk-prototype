"use client"

import { useNode } from "@craftjs/core"
import React, { useMemo } from "react"
import { withCraftComponent, CraftComponentProps, propsToStyle } from '../lib/withCraftComponent'

// Simplified version of the hook logic since we can't easily import from outside the isolated editor scope if paths are tricky, 
// but actually we can import from @/hooks/useEditorContent if aliases work. 
// Given the previous file reads, aliases seem to work. Let's try importing.
import { useEditorContent } from "@/hooks/useEditorContent"
import { cn } from "@/lib/utils"

interface HeroProps extends CraftComponentProps {
    content?: string
    thumbnail?: string
    heading1?: string
    heading2?: string
    containerPadding?: string
    containerMargin?: string
}

const HeroBase = React.forwardRef<HTMLDivElement, HeroProps>(({
    content = "<p>Start writing your content here...</p>",
    thumbnail = "",
    heading1 = "Heading 1",
    heading2 = "Heading 2",
    ...props
}, ref) => {
    // Extract HTML using the hook
    const htmlContent = useEditorContent(content)
    const style = propsToStyle(props)

    // Using semantic colors:
    // text-[#5a5933] -> text-muted-foreground (or similar custom semantic class if defined, but using standard for now)
    // text-[#7f2e2d] -> text-primary
    // border-black/30 -> border-border

    return (
        <div
            ref={ref}
            className={cn("w-full transition-colors", props.className)}
            style={style}
        >
            <div className="max-w-[52.5rem] mx-auto">
                <div className="text-[18px] space-y-5 text-muted-foreground">
                    {thumbnail && (
                        <img
                            width={380}
                            height={460}
                            className="float-left mr-8 mb-5 object-cover max-w-full sm:max-w-[380px] rounded-md"
                            alt="Hero Image"
                            src={thumbnail}
                        />
                    )}

                    {htmlContent && (
                        <div
                            className="prose-sm font-sans homepage prose-p:pt-0 prose-p:leading-snug max-w-full text-muted-foreground prose-headings:text-primary prose-a:text-primary"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />
                    )}

                    {(heading1 || heading2) && (
                        <div className="clear-both pt-8">
                            <hr className="border-border mb-10" />
                            <div className="text-center space-y-3 pb-20">
                                {heading1 && (
                                    <h2 className="text-primary text-[120%] font-serif font-bold">
                                        {heading1}
                                    </h2>
                                )}
                                {heading2 && (
                                    <h2 className="text-primary text-[120%] font-serif font-bold">
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
    },
    settingsConfig: {
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
