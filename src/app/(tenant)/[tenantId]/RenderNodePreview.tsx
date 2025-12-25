"use client"

import type { LayoutNode } from "@/lib/types"
import dynamic from "next/dynamic"
import type React from "react"
import { Suspense, memo, useState, useEffect } from "react"

interface RenderNodePreviewProps {
    node: LayoutNode
    tenantId?: string
}

// Component to handle SnippetRef nodes in preview mode
function SnippetRefPreview({ node, tenantId }: { node: LayoutNode; tenantId?: string }) {
    const [snippetContent, setSnippetContent] = useState<LayoutNode[] | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchSnippet() {
            if (!node.snippetId || !tenantId) {
                setLoading(false)
                setError(true)
                return
            }

            try {
                const response = await fetch(`/api/v1/${tenantId}/snippets/${node.snippetId}`)
                if (response.ok) {
                    const snippet = await response.json()
                    setSnippetContent(snippet.content as LayoutNode[])
                } else {
                    setError(true)
                }
            } catch (err) {
                console.error("Failed to fetch snippet:", err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchSnippet()
    }, [node.snippetId, tenantId])

    if (loading) {
        return <div className="animate-pulse bg-muted/20 rounded min-h-[40px]" />
    }

    if (error || !snippetContent) {
        return null // Silently skip broken snippets in preview mode
    }

    return (
        <>
            {snippetContent.map((childNode) => (
                <MemoizedRenderNodePreview key={childNode.id} node={childNode} tenantId={tenantId} />
            ))}
        </>
    )
}

// Optimized component map for preview mode with SSR enabled
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
    Navbar2: dynamic(() => import("@/components/Builder/CustomBlocks/Navbar")),
    SingleArticle: dynamic(() => import("@/components/Builder/CustomBlocks/SingleArticle").then(m => ({ default: m.SingleArticle }))),
    ImageGrid: dynamic(() => import("@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ui/editor/ImageGrid")),
    ThemeSwitcher: dynamic(() => import("@/components/Builder/CustomBlocks/ThemeSwitcher")),
    NavbarContainer: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarContainer")),
    LogoBlock: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarBlocks/LogoBlock")),
    NavigationBlock: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarBlocks/NavigationBlock")),
    ActionButtonBlock: dynamic(() => import("@/components/Builder/CustomBlocks/NavbarBlocks/ActionButtonBlock")),
    HeroSection: dynamic(() => import("@/components/Builder/CustomBlocks/HeroSection")),
    ContactInfo: dynamic(() => import("@/components/Builder/CustomBlocks/ContactInfo")),
    MostPopular: dynamic(() => import("@/components/Builder/CustomBlocks/MostPopular")),
}

// Theme component registry - allows multiple components with same name from different themes
const themeComponentMap: Record<string, React.ComponentType<any>> = {
    // SophiaPlatanisioti Theme
    "Sophia Platanisioti_Hero": dynamic(() => import("@/components/Builder/CustomBlocks/Themes/SophiaPlatanisioti/Hero").then(m => ({ default: m.Hero }))),
    "Sophia Platanisioti_Navbar": dynamic(() => import("@/components/Builder/CustomBlocks/Themes/SophiaPlatanisioti/Navbar").then(m => ({ default: m.Navbar })), { ssr: false }),
    "Sophia Platanisioti_Footer": dynamic(() => import("@/components/Builder/CustomBlocks/Themes/SophiaPlatanisioti/Footer")),

    // Add more themes here following the pattern: "ThemeName_ComponentName"
}

// Helper function to get component - checks both maps
function getComponent(componentType: string, themeName?: string): React.ComponentType<any> | undefined {
    // If theme name is provided, check theme registry first
    if (themeName) {
        const themeKey = `${themeName}_${componentType}`
        if (themeComponentMap[themeKey]) {
            return themeComponentMap[themeKey]
        }
    }

    // Fallback to regular component map
    return componentMap[componentType]
}

function RenderNodePreview({ node, tenantId }: RenderNodePreviewProps) {
    // Handle SnippetRef nodes - fetch and render snippet content
    if (node.type === "SnippetRef" && node.snippetId) {
        return <SnippetRefPreview node={node} tenantId={tenantId} />
    }

    // Try to get theme name from node metadata/props
    // Check node-level themeName first (where component-registry stores it), then fall back to props
    const themeName = node.themeName || node.props?.themeName

    // Get component from either theme registry or base registry
    const Component = getComponent(node.type, themeName)

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
            <MemoizedRenderNodePreview key={child.id} node={child} tenantId={tenantId} />
        ))
    ) : undefined

    return (
        <div data-node-id={node.id}>
            {CustomStyle}
            <Suspense fallback={<div className="animate-pulse bg-muted/20 rounded min-h-[40px]" />}>
                <Component
                    {...(() => {
                        // Filter out themeName from props - it's builder metadata, not a component prop
                        const { themeName: _, ...cleanProps } = node.props || {};
                        return cleanProps;
                    })()}
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
const MemoizedRenderNodePreview = memo(RenderNodePreview)
export default MemoizedRenderNodePreview

