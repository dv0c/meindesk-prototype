"use client"

import { useNode, Element } from "@craftjs/core"
import { Container } from "../../Container"
import { PropertySection, PropertyRow } from "../../../components/PropertySection"
import React from "react"
import { ArticleProvider } from "../../article/ArticleContext"
import { ArticleTitle } from "../../article/ArticleTitle"
import { ArticleCover } from "../../article/ArticleCover"
import { ArticleContent } from "../../article/ArticleContent"
import { ArticleAuthor } from "../../article/ArticleAuthor"
import { ArticleDate } from "../../article/ArticleDate"
import { ArticleCategories } from "../../article/ArticleCategories"
import { Separator } from "@/components/ui/separator"

export const TIGSingleArticle = ({ ...props }) => {
    const { connectors: { connect, drag } } = useNode()

    return (
        <ArticleProvider>
            <div ref={(ref: any) => connect(drag(ref))} className="w-full">
                {/* Main Article Layout */}
                <Element
                    is={Container}
                    id="tig-article-layout"
                    width="100%"
                    maxWidth="1100px"
                    padding={40}
                    alignItems="flex-start" // Important for sidebar height
                    flexDirection="row" // Desktop row
                    gap={60}
                    className="flex-col lg:flex-row" // Defensive responsive class
                    canvas
                >
                    {/* Left Column: Content (Flex 1) */}
                    <Element
                        is={Container}
                        id="tig-article-main"
                        className="flex-1 w-full"
                        padding={0}
                        gap={32}
                        alignItems="flex-start"
                        canvas
                    >
                        <ArticleCategories />
                        <ArticleTitle textAlign="left" />
                        <ArticleDate />

                        <div className="w-full aspect-[2/1] relative overflow-hidden rounded-md my-4">
                            <ArticleCover className="object-cover w-full h-full" />
                        </div>

                        <ArticleContent />
                    </Element>

                    {/* Right Column: Sidebar (Width 300px or similar) */}
                    <Element
                        is={Container}
                        id="tig-article-sidebar"
                        width="300px"
                        className="w-full lg:w-[300px] shrink-0"
                        padding={24}
                        backgroundColor="#f9f9f9"
                        borderRadius={8}
                        gap={24}
                        canvas
                    >
                        <div className="font-serif font-bold text-lg border-b pb-2 mb-2 w-full">Author</div>
                        <ArticleAuthor />

                        <div className="h-px bg-border w-full my-2" />

                        <div className="font-serif font-bold text-lg border-b pb-2 mb-2 w-full">Share</div>
                        {/* Placeholder for share buttons */}
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-black/10" />
                            <div className="w-8 h-8 rounded-full bg-black/10" />
                            <div className="w-8 h-8 rounded-full bg-black/10" />
                        </div>

                        {/* Can add TIGArticleGrid here later if needed, but keeping it simple */}
                    </Element>
                </Element>
            </div>
        </ArticleProvider>
    )
}

export const TIGSingleArticleSettings = () => {
    return (
        <PropertySection title="Single Article">
            <PropertyRow label="Note">
                <span className="text-xs text-muted-foreground">This block automatically loads article content based on the URL.</span>
            </PropertyRow>
        </PropertySection>
    )
}

TIGSingleArticle.craft = {
    displayName: "TIG Single Article",
    category: "Time is Golden",
    props: {},
    settings: TIGSingleArticleSettings
}
