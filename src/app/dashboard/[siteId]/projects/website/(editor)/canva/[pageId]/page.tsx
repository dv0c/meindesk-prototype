"use client"

import { Editor, Element, Frame, useEditor } from "@craftjs/core"
import { use, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { CraftHeader } from "./components/CraftHeader"
import { CraftSidebar } from "./components/CraftSidebar"
import { RenderNode } from "./components/RenderNode"
import { Button, Container, Divider, Grid, Heading, Image, NavigationLinks, Spacer, Text, Card, resolverWithFallback } from "./user-components"
import { Navbar } from "./user-components/Navbar"
import { DesignProvider, useDesign } from "./components/DesignContext"
import { MarketplaceProvider } from "./components/MarketplaceContext"

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
    const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

    // Device width based on mode
    const getCanvasWidth = () => {
        switch (deviceMode) {
            case "mobile":
                return "375px"
            case "tablet":
                return "768px"
            default:
                return "100%"
        }
    }

    return (
        <DesignProvider>
            <MarketplaceProvider>
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
                    siteId={siteId}
                    pageId={pageId}
                    getCanvasWidth={getCanvasWidth}
                />
            </MarketplaceProvider>
        </DesignProvider>
    )
}

// Separate component to access design context and CraftJS editor
function EditorWithDesign({ resolver, pageName, setPageName, pageStatus, setPageStatus, isLocked, setIsLocked, deviceMode, setDeviceMode, isSaving, setIsSaving, showSidebar, setShowSidebar, siteId, pageId, getCanvasWidth }: any) {
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
                siteId={siteId}
                pageId={pageId}
                getCanvasWidth={getCanvasWidth}
                getCssVariables={getCssVariables}
            />
        </Editor>
    )
}

// Inner component that has access to useEditor
function EditorContent({ pageName, setPageName, pageStatus, setPageStatus, isLocked, setIsLocked, deviceMode, setDeviceMode, isSaving, setIsSaving, showSidebar, setShowSidebar, siteId, pageId, getCanvasWidth, getCssVariables }: any) {
    const { query, actions } = useEditor()
    const { settings, updateSettings, registerSaveHandler } = useDesign()
    const [isLoading, setIsLoading] = useState(true)
    const hasLoaded = useRef(false)

    // Load page data on mount only
    useEffect(() => {
        // Only load once
        if (hasLoaded.current) return
        hasLoaded.current = true

        async function loadPage() {
            try {
                const response = await fetch(`/api/team/${siteId}/pages/${pageId}`)
                if (response.ok) {
                    const page = await response.json()
                    setPageName(page.title || "Untitled Page")
                    setPageStatus(page.status || "DRAFT")
                    setIsLocked(page.locked || false)

                    // Load Design Settings if available
                    if (page.meta && page.meta.design) {
                        updateSettings(page.meta.design)
                    }

                    // Deserialize the layout into CraftJS
                    // Layout is stored as Json[] with the CraftJS state as first element
                    if (page.layout && page.layout.length > 0) {
                        const craftState = page.layout[0]
                        if (craftState && Object.keys(craftState).length > 0) {
                            actions.deserialize(JSON.stringify(craftState))
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load page:", error)
                toast.error("Failed to load page")
            } finally {
                setIsLoading(false)
            }
        }
        loadPage()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteId, pageId])

    const handleSave = useCallback(async () => {
        setIsSaving(true)
        try {
            // Get the serialized page layout from CraftJS
            const json = query.serialize()

            // Make API call to save the page
            const response = await fetch(`/api/team/${siteId}/pages/${pageId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: pageName,
                    status: pageStatus,
                    // Save design settings in meta
                    meta: {
                        design: settings
                    },
                    // CraftJS serializes to JSON string, Prisma expects Json[] so wrap in array
                    layout: [JSON.parse(json)],
                }),
            })

            if (response.ok) {
                toast.success("Page saved successfully")
            } else {
                const error = await response.json()
                throw new Error(error.error || "Failed to save")
            }
        } catch (error: any) {
            console.error("Failed to save:", error)
            toast.error(error.message || "Failed to save page")
        } finally {
            setIsSaving(false)
        }
    }, [query, pageName, pageStatus, siteId, pageId, setIsSaving, settings])

    // Register the save handler with DesignContext so DesignPanel can use it
    useEffect(() => {
        registerSaveHandler(handleSave)
    }, [registerSaveHandler, handleSave])

    return (
        <div className="h-screen flex flex-col bg-muted/10 overflow-hidden">
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
            />

            {/* Main Content */}
            <div className="flex-1 flex h-full overflow-hidden">
                {/* Sidebar */}
                {showSidebar && <CraftSidebar />}

                {/* Canvas Area */}
                <div className="flex-1 h-full overflow-hidden flex flex-col relative">
                    <div className="overflow-auto h-full bg-zinc-50 dark:bg-zinc-900 p-5">
                        <div
                            className="canvas-preview shadow-lg transition-all duration-300 mx-auto h-full overflow-y-auto overflow-x-hidden"
                            style={{
                                width: getCanvasWidth(),
                                minHeight: "100%",
                                backgroundColor: "var(--design-background, #ffffff)",
                                containerType: "inline-size",
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
                            <Frame>
                                <Element
                                    is={Container}
                                    canvas
                                    minHeight="100vh"
                                    flexDirection="column"
                                    alignItems="stretch"
                                    custom={{ displayName: "App", isDeletable: false }}
                                >
                                    {/* Components will be added here */}
                                </Element>
                            </Frame>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
