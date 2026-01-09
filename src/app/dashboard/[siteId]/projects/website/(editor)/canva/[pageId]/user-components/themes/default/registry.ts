"use client"

// Styles
export { DefaultThemeProvider } from "./styles/theme"
export { Colors } from "./styles/colors"
export { Typography } from "./styles/typography"
export { Spacing } from "./styles/spacing"

// Blocks
import { DefaultHeader } from "./blocks/DefaultHeader"
import { DefaultFooter } from "./blocks/DefaultFooter"
import { Section } from "./blocks/Section"
import { CardPost } from "./blocks/CardPost"
import { ThemeHero } from "./blocks/ThemeHero"

// Layouts
import { HomepageLayout } from "./layouts/Homepage"
import { ArticleLayout } from "./layouts/Article"
import { CollectionLayout } from "./layouts/Collection"

export const DefaultThemeBlocks = {
    DefaultHeader,
    DefaultFooter,
    Section,
    CardPost,
    ThemeHero,
    HomepageLayout,
    ArticleLayout,
    CollectionLayout
}

// Helper to register all blocks at once in the editor
export const registerDefaultTheme = (registry: any) => {
    Object.values(DefaultThemeBlocks).forEach(block => {
        if (block && registry) {
            // Assuming registry is a Map or object, but usually we just return the object
            // to be spread into the resolver.
        }
    })
    return DefaultThemeBlocks
}
