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
} from 'lucide-react'

// Import all components
import { Container, ContainerSettings } from './Container'
import { Heading, HeadingSettings } from './Heading'
import { Text, TextSettings } from './Text'
import { Button, ButtonSettings } from './Button'
import { Image, ImageSettings } from './Image'
import { Grid, GridSettings } from './Grid'
import { Divider, DividerSettings } from './Divider'
import { Spacer, SpacerSettings } from './Spacer'
import { Navbar } from './Navbar'
import { NavigationLinks, NavigationLinksSettings } from './NavigationLinks'
import { Card } from './ExampleCard'

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
        category: 'Navigation',
        description: 'A header navigation bar',
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
        settings: HeadingSettings,
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
]

/**
 * Derived exports for convenience
 */

// Component map (name -> component)
export const componentMap = componentRegistry.reduce(
    (acc, item) => {
        acc[item.name] = item.component
        return acc
    },
    {} as Record<string, React.ComponentType<any>>
)

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
    HeadingSettings,
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
}
