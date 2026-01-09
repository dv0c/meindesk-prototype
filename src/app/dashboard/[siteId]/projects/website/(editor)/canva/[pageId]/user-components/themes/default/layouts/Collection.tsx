"use client"

import React from "react"
import { defineBlock } from "@/lib/block-api"
import { Element } from "@craftjs/core"
import { Layers } from "lucide-react"

// Blocks
import { DefaultHeader } from "../blocks/DefaultHeader"
import { DefaultFooter } from "../blocks/DefaultFooter"
import { Section } from "../blocks/Section"
import { CollectionContainer } from "../../../collections/CollectionContainer" // Reuse core

export const CollectionLayout = defineBlock({
    name: "Collection Template",
    category: "Layouts",
    icon: <Layers className="w-4 h-4" />,
    defaultProps: {},
    render: ({ theme }) => {
        return (
            <div className="min-h-screen bg-[var(--theme-background)]">
                <Element id="header" is={DefaultHeader} canvas />

                {/* Collection Header Section */}
                <Element id="collection-header" is={Section} canvas>
                    <h1 className="text-4xl font-bold mb-4">Latest Articles</h1>
                </Element>

                {/* Collection List */}
                <Element id="collection-list" is={CollectionContainer} canvas />

                <Element id="footer" is={DefaultFooter} canvas />
            </div>
        )
    }
})
