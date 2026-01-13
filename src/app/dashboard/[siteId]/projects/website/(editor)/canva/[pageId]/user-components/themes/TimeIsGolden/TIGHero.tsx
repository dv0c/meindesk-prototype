"use client"

import { Element, useNode } from "@craftjs/core"
import { Container } from "../../Container"
import { Heading } from "../../Heading"
import { Search } from "../../Search"
import { Text } from "../../Text"
import { PropertyRow, PropertySection } from "../../../components/PropertySection"

export const TIGHero = ({ ...props }) => {
    const { connectors: { connect, drag } } = useNode()

    return (
        <div ref={(ref: any) => connect(drag(ref))} className="w-full">
            <Element
                is={Container}
                id="tig-hero-container"
                width="100%"
                padding={80}
                backgroundColor="#f8f9fa" // Light gray/off-white
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                canvas
            >
                <Element
                    is={Container}
                    id="tig-hero-content"
                    width="100%"
                    maxWidth="800px"
                    padding={0}
                    key="hero-content"
                    backgroundColor="transparent"
                    flexDirection="column"
                    alignItems="center"
                    gap={24}
                    canvas
                >
                    <Heading
                        level="h1"
                        text="Time is Golden"
                        fontSize={64}
                        textAlign="center"
                        fontFamily="serif" // Assuming global serif font or we rely on className
                        className="font-serif tracking-tight"
                    />

                    <Text
                        text="Discover stories, collections, and ideas that matter."
                        fontSize={20}
                        textAlign="center"
                        color="var(--design-text-body, #6b7280)"
                    />

                    <Element
                        is={Container}
                        id="tig-hero-search-wrapper"
                        width="100%"
                        maxWidth="500px"
                        marginTop={20}
                        backgroundColor="transparent"
                        key="search-wrapper"
                        canvas
                    >
                        <Search
                            width="100%"
                            placeholder="Search everything..."
                            overlayTheme="minimal"
                            borderRadius={50}
                            padding={16}
                        />
                    </Element>
                </Element>
            </Element>
        </div>
    )
}

export const TIGHeroSettings = () => {
    return (
        <PropertySection title="Hero">
            <PropertyRow label="Note">
                <span className="text-xs text-muted-foreground">This is a composite block. Edit inner elements directly.</span>
            </PropertyRow>
        </PropertySection>
    )
}

TIGHero.craft = {
    displayName: "TIG Hero",
    category: "Time is Golden",
    props: {},
    settings: TIGHeroSettings
}
