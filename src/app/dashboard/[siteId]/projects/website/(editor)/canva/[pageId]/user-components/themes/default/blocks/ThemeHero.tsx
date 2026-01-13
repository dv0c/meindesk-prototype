"use client"

import React from "react"
import { defineBlock, useBlockStyles } from "@/lib/block-api"
import { Spacing } from "../styles/spacing"
import { EditableText, EditableImage } from "../../../lib/withCraftComponent"
import { Monitor } from "lucide-react"

export const ThemeHero = defineBlock({
    name: "Theme Hero",
    category: "Theme",
    icon: <Monitor className="w-4 h-4" />,
    defaultProps: {
        title: "Welcome to the Future",
        subtitle: "A modern, clean starting point for your next big project.",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200",
        ctaText: "Get Started",
        style: {
            paddingTop: '6rem',
            paddingBottom: '6rem',
            backgroundColor: 'var(--theme-surface)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            minHeight: '600px',
        }
    },
    render: ({ title, subtitle, image, ctaText, style, theme }) => {
        const { style: blockStyle, className } = useBlockStyles({ style })

        return (
            <section style={blockStyle} className={className}>
                <div className="container mx-auto flex flex-col items-center gap-6 max-w-4xl px-4">
                    <EditableText
                        propName="title"
                        value={title}
                        as="h1"
                        className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--design-text-heading,inherit)]"
                    />
                    <EditableText
                        propName="subtitle"
                        value={subtitle}
                        as="p"
                        className="text-xl md:text-2xl text-[var(--design-text-body,inherit)] max-w-2xl opacity-80"
                    />

                    <button className="px-8 py-4 bg-[var(--theme-primary)] text-[var(--theme-background)] rounded-full font-medium text-lg hover:opacity-90 transition-opacity mt-4">
                        <EditableText propName="ctaText" value={ctaText} as="span" />
                    </button>
                </div>

                {/* Optional: Hero Image below */}
                <div className="w-full max-w-5xl px-4 mt-12">
                    <EditableImage
                        propName="image"
                        src={image}
                        alt="Hero"
                        className="w-full h-auto rounded-xl shadow-2xl"
                    />
                </div>
            </section>
        )
    }
})
