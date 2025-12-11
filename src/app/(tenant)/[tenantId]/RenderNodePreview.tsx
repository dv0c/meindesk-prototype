"use client"

import type { LayoutNode } from "@/lib/types"
import dynamic from "next/dynamic"
import type React from "react"
import { Suspense, memo } from "react"

interface RenderNodePreviewProps {
    node: LayoutNode
}

// Optimized component map for preview mode with SSR enabled
const componentMap: Record<string, React.ComponentType<any>> = {
    Container: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Container")),
    Grid: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Grid")),
    Button: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Button")),
    Slideshow: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Slideshow")),
    Articles: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Articles")),
    Hero: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Hero")),
    Heading: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Heading")),
    Text: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Text")),
    Features: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Features")),
    CallToAction: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/CallToAction")),
    Testimonial: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Testimonial")),
    Pricing: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Pricing")),
    Image: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Image")),
    Spacer: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Spacer")),
    Divider: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Divider")),
    Footer: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Footer")),
    Newsletter: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Newsletter").then(m => ({ default: m.Newsletter }))),
    Stats: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Stats").then(m => ({ default: m.Stats }))),
    TeamMember: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/TeamMember").then(m => ({ default: m.TeamMember }))),
    Tabs: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Tabs").then(m => ({ default: m.Tabs }))),
    Navbar: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/Navbar")),
    Navbar2: dynamic(() => import("@/components/Builder/CustomBlocks/Navbar")),
    SingleArticle: dynamic(() => import("@/components/Builder/CustomBlocks/SingleArticle").then(m => ({ default: m.SingleArticle }))),
    Badge: dynamic(() => import("@/components/Builder/CustomBlocks/Badge")),
    Avatar: dynamic(() => import("@/components/Builder/CustomBlocks/Avatar")),
    Input: dynamic(() => import("@/components/Builder/CustomBlocks/Input")),
    Textarea: dynamic(() => import("@/components/Builder/CustomBlocks/Textarea")),
    Select: dynamic(() => import("@/components/Builder/CustomBlocks/Select")),
    Checkbox: dynamic(() => import("@/components/Builder/CustomBlocks/Checkbox")),
    Switch: dynamic(() => import("@/components/Builder/CustomBlocks/Switch")),
    Slider: dynamic(() => import("@/components/Builder/CustomBlocks/Slider")),
    Progress: dynamic(() => import("@/components/Builder/CustomBlocks/Progress")),
    Separator: dynamic(() => import("@/components/Builder/CustomBlocks/Separator")),
    Skeleton: dynamic(() => import("@/components/Builder/CustomBlocks/Skeleton")),
    Spinner: dynamic(() => import("@/components/Builder/CustomBlocks/Spinner")),
    Table: dynamic(() => import("@/components/Builder/CustomBlocks/Table")),
    Breadcrumb: dynamic(() => import("@/components/Builder/CustomBlocks/Breadcrumb")),
    Kbd: dynamic(() => import("@/components/Builder/CustomBlocks/Kbd")),
    Alert: dynamic(() => import("@/components/Builder/CustomBlocks/Alert").then(m => ({ default: m.Alert }))),
    Gallery: dynamic(() => import("@/components/Builder/CustomBlocks/Gallery")),
    MostPopular: dynamic(() => import("@/components/Builder/CustomBlocks/MostPopular")),
    ImageGrid: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/ImageGrid")),
    ThemeSwitcher: dynamic(() => import("@/components/Builder/CustomBlocks/ThemeSwitcher")),
    NavbarContainer: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarContainer")),
    LogoBlock: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarBlocks/LogoBlock")),
    NavigationBlock: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarBlocks/NavigationBlock")),
    ActionButtonBlock: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarBlocks/ActionButtonBlock")),
    HeroSection: dynamic(() => import("@/components/Builder/CustomBlocks/HeroSection")),
    FooterBlock: dynamic(() => import("@/components/Builder/CustomBlocks/FooterBlock")),
    SectionDivider: dynamic(() => import("@/components/Builder/CustomBlocks/SectionDivider")),
    ContactInfo: dynamic(() => import("@/components/Builder/CustomBlocks/ContactInfo")),
    SplitHero: dynamic(() => import("@/components/Builder/CustomBlocks/SplitHero")),
}

function RenderNodePreview({ node }: RenderNodePreviewProps) {
    const Component = componentMap[node.type]

    if (!Component) {
        return null // Silently skip unknown components in preview mode
    }

    const handleClick = () => {
        if (node.script) {
            try {
                // Execute custom scripts on click
                new Function(node.script)()
            } catch (err) {
                console.error("Error executing script for node", node.id, err)
            }
        }
    }

    const CustomStyle = node.customCss ? (
        <style
            dangerouslySetInnerHTML={{
                __html: node.customCss.replace(/selector/g, `[data-node-id="${node.id}"]`),
            }}
        />
    ) : null

    const hasChildren = node.children && node.children.length > 0

    const renderedChildren = hasChildren ? (
        node.children!.map((child) => (
            <RenderNodePreview key={child.id} node={child} />
        ))
    ) : undefined

    return (
        <div data-node-id={node.id}>
            {CustomStyle}
            <Suspense fallback={<div className="animate-pulse bg-muted/20 rounded min-h-[40px]" />}>
                <Component
                    {...node.props}
                    className={`${node.props.className || ""} ${node.className || ""}`}
                    {...(node.props.style === undefined && node.style ? { style: node.style } : {})}
                    onClick={handleClick}
                    data-node-id={node.id}
                >
                    {renderedChildren}
                </Component>
            </Suspense>
        </div>
    )
}

// Memoize to prevent re-renders when parent re-renders but props haven't changed
export default memo(RenderNodePreview)
