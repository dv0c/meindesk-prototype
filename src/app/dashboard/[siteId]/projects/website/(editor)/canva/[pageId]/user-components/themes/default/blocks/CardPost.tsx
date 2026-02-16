"use client"

import React from "react"
import { defineBlock, useBlockStyles } from "@/lib/block-api"
import { FileText } from "lucide-react"
import { EditableText, EditableImage } from "../../../../lib/editor-primitives"

export const CardPost = defineBlock({
    name: "Card Post",
    category: "Content",
    icon: <FileText className="w-4 h-4" />,
    defaultProps: {
        title: "Article Title",
        excerpt: "This is a brief summary of the article content. It provides a sneak peek to encourage reading.",
        image: "https://images.unsplash.com/photo-1499750310159-5254f41265aa?q=80&w=800",
        style: {
            backgroundColor: 'var(--theme-surface)',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            display: 'flex',
            flexDirection: 'column',
        }
    },
    render: ({ title, excerpt, image, style, theme, responsive, isEditing, deviceMode }) => {
        const { style: blockStyle, className } = useBlockStyles({ style, responsive, isEditing, deviceMode })

        return (
            <article style={blockStyle} className={className}>
                <div className="relative w-full aspect-video overflow-hidden">
                    <EditableImage
                        propName="image"
                        src={image}
                        alt="Article Cover"
                        className="object-cover w-full h-full transition-transform hover:scale-105"
                    />
                </div>
                <div className="p-6 flex flex-col gap-4">
                    <EditableText
                        propName="title"
                        value={title}
                        as="h3"
                        className="text-xl font-bold text-[var(--theme-text)] leading-tight"
                    />
                    <EditableText
                        propName="excerpt"
                        value={excerpt}
                        as="p"
                        className="text-[var(--theme-muted)] text-sm line-clamp-3"
                    />
                    <button className="self-start text-[var(--theme-accent)] font-medium hover:underline mt-2">
                        Read More →
                    </button>
                </div>
            </article>
        )
    }
})
