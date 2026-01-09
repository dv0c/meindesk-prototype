"use client"

import React from "react"
import { defineBlock, useBlockStyles } from "@/lib/block-api"
import { Element } from "@craftjs/core"
import { LayoutTemplate } from "lucide-react"

// Blocks
import { DefaultHeader } from "../blocks/DefaultHeader"
import { DefaultFooter } from "../blocks/DefaultFooter"
import { ThemeHero } from "../blocks/ThemeHero"
import { Section } from "../blocks/Section"
import { CardPost } from "../blocks/CardPost"
import { Container } from "../../../Container"

export const HomepageLayout = defineBlock({
    name: "Homepage Template",
    category: "Layouts",
    icon: <LayoutTemplate className="w-4 h-4" />,
    defaultProps: {},
    render: ({ style, theme }) => {
        // Typically a layout component renders the structure
        // Since we are inside a Canvas, we can use Element to render predefined components?
        // Actually, if I place this block, it renders these children.
        // But if I want them to be independently editable *siblings* of the layout block?
        // Usually templates in Craft are injected as a JSON tree.
        // If I render them here as children of "HomepageLayout", the user has to edit them INSIDE HomepageLayout.
        // That's fine for a "Section-based" editor.

        return (
            <div className="min-h-screen bg-[var(--theme-background)]">
                <Element id="header" is={DefaultHeader} canvas />

                <Element id="hero" is={ThemeHero} canvas />

                <Element id="features-section" is={Section} canvas>
                    {/* Pre-populate with a Grid of Feature Cards (using CardPost style or Generic) */}
                    {/* For simply starter, we assume empty or user drops content */}
                </Element>

                <Element id="footer" is={DefaultFooter} canvas />
            </div>
        )
    }
})
