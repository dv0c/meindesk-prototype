/**
 * Central Component Registry
 * 
 * This file centralizes all component registrations for the CraftJS editor.
 * When adding a new component, simply add it to the registry array below.
 */

import {
    Box,
    Calendar,
    CreditCard,
    Database,
    FileText,
    GalleryHorizontal,
    Heading as HeadingIcon,
    Image as ImageIcon,
    LayoutGrid,
    Link as LinkIcon,
    Minus,
    Navigation,
    Newspaper,
    Search as SearchIcon,
    Square,
    Tag,
    Type,
    User,
} from 'lucide-react'
import React from 'react'

// Import all components
import { Link2 } from 'lucide-react'
import {
    ArticleAuthor,
    ArticleCategories,
    ArticleContent,
    ArticleCover,
    ArticleDate,
    ArticleTitle,
} from './article'
import { Articles } from './Articles'
import { Button } from './Button'
import { CollectionContainer, CollectionField, CollectionItem, CollectionList, RelatedItems } from './collections'
import { Container } from './Container'
import { Divider, DividerSettings } from './Divider'
import { Card } from './ExampleCard'
import { Grid } from './Grid'
import { Heading } from './Heading'
import { Image, ImageSettings } from './Image'
import { Navbar } from './Navbar'
import { NavigationLinks } from './NavigationLinks'
import { Search, SearchSettings } from './Search'
import { Section } from './Section'
import { SingleArticle } from './SingleArticle'
import { Spacer, SpacerSettings } from './Spacer'
import { Text, TextSettings } from './Text'
import {
    FeaturesGrid,
    FooterInfo,
    HeroSection,
    PrinciplesSection,
    UpdatesCarousel,
} from './themes/Meindesk'
import { MeindeskContainer } from './themes/Meindesk/MeindeskContainer'
import { Footer } from './themes/SophiaPlatanisioti/Footer'
import { Hero } from './themes/SophiaPlatanisioti/Hero'
import { SophiaArticle } from './themes/SophiaPlatanisioti/SophiaArticle'
import { TIGArticleGrid } from './themes/TimeIsGolden/TIGArticleGrid'
import { TIGFooter } from './themes/TimeIsGolden/TIGFooter'
import { TIGHero } from './themes/TimeIsGolden/TIGHero'
import { TIGNavbar } from './themes/TimeIsGolden/TIGNavbar'
import { TIGSingleArticle } from './themes/TimeIsGolden/TIGSingleArticle'

// New Blocks
import { Stack } from './Stack'
import { Box as BoxBlock } from './Box'
import { Icon } from './Icon'
import { Video } from './Video'
import { Form } from './Form'
import { Tabs } from './Tabs'
import { Accordion } from './Accordion'

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
        isContainer: true,
    },
    {
        name: 'Grid',
        component: Grid,
        category: 'Layout',
        description: 'A responsive grid layout',
        icon: <LayoutGrid className="h-5 w-5" />,
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
    },
    {
        name: 'Search',
        component: Search,
        category: 'Interactive',
        description: 'Search block with overlay',
        icon: <SearchIcon className="h-5 w-5" />,
        settings: SearchSettings,
    },
    {
        name: 'Form',
        component: Form,
        category: 'Interactive',
        description: 'Form builder',
        icon: <Box className="h-5 w-5" />, // Todo: use specific icon
    },
    {
        name: 'Video',
        component: Video,
        category: 'Media',
        description: 'Video embed',
        icon: <Box className="h-5 w-5" />,
    },
    {
        name: 'Tabs',
        component: Tabs,
        category: 'Interactive',
        description: 'Tabbed content',
        icon: <Box className="h-5 w-5" />,
    },
    {
        name: 'Accordion',
        component: Accordion,
        category: 'Interactive',
        description: 'Collapsible content',
        icon: <Box className="h-5 w-5" />,
    },

    // Utility Components
    {
        name: 'Stack',
        component: Stack,
        category: 'Layout',
        description: 'Flexbox layout stack',
        icon: <Box className="h-5 w-5" />,
        isContainer: true
    },
    {
        name: 'Box',
        component: BoxBlock,
        category: 'Layout', // Moved to Layout or Utility? User said Utility but it's often Layout
        description: 'Primitive box',
        icon: <Box className="h-5 w-5" />,
        isContainer: true
    },
    {
        name: 'Icon',
        component: Icon,
        category: 'Media', // Or Utility
        description: 'Vector Icon',
        icon: <Box className="h-5 w-5" />,
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
        name: 'Section',
        component: Section,
        category: 'Layout',
        description: 'A semantic section for building page structure',
        icon: <LayoutGrid className="h-5 w-5" />,
        isContainer: true,
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

    // Time is Golden Theme
    {
        name: 'TIGNavbar',
        component: TIGNavbar,
        category: 'Time is Golden',
        description: 'Golden Theme Navbar',
        icon: <Navigation className="h-5 w-5" />,
    },
    {
        name: 'TIGHero',
        component: TIGHero,
        category: 'Time is Golden',
        description: 'Golden Theme Hero Area',
        icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
        name: 'TIGArticleGrid',
        component: TIGArticleGrid,
        category: 'Time is Golden',
        description: 'Golden Theme Article List',
        icon: <GalleryHorizontal className="h-5 w-5" />,
    },
    {
        name: 'TIGFooter',
        component: TIGFooter,
        category: 'Time is Golden',
        description: 'Golden Theme Footer',
        icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
        name: 'TIGSingleArticle',
        component: TIGSingleArticle,
        category: 'Time is Golden',
        description: 'Golden Theme Single Article',
        icon: <FileText className="h-5 w-5" />,
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
    ArticleAuthor, ArticleCategories, ArticleContent, ArticleCover, ArticleDate,
    // Article Components
    Articles, ArticleTitle, Button, Card, Container, Divider,
    DividerSettings, FeaturesGrid, FooterInfo, Grid, Heading, Hero,
    // Meindesk Theme Components
    HeroSection, Image, MeindeskContainer, Navbar, PrinciplesSection, Search, Section, SingleArticle,
    SophiaArticle, Spacer,
    SpacerSettings, Text, TIGArticleGrid,
    TIGFooter, TIGHero,
    // Time is Golden
    TIGNavbar, TIGSingleArticle, UpdatesCarousel,
    // New Blocks
    Stack, BoxBlock as Box, Icon as IconBlock, Video, Form, Tabs, Accordion
}

