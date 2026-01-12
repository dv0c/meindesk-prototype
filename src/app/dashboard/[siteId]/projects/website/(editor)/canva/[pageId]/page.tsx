"use client"

import { Button as UIButton } from "@/components/ui/button"
import { Editor, Element, Frame, useEditor } from "@craftjs/core"
import { AnimatePresence } from "framer-motion"
import { use, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { BuilderLoader } from "./components/BuilderLoader"
import { CraftHeader } from "./components/CraftHeader"
import { CraftSidebar } from "./components/CraftSidebar"
import { DesignProvider, useDesign } from "./components/DesignContext"
import { HoverProvider } from "./components/HoverContext"
import { MarketplaceProvider } from "./components/MarketplaceContext"
import { OnboardingTutorial } from "./components/OnboardingTutorial"
import { RenderNode } from "./components/RenderNode"
import { SEOProvider, useSEO } from "./components/seo"
import { TemplatesPanel } from "./components/TemplatesPanel"
import { Container, resolverWithFallback } from "./user-components"
import { ArticleProvider } from "./user-components/article"


import { EditorThemeProvider } from "./components/ThemeContext"
import { ReadOnlySection } from "./components/ReadOnlySection"

// Resolver for all user components - now using resolverWithFallback from registry
// This automatically handles missing components (e.g., from uninstalled themes)
const resolver = resolverWithFallback

export default function CraftJSEditorPage({ params }: { params: { siteId: string; pageId: string } }) {
    const { siteId, pageId } = use(params as unknown as Promise<{ siteId: string; pageId: string }>)
    const [pageName, setPageName] = useState("Untitled Page")
    const [pageStatus, setPageStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT")
    const [isLocked, setIsLocked] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showSidebar, setShowSidebar] = useState(true)
    const [showTemplates, setShowTemplates] = useState(false)
    const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

    // Fixed device widths
    const DESKTOP_WIDTH = 1440
    const TABLET_WIDTH = 768
    const MOBILE_WIDTH = 375

    // Device width based on mode
    const getCanvasWidth = () => {
        switch (deviceMode) {
            case "mobile":
                return `${MOBILE_WIDTH}px`
            case "tablet":
                return `${TABLET_WIDTH}px`
            default:
                return `${DESKTOP_WIDTH}px`
        }
    }

    // Get the actual pixel width for scale calculation
    const getDevicePixelWidth = () => {
        switch (deviceMode) {
            case "mobile":
                return MOBILE_WIDTH
            case "tablet":
                return TABLET_WIDTH
            default:
                return DESKTOP_WIDTH
        }
    }

    return (
        <DesignProvider>
            <EditorThemeProvider>
                <MarketplaceProvider>
                    <SEOProvider>
                        <EditorWithDesign
                            resolver={resolver}
                            pageName={pageName}
                            setPageName={setPageName}
                            pageStatus={pageStatus}
                            setPageStatus={setPageStatus}
                            isLocked={isLocked}
                            setIsLocked={setIsLocked}
                            deviceMode={deviceMode}
                            setDeviceMode={setDeviceMode}
                            isSaving={isSaving}
                            setIsSaving={setIsSaving}
                            showSidebar={showSidebar}
                            setShowSidebar={setShowSidebar}
                            showTemplates={showTemplates}
                            setShowTemplates={setShowTemplates}
                            siteId={siteId}
                            pageId={pageId}
                            getCanvasWidth={getCanvasWidth}
                            getDevicePixelWidth={getDevicePixelWidth}
                        />
                    </SEOProvider>
                </MarketplaceProvider>
            </EditorThemeProvider>
        </DesignProvider>
    )
}

// Separate component to access design context and CraftJS editor
function EditorWithDesign({ resolver, pageName, setPageName, pageStatus, setPageStatus, isLocked, setIsLocked, deviceMode, setDeviceMode, isSaving, setIsSaving, showSidebar, setShowSidebar, showTemplates, setShowTemplates, siteId, pageId, getCanvasWidth, getDevicePixelWidth }: any) {
    const { getCssVariables, settings } = useDesign()

    // Helper to detect Fontshare fonts
    const isFontshare = (fontName: string) => {
        const fontshareFonts = [
            "General Sans", "Clash Display", "Clash Grotesk", "Plein", "Switzer",
            "Pilcrow Rounded", "Gambetta", "Chubbo", "Supreme", "Mona Sans",
            "Bespoke Serif", "Bespoke Sans", "Boska", "Satoshi", "Cabinet Grotesk"
        ]
        return fontshareFonts.includes(fontName)
    }

    // Load fonts globally when settings change
    useEffect(() => {
        const fonts = [settings.baseFont, settings.headingFont].filter(f => f && f !== "inherit")
        if (fonts.length === 0) return

        const googleToLoad = new Set<string>()
        const fontshareToLoad = new Set<string>()

        fonts.forEach(f => {
            if (isFontshare(f)) fontshareToLoad.add(f)
            else googleToLoad.add(f)
        })

        // Load Google Fonts
        if (googleToLoad.size > 0) {
            const fontQuery = Array.from(googleToLoad).map(f => f.replace(/ /g, "+") + ":wght@300;400;500;600;700").join("&family=")
            const linkId = "design-selected-google-fonts"
            const existing = document.getElementById(linkId)
            if (existing) existing.remove()

            const link = document.createElement("link")
            link.id = linkId
            link.rel = "stylesheet"
            link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`
            document.head.appendChild(link)
        }

        // Load Fontshare Fonts
        if (fontshareToLoad.size > 0) {
            const fsQuery = Array.from(fontshareToLoad).map(f => {
                const kebab = f.toLowerCase().replace(/ /g, "-")
                return `f[]=${kebab}@300,400,500,600,700`
            }).join("&")

            const linkId = "design-selected-fontshare-fonts"
            const existing = document.getElementById(linkId)
            if (existing) existing.remove()

            const link = document.createElement("link")
            link.id = linkId
            link.rel = "stylesheet"
            link.href = `https://api.fontshare.com/v2/css?${fsQuery}&display=swap`
            document.head.appendChild(link)
        }
    }, [settings.baseFont, settings.headingFont])

    return (
        <HoverProvider>
            <Editor resolver={resolver} onRender={RenderNode}>
                <EditorContent
                    pageName={pageName}
                    setPageName={setPageName}
                    pageStatus={pageStatus}
                    setPageStatus={setPageStatus}
                    isLocked={isLocked}
                    setIsLocked={setIsLocked}
                    deviceMode={deviceMode}
                    setDeviceMode={setDeviceMode}
                    isSaving={isSaving}
                    setIsSaving={setIsSaving}
                    showSidebar={showSidebar}
                    setShowSidebar={setShowSidebar}
                    showTemplates={showTemplates}
                    setShowTemplates={setShowTemplates}
                    siteId={siteId}
                    pageId={pageId}
                    getCanvasWidth={getCanvasWidth}
                    getDevicePixelWidth={getDevicePixelWidth}
                    getCssVariables={getCssVariables}
                />
            </Editor>
        </HoverProvider>
    )
}

// Inner component that has access to useEditor
function EditorContent({ pageName, setPageName, pageStatus, setPageStatus, isLocked, setIsLocked, deviceMode, setDeviceMode, isSaving, setIsSaving, showSidebar, setShowSidebar, showTemplates, setShowTemplates, siteId, pageId, getCanvasWidth, getDevicePixelWidth, getCssVariables }: any) {
    const { query, actions, enabled } = useEditor((state) => ({
        enabled: state.options.enabled
    }))
    const { settings, updateSettings, registerSaveHandler } = useDesign()
    const { seoSettings, updateSEOSettings, registerSEOSaveHandler } = useSEO()
    const [isLoading, setIsLoading] = useState(true)
    const [pageSlug, setPageSlug] = useState("")
    const [siteUrl, setSiteUrl] = useState("")
    const [subdomain, setSubdomain] = useState("")
    const [seoScore, setSeoScore] = useState(0)
    const hasLoaded = useRef(false)
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
    const [showOnboarding, setShowOnboarding] = useState(false)
    const [editorMode, setEditorMode] = useState<"page" | "header" | "footer">("page")

    // Check for onboarding status
    useEffect(() => {
        const hasSeen = localStorage.getItem("hasSeenOnboarding")
        if (!hasSeen && !isLoading) {
            // Short delay to let the loader finish
            const timer = setTimeout(() => setShowOnboarding(true), 500)
            return () => clearTimeout(timer)
        }
    }, [isLoading])

    // Measure container for scaling using ResizeObserver
    useEffect(() => {
        if (!canvasContainerRef.current) return

        let timeoutId: NodeJS.Timeout

        const resizeObserver = new ResizeObserver((entries) => {
            // Debounce the resize update to prevent layout thrashing during sidebar transitions
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect
                    setContainerSize({ width, height })
                }
            }, 50) // 50ms delay is enough to skip intermediate frames but feels responsive
        })

        resizeObserver.observe(canvasContainerRef.current)
        return () => {
            resizeObserver.disconnect()
            clearTimeout(timeoutId)
        }
    }, []) // Empty dependency array - we only need to attach once

    // Calculate scale for device mode
    const getScale = () => {
        const deviceWidth = getDevicePixelWidth()
        // Add some padding around the canvas for better visibility
        const paddingX = 48
        const paddingY = 48

        // Available space
        const availableWidth = containerSize.width - paddingX
        const availableHeight = containerSize.height - paddingY

        if (availableWidth <= 0) return 1

        // If device width fits, use scale 1 (unless we want to "fit to screen" mode specifically)
        // But usually we want to scale DOWN if it doesn't fit.

        const scaleX = availableWidth / deviceWidth

        // We typically scale based on width to ensure the site fits horizontally.
        // If scaleX < 1, we scale down. If scaleX > 1, we cap at 1 to prevent zooming in pixelation?
        // Or maybe allow zooming up to 1.

        return Math.min(1, scaleX)
    }

    const scale = getScale()
    const deviceWidth = getDevicePixelWidth()

    const [headerContent, setHeaderContent] = useState<any>(null)
    const [footerContent, setFooterContent] = useState<any>(null)

    // Load content based on editor mode
    useEffect(() => {
        async function loadContent() {
            setIsLoading(true)
            const startTime = Date.now()
            try {
                // 1. Fetch Site Data (Always needed for context)
                if (!hasLoaded.current) {
                    const siteResponse = await fetch(`/api/team/${siteId}`)
                    if (siteResponse.ok) {
                        const data = await siteResponse.json()
                        setSiteUrl(data.site?.url || "")
                        setSubdomain(data.site?.subdomain || "")
                    }
                    hasLoaded.current = true
                }

                // 2. Fetch Content based on Mode
                if (editorMode === "page") {
                    // Load Page
                    const response = await fetch(`/api/team/${siteId}/pages/${pageId}`)
                    if (response.ok) {
                        const page = await response.json()
                        setPageName(page.title || "Untitled Page")
                        setPageStatus(page.status || "DRAFT")
                        setPageSlug(page.slug || "")
                        setIsLocked(page.locked || false)

                        if (page.meta && page.meta.design) updateSettings(page.meta.design)
                        if (page.meta && page.meta.seo) {
                            updateSEOSettings(page.meta.seo)
                            // Re-calculate mock SEO score
                            const seo = page.meta.seo
                            let score = 0
                            if (seo.title) score += 20
                            if (seo.description) score += 20
                            if (seo.keywords && seo.keywords.length > 0) score += 15
                            if (seo.ogImage) score += 15
                            if (seo.favicon) score += 10
                            if (seo.title && seo.title.length >= 30 && seo.title.length <= 60) score += 10
                            if (seo.description && seo.description.length >= 120 && seo.description.length <= 160) score += 10
                            setSeoScore(score)
                        }

                        if (page.layout && page.layout.length > 0) {
                            const craftState = page.layout[0]
                            if (craftState && Object.keys(craftState).length > 0) {
                                actions.deserialize(JSON.stringify(craftState))
                            }
                        } else {
                            actions.clearEvents() // Clear if empty
                        }

                        // Fetch Header & Footer for Preview (silent fail if missing)
                        try {
                            const [headerRes, footerRes] = await Promise.all([
                                fetch(`/api/team/${siteId}/snippets/header`),
                                fetch(`/api/team/${siteId}/snippets/footer`)
                            ])

                            if (headerRes.ok) {
                                const header = await headerRes.json()
                                if (header?.content) setHeaderContent(header.content)
                            }

                            if (footerRes.ok) {
                                const footer = await footerRes.json()
                                if (footer?.content) setFooterContent(footer.content)
                            }
                        } catch (e) {
                            // ignore
                        }
                    }
                } else {
                    // Load Header or Footer Snippet
                    const response = await fetch(`/api/team/${siteId}/snippets/${editorMode}`)
                    if (response.ok) {
                        const snippet = await response.json()
                        // Snippets don't have page status/slug/locks, but we might want to track them differently
                        // For now, keep visual UI states as is or reset them

                        if (snippet.content && Object.keys(snippet.content).length > 0) {
                            // Snippet content is stored directly as the JSON object (not array)
                            actions.deserialize(JSON.stringify(snippet.content))
                        } else {
                            // Initialize with empty ROOT container if no content exists
                            const emptyState = {
                                "ROOT": {
                                    "type": { "resolvedName": "Container" },
                                    "isCanvas": true,
                                    "props": {
                                        "flexDirection": "column",
                                        "alignItems": "center",
                                        "padding": ["0", "0", "0", "0"],
                                        "width": "100%",
                                        "background": "transparent"
                                    },
                                    "displayName": "App",
                                    "custom": { "displayName": "App" },
                                    "hidden": false,
                                    "nodes": [],
                                    "linkedNodes": {}
                                }
                            }
                            actions.deserialize(JSON.stringify(emptyState))
                        }
                    }
                }

            } catch (error) {
                console.error("Failed to load content:", error)
                toast.error(`Failed to load ${editorMode}`)
            } finally {
                // Ensure minimum loading time of 1s for transition (reduced from 2.5s for mode switching)
                const elapsed = Date.now() - startTime
                const minTime = hasLoaded.current ? 1000 : 2500 // Longer for initial load
                if (elapsed < minTime) {
                    await new Promise(resolve => setTimeout(resolve, minTime - elapsed))
                }
                setIsLoading(false)
            }
        }

        loadContent()
    }, [editorMode, siteId, pageId])

    const handleSave = useCallback(async (statusOverride?: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
        setIsSaving(true)
        try {
            const json = query.serialize()
            const content = JSON.parse(json)

            if (editorMode === "page") {
                // Save Page
                const response = await fetch(`/api/team/${siteId}/pages/${pageId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: pageName,
                        status: statusOverride || pageStatus,
                        meta: {
                            design: settings,
                            seo: seoSettings
                        },
                        layout: [content],
                    }),
                })

                if (response.ok) {
                    toast.success("Page saved successfully")
                } else {
                    const error = await response.json()
                    throw new Error(error.error || "Failed to save")
                }
            } else {
                // Save Snippet
                const response = await fetch(`/api/team/${siteId}/snippets/${editorMode}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: content,
                    }),
                })

                if (response.ok) {
                    toast.success(`${editorMode.charAt(0).toUpperCase() + editorMode.slice(1)} saved successfully`)
                } else {
                    throw new Error("Failed to save snippet")
                }
            }

        } catch (error: any) {
            console.error("Failed to save:", error)
            toast.error(error.message || "Failed to save")
        } finally {
            setIsSaving(false)
        }
    }, [query, pageName, pageStatus, siteId, pageId, setIsSaving, settings, seoSettings, editorMode])

    // Register the save handler with DesignContext and SEOContext
    useEffect(() => {
        registerSaveHandler(handleSave)
        registerSEOSaveHandler(handleSave)
    }, [registerSaveHandler, registerSEOSaveHandler, handleSave])

    return (
        <div className="h-screen flex flex-col bg-muted/10 overflow-hidden">
            <AnimatePresence mode="wait">
                {isLoading && <BuilderLoader key="loader" />}
            </AnimatePresence>

            {showOnboarding && (
                <OnboardingTutorial onClose={() => setShowOnboarding(false)} />
            )}

            {/* Mobile/Tablet Warning Overlay */}
            <div className="flex md:hidden flex-col items-center justify-center h-full p-6 text-center bg-background">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <rect width="20" height="14" x="2" y="3" rx="2" />
                        <line x1="8" x2="16" y1="21" y2="21" />
                        <line x1="12" x2="12" y1="17" y2="21" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Desktop Only</h2>
                <p className="text-muted-foreground max-w-xs mb-6">
                    The website editor is optimized for desktop experience. Please open this page on a larger screen to edit your site.
                </p>
                <UIButton onClick={() => window.history.back()} variant="outline">
                    Go Back
                </UIButton>
            </div>

            {/* Desktop Editor Interface */}
            <div className="hidden md:flex flex-col h-full overflow-hidden">
                {/* Header */}
                <CraftHeader
                    pageName={pageName}
                    setPageName={setPageName}
                    pageStatus={pageStatus}
                    setPageStatus={setPageStatus}
                    isLocked={isLocked}
                    deviceMode={deviceMode}
                    setDeviceMode={setDeviceMode}
                    onSave={handleSave}
                    isSaving={isSaving}
                    showSidebar={showSidebar}
                    setShowSidebar={setShowSidebar}
                    siteId={siteId}
                    siteUrl={siteUrl}
                    subdomain={subdomain}
                    seoScore={seoScore}
                    pageSlug={pageSlug}
                    showTemplates={showTemplates}
                    setShowTemplates={setShowTemplates}
                    editorMode={editorMode}
                    setEditorMode={setEditorMode}
                />

                {/* Main Content */}
                <div className="flex-1 flex h-full overflow-hidden">
                    {/* Left Sidebar with animation */}
                    <div
                        className={`transition-[width,opacity] duration-300 ease-in-out overflow-hidden ${showSidebar ? 'w-[380px] opacity-100' : 'w-0 opacity-0'
                            }`}
                    >
                        <CraftSidebar isArticlePage={pageSlug === 'article'} editorMode={editorMode} siteId={siteId} />
                    </div>

                    {/* Canvas Area */}
                    <div ref={canvasContainerRef} className="flex-1 h-full overflow-hidden flex flex-col relative">
                        <div className={`overflow-auto h-full flex justify-center transition-all duration-300 ${Boolean(enabled) ? "bg-zinc-50 dark:bg-zinc-900 p-5" : "bg-background p-0"}`}>

                            <div
                                className="canvas-preview shadow-lg transition-all duration-300 overflow-y-auto overflow-x-hidden"
                                style={{
                                    width: enabled ? getCanvasWidth() : "100%",
                                    minHeight: "100%", // Let content drive height
                                    height: "fit-content",
                                    backgroundColor: "var(--design-background, #ffffff)",
                                    transform: `scale(${enabled ? scale : 1}) translateZ(0)`, // translateZ for crisp text
                                    transformOrigin: "top center",
                                    marginBottom: enabled ? "40px" : "0", // Visual spacing at bottom only in editor
                                    display: "flex",
                                    flexDirection: "column",
                                    ...Object.fromEntries(
                                        getCssVariables()
                                            .split(';')
                                            .filter((s: string) => s.trim())
                                            .map((s: string) => {
                                                const [key, value] = s.split(':').map((x: string) => x.trim())
                                                return [key, value]
                                            })
                                    )
                                }}
                            >
                                {editorMode === 'page' && (
                                    <ReadOnlySection content={headerContent} />
                                )}

                                <div className="flex-1 relative z-10">
                                    <ArticleProvider>
                                        <Frame>
                                            <Element
                                                is={Container}
                                                canvas
                                                minHeight="100vh"
                                                height="100vh"
                                                flexDirection="column"
                                                alignItems="stretch"
                                                custom={{ displayName: "App", isDeletable: false }}
                                            >
                                                {/* Components will be added here */}
                                            </Element>
                                        </Frame>
                                    </ArticleProvider>
                                </div>

                                {editorMode === 'page' && (
                                    <ReadOnlySection content={footerContent} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Templates with animation */}
                    <div
                        className={`transition-[width,opacity] duration-300 ease-in-out overflow-hidden ${showTemplates ? 'w-[320px] opacity-100' : 'w-0 opacity-0'
                            }`}
                    >
                        <TemplatesPanel onClose={() => setShowTemplates(false)} />
                    </div>
                </div>
            </div>
        </div>
    )
}
