"use client"

import React from "react"
import { defineBlock } from "@/lib/block-api"
import { Element } from "@craftjs/core"
import { FileText } from "lucide-react"

// Blocks
import { DefaultHeader } from "../blocks/DefaultHeader"
import { DefaultFooter } from "../blocks/DefaultFooter"
import { Section } from "../blocks/Section"
import { ArticleCover } from "../../../article/ArticleCover" // Reuse core
import { EditableText } from "../../../../lib/editor-primitives"

export const ArticleLayout = defineBlock({
    name: "Article Template",
    category: "Layouts",
    icon: <FileText className="w-4 h-4" />,
    defaultProps: {},
    render: ({ theme }) => {
        return (
            <div className="min-h-screen bg-[var(--theme-background)]">
                <Element id="header" is={DefaultHeader} canvas />

                <Element id="article-cover" is={ArticleCover} canvas />

                <Element id="article-content" is={Section} canvas>
                    {/* Placeholder content */}
                    <div className="prose lg:prose-xl mx-auto text-[var(--theme-text)]">
                        <EditableText
                            propName="content"
                            value="Start writing your article here..."
                            as="p"
                        />
                    </div>
                </Element>

                <Element id="footer" is={DefaultFooter} canvas />
            </div>
        )
    }
})
