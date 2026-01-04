/**
 * Central Component Registry
 * 
 * This file centralizes all component registrations for the CraftJS editor.
 * When adding a new component, simply add it to the registry array below.
 */

import React from 'react'
import {
    Box,
    Type,
    Heading as HeadingIcon,
    Image as ImageIcon,
    LayoutGrid,
    Minus,
    Square,
    Navigation,
    Link as LinkIcon,
    CreditCard,
    GalleryHorizontal,
    Newspaper,
    FileText,
    User,
    Calendar,
    Tag,
    Database,
} from 'lucide-react'

// Import all components
import { Container, ContainerSettings } from './Container'
import { Heading } from './Heading'
import { Text, TextSettings } from './Text'
import { Button, ButtonSettings } from './Button'
import { Image, ImageSettings } from './Image'
import { Grid, GridSettings } from './Grid'
import { Divider, DividerSettings } from './Divider'
import { Spacer, SpacerSettings } from './Spacer'
import { Navbar } from './Navbar'
import { NavigationLinks, NavigationLinksSettings } from './NavigationLinks'
import { Card } from './ExampleCard'
import { Hero } from './themes/SophiaPlatanisioti/Hero'
import { Footer } from './themes/SophiaPlatanisioti/Footer'
import { Articles } from './Articles'
import { SingleArticle } from './SingleArticle'
import { SophiaArticle } from './themes/SophiaPlatanisioti/SophiaArticle'
import {
    ArticleTitle,
    ArticleCover,

    ArticleContent,
    ArticleAuthor,
    ArticleDate,
    ArticleCategories,
} from './article'
import {
    HeroSection,
    FeaturesGrid,
    PrinciplesSection,
    UpdatesCarousel,
    FooterInfo,
} from './themes/Meindesk'
import { MeindeskContainer } from './themes/Meindesk/MeindeskContainer'
import { CollectionList, CollectionItem, CollectionField, RelatedItems, CollectionContainer } from './collections'
import { Link2 } from 'lucide-react'

/**
 * Component metadata interface
 */
export interface ComponentRegistration {
    name: string
    component: React.ComponentType<any>
    category: string
    description: string
    icon: React.ReactNode
    settings?: React.ComponentType<any>
    isContainer?: boolean
}

/**
 * Central component registry
 * Add new components here!
 */
export const componentRegistry: ComponentRegistration[] = [
    // Layout components
    {
        name: 'Container',
        component: Container,
        category: 'Layout',
        description: 'A container for grouping elements',
        icon: <Box className="h-5 w-5" />,
        settings: ContainerSettings,
        isContainer: true,
    },
    {
        name: 'Grid',
        component: Grid,
        category: 'Layout',
        description: 'A responsive grid layout',
        icon: <LayoutGrid className="h-5 w-5" />,
        settings: GridSettings,
        isContainer: true,
    },
    {
        name: 'Divider',
        component: Divider,
        category: 'Layout',
        description: 'A horizontal divider line',
        icon: <Minus className="h-5 w-5" />,
        settings: DividerSettings,
    },
    {
        name: 'Spacer',
        component: Spacer,
        category: 'Layout',
        description: 'Vertical spacing element',
        icon: <Box className="h-5 w-5" />,
        settings: SpacerSettings,
    },

    // Navigation components
    {
        name: 'Navbar',
        component: Navbar,
        category: 'Sophia Navigation',
        description: 'Sophia Platanisioti Header',
        icon: <Navigation className="h-5 w-5" />,
    },
    {
        name: 'NavigationLinks',
        component: NavigationLinks,
        category: 'Navigation',
        description: 'A list of navigation links',
        icon: <LinkIcon className="h-5 w-5" />,
        settings: NavigationLinksSettings,
    },

    // Typography components
    {
        name: 'Heading',
        component: Heading,
        category: 'Typography',
        description: 'A heading element (h1-h6)',
        icon: <HeadingIcon className="h-5 w-5" />,
    },
    {
        name: 'Text',
        component: Text,
        category: 'Typography',
        description: 'A paragraph of text',
        icon: <Type className="h-5 w-5" />,
        settings: TextSettings,
    },

    // Interactive components
    {
        name: 'Button',
        component: Button,
        category: 'Interactive',
        description: 'A clickable button',
        icon: <Square className="h-5 w-5" />,
        settings: ButtonSettings,
    },

    // Media components
    {
        name: 'Image',
        component: Image,
        category: 'Media',
        description: 'An image element',
        icon: <ImageIcon className="h-5 w-5" />,
        settings: ImageSettings,
    },

    // Content components
    {
        name: 'Card',
        component: Card,
        category: 'Content',
        description: 'A card component with image, title, and description',
        icon: <CreditCard className="h-5 w-5" />,
    },
    {
        name: 'Hero',
        component: Hero,
        category: 'Sophia Content',
        description: 'A rich text hero section with floating image',
        icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
        name: 'Footer',
        component: Footer,
        category: 'Sophia Navigation',
        description: 'Sophia Platanisioti Footer',
        icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
        name: 'Articles',
        component: Articles,
        category: 'Content',
        description: 'Dynamic article list with multiple styles',
        icon: <GalleryHorizontal className="h-5 w-5" />,
    },
    {
        name: 'SingleArticle',
        component: SingleArticle,
        category: 'Content',
        description: 'Single article display with dynamic loading',
        icon: <Type className="h-5 w-5" />,
    },
    {
        name: 'SophiaArticle',
        component: SophiaArticle,
        category: 'Sophia Content',
        description: 'Sophia Platanisioti article theme',
        icon: <Type className="h-5 w-5" />,
    },

    // Article Building Blocks - Modular article components
    {
        name: 'ArticleTitle',
        component: ArticleTitle,
        category: 'Article Blocks',
        description: 'Displays the article title',
        icon: <Newspaper className="h-5 w-5" />,
    },
    {
        name: 'ArticleCover',
        component: ArticleCover,
        category: 'Article Blocks',
        description: 'Displays the article cover image',
        icon: <ImageIcon className="h-5 w-5" />,
    },
    {
        name: 'ArticleContent',
        component: ArticleContent,
        category: 'Article Blocks',
        description: 'Renders the article HTML content',
        icon: <FileText className="h-5 w-5" />,
    },
    {
        name: 'ArticleAuthor',
        component: ArticleAuthor,
        category: 'Article Blocks',
        description: 'Displays article author info',
        icon: <User className="h-5 w-5" />,
    },
    {
        name: 'ArticleDate',
        component: ArticleDate,
        category: 'Article Blocks',
        description: 'Displays article publication date',
        icon: <Calendar className="h-5 w-5" />,
    },
    {
        name: 'ArticleCategories',
        component: ArticleCategories,
        category: 'Article Blocks',
        description: 'Displays article category tags',
        icon: <Tag className="h-5 w-5" />,
    },

    // Meindesk Theme Components
    {
        name: 'HeroSection',
        component: HeroSection,
        category: 'Meindesk Theme',
        description: 'Animated hero section with parallax effect',
        icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
        name: 'MeindeskContainer',
        component: MeindeskContainer,
        isContainer: true,
        category: 'Meindesk Theme',
        description: 'Container with grid and noise background',
        icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
        name: 'FeaturesGrid',
        component: FeaturesGrid,
        category: 'Meindesk Theme',
        description: 'Asymmetric grid of features with hover effects',
        icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
        name: 'PrinciplesSection',
        component: PrinciplesSection,
        category: 'Meindesk Theme',
        description: 'Philosophy section with highlighted text',
        icon: <FileText className="h-5 w-5" />,
    },
    {
        name: 'UpdatesCarousel',
        component: UpdatesCarousel,
        category: 'Meindesk Theme',
        description: 'Draggable carousel with updates/releases',
        icon: <GalleryHorizontal className="h-5 w-5" />,
    },
    {
        name: 'FooterInfo',
        component: FooterInfo,
        category: 'Meindesk Theme',
        description: 'Multi-column footer with links',
        icon: <Navigation className="h-5 w-5" />,
    },

    // Collection Components - Dynamic content from user collections
    {
        name: 'CollectionList',
        component: CollectionList,
        category: 'Collections',
        description: 'Display items from any collection',
        icon: <Database className="h-5 w-5" />,
    },
    {
        name: 'CollectionItem',
        component: CollectionItem,
        category: 'Collections',
        description: 'Display a single collection item',
        icon: <FileText className="h-5 w-5" />,
    },
    {
        name: 'CollectionField',
        component: CollectionField,
        category: 'Collections',
        description: 'Display a single field value',
        icon: <Type className="h-5 w-5" />,
    },
    {
        name: 'RelatedItems',
        component: RelatedItems,
        category: 'Collections',
        description: 'Show items that reference current item',
        icon: <Link2 className="h-5 w-5" />,
    },
    {
        name: 'CollectionContainer',
        component: CollectionContainer,
        category: 'Collections',
        description: 'Data Wrapper for Fields',
        icon: <Box className="h-5 w-5" />,
        isContainer: true,
    },

]

// Component map (name -> component)
export const componentMap = componentRegistry.reduce(
    (acc, item) => {
        acc[item.name] = item.component
        return acc
    },
    {} as Record<string, React.ComponentType<any>>
)

/**
 * Resolver for CraftJS - maps component names to components
 * Directly uses the componentMap without any proxy wrapper
 */
export const resolverWithFallback = componentMap

// Icon map (name -> icon)
export const iconMap = componentRegistry.reduce(
    (acc, item) => {
        acc[item.name] = item.icon
        return acc
    },
    {} as Record<string, React.ReactNode>
)

// Component definitions (for backward compatibility)
export const componentDefinitions = componentRegistry.map((item) => ({
    name: item.name,
    category: item.category,
    description: item.description,
}))


/**
 * Re-export all components for convenience
 */
export {
    Container,
    ContainerSettings,
    Heading,
    Text,
    TextSettings,
    Button,
    ButtonSettings,
    Image,
    ImageSettings,
    Grid,
    GridSettings,
    Divider,
    DividerSettings,
    Spacer,
    SpacerSettings,
    Navbar,
    NavigationLinks,
    NavigationLinksSettings,
    Card,
    Hero,
    // Meindesk Theme Components
    HeroSection,
    FeaturesGrid,
    PrinciplesSection,
    UpdatesCarousel,
    FooterInfo,
    MeindeskContainer,
}
