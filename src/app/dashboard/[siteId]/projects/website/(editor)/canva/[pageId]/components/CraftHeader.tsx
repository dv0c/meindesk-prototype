"use client"

import { CMSModal } from "@/components/builder/cms/CMSModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEditor, Editor, Frame } from "@craftjs/core"
import { ArrowLeft, Database, Eye, Layers, LayoutTemplate, Monitor, Redo, SidebarClose, Smartphone, Tablet, Undo } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { AIGeneratorDialog } from "./AIGeneratorDialog"
import { CraftLayersPopup } from "./CraftLayers"
import { PublishDropdown } from "./PublishDropdown"
import { TemplatesDialog } from "./TemplatesDialog"
import { RawHtmlDialog } from "@/components/builder/RawHtmlDialog"
import { generateFullHtml } from "@/components/builder/htmlGenerator"
import { Code } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

import { useSession } from "next-auth/react"
import { resolverWithFallback } from "../user-components"
import { useDesign } from "./DesignContext"
import { ReadOnlySection } from "./ReadOnlySection"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CraftHeaderProps {
    pageName: string
    setPageName: (name: string) => void
    pageStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED"
    setPageStatus: (status: "DRAFT" | "PUBLISHED" | "ARCHIVED") => void
    isLocked: boolean
    deviceMode: "desktop" | "tablet" | "mobile"
    setDeviceMode: (mode: "desktop" | "tablet" | "mobile") => void
    onSave: () => void
    isSaving: boolean
    showSidebar: boolean
    setShowSidebar: (show: boolean) => void
    siteId: string
    siteUrl?: string
    subdomain?: string
    seoScore?: number
    pageSlug?: string
    showTemplates?: boolean
    setShowTemplates?: (show: boolean) => void
    editorMode: "page" | "header" | "footer"
    setEditorMode: (mode: "page" | "header" | "footer") => void
    headerContent?: any
    footerContent?: any
    showLayers?: boolean
    setShowLayers?: (show: boolean) => void
}

export function CraftHeader({
    pageName,
    setPageName,
    pageStatus,
    setPageStatus,
    isLocked,
    deviceMode,
    setDeviceMode,
    onSave,
    isSaving,
    showSidebar,
    setShowSidebar,
    siteId,
    siteUrl,
    subdomain,
    seoScore = 0,
    pageSlug,
    showTemplates,
    setShowTemplates,
    editorMode,
    setEditorMode,
    headerContent,
    footerContent,
    showLayers,
    setShowLayers,
}: CraftHeaderProps) {
    const { actions, query, canUndo, canRedo, enabled, selected } = useEditor((state, query) => {
        const currentNodeId = state.events.selected?.values().next().value
        return {
            canUndo: query.history.canUndo(),
            canRedo: query.history.canRedo(),
            enabled: state.options.enabled,
            selected: currentNodeId,
        }
    })

    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const { data: session } = useSession()

    // Initialize CMS state from URL
    const [showCMS, setShowCMS] = useState(searchParams?.get("cms") === "open")

    // Sync CMS state to URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams?.toString())
        if (showCMS) {
            params.set("cms", "open")
        } else {
            params.delete("cms")
        }

        // Use history.replaceState to update URL without triggering Next.js navigation/re-renders
        // This ensures the Editor state is preserved and prevents "Unsaved Changes" checks from firing
        const newUrl = `${window.location.pathname}?${params.toString()}`
        window.history.replaceState(null, "", newUrl)
    }, [showCMS]) // Only depend on showCMS changing

    const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
    const [showRawHtml, setShowRawHtml] = useState(false)
    const [generatedHtml, setGeneratedHtml] = useState("")

    // Clean Export State
    const [isExporting, setIsExporting] = useState(false)
    const [exportJson, setExportJson] = useState<string | null>(null)
    const { getCssVariables } = useDesign()

    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
    const lastSavedState = useRef<string | null>(null)
    const prevIsSaving = useRef(isSaving)

    // Navigation Protection Refs
    const shouldBlockNavigation = useRef(true)
    const isTrapped = useRef(false)

    // Safe stringify helper to handle circular references in props (e.g. Context Providers)
    const safeStringify = (obj: any) => {
        const seen = new WeakSet()
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return
                }
                seen.add(value)
            }
            return value
        })
    }

    // Calculate Dirty State
    const nodes = query.getSerializedNodes()
    const currentStringState = safeStringify(nodes)
    const isDirty = !!lastSavedState.current && currentStringState !== lastSavedState.current

    // Initialize saved state on load (once nodes are available)
    useEffect(() => {
        const nodes = query.getSerializedNodes()
        if (!lastSavedState.current && nodes && Object.keys(nodes).length > 0) {
            lastSavedState.current = safeStringify(nodes)
        }
    }, [query])

    // Update saved state when save completes
    useEffect(() => {
        if (prevIsSaving.current && !isSaving) {
            lastSavedState.current = safeStringify(query.getSerializedNodes())
            // If we were trapped, untrap since we are clean
            if (isTrapped.current) {
                isTrapped.current = false
                history.back() // Remove the trap state
            }
        }
        prevIsSaving.current = isSaving
    }, [isSaving, query])

    // Reactive Trap Effect: Push state when becoming dirty
    useEffect(() => {
        if (isDirty && !isTrapped.current) {
            history.pushState(null, "", window.location.href)
            isTrapped.current = true
        }
    }, [isDirty])

    // Browser Warning (Tab Close / Refresh)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = "" // Legacy chrome
            }
        }
        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isDirty])

    // Browser Back Button Interception (Popstate)
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (!shouldBlockNavigation.current) return

            // If we were trapped, and popstate fired, it means user clicked back
            if (isTrapped.current) {
                // The trap was popped. We are now at 'real' state.
                isTrapped.current = false

                if (isDirty) {
                    // Re-trap and warn
                    history.pushState(null, "", window.location.href)
                    isTrapped.current = true
                    setShowUnsavedDialog(true)
                }
            }
        }

        window.addEventListener("popstate", handlePopState)
        return () => window.removeEventListener("popstate", handlePopState)
    }, [isDirty])

    const handleBack = () => {
        if (isDirty) {
            setShowUnsavedDialog(true)
        } else {
            history.back()
        }
    }

    const handleDiscard = () => {
        // Disable the blocker
        shouldBlockNavigation.current = false
        setShowUnsavedDialog(false)

        // If we heavily manipulated history (trap), we need to undo the trap AND go back
        if (isTrapped.current) {
            // We are at [Prev, Current, Trap]
            // We want [Prev]
            // So go -2
            history.go(-2)
        } else {
            // Just normal back
            history.back()
        }
    }

    const handleExportHtml = () => {
        // Serialize current state
        const nodes = query.getSerializedNodes()



        try {
            const json = safeStringify(nodes)
            setExportJson(json)
            setIsExporting(true)
        } catch (e) {
            console.warn("Serialization cycle detected, attempting safe export:", e)
            const json = safeStringify(nodes)
            setExportJson(json)
            setIsExporting(true)
        }
    }

    const finalizeExport = (cleanHtml: string) => {
        const cssVars = getCssVariables()
        const fullHtml = generateFullHtml(null, pageName, cleanHtml, cssVars)
        setGeneratedHtml(fullHtml)
        setShowRawHtml(true)
        setIsExporting(false)
        setExportJson(null)
    }




    return (
        <>
            <header className="h-[55px] border-b flex items-center justify-between px-6 z-30 shrink-0">
                {/* Left: Page title */}
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleBack}
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="h-8 w-px bg-border/50" />

                    {/* Editor Mode Selector */}
                    <Select value={editorMode} onValueChange={(v) => setEditorMode(v as any)}>
                        <SelectTrigger className="w-[140px] h-9 border-0 bg-transparent focus:ring-0 px-2 font-medium text-muted-foreground data-[state=open]:bg-muted/50 rounded-lg hover:bg-muted/30">
                            <SelectValue placeholder="Editing" />
                        </SelectTrigger>
                        <SelectContent className="min-w-[140px]">
                            <SelectItem value="page">Page Content</SelectItem>
                            <SelectItem value="header">Global Header</SelectItem>
                            <SelectItem value="footer">Global Footer</SelectItem>
                        </SelectContent>
                    </Select>

                    {editorMode === "page" ? (
                        <>
                            <div className={isLocked ? "opacity-50" : ""}>
                                <Input
                                    size={pageName.length || 8}
                                    maxLength={30}
                                    onChange={(e) => setPageName(e.target.value)}
                                    value={pageName || ""}
                                    placeholder="Untitled"
                                    disabled={isLocked}
                                    readOnly={isLocked}
                                    className="h-9 bg-transparent border-none font-semibold text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                                    title={isLocked ? "Page is locked" : undefined}
                                />
                            </div>
                            <button
                                onClick={() => !isLocked && setPageStatus(pageStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}
                                disabled={isLocked}
                                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${isLocked ? "opacity-50 cursor-not-allowed" : ""} ${pageStatus === "PUBLISHED"
                                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
                                    }`}
                                title={isLocked ? "Page is locked" : "Toggle status"}
                            >
                                {pageStatus === "PUBLISHED" ? "Published" : "Draft"}
                            </button>
                        </>
                    ) : (
                        <div className="font-semibold text-base px-2">
                            {editorMode === "header" ? "Global Header" : "Global Footer"}
                        </div>
                    )}
                </div>

                {/* Center: Device toggle */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-muted/50 rounded-full p-1 border shadow-sm backdrop-blur-sm">
                    <Button
                        variant={deviceMode === "desktop" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-full transition-colors duration-200"
                        title="Desktop View"
                        onClick={() => setDeviceMode("desktop")}
                    >
                        <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={deviceMode === "tablet" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-full transition-colors duration-200"
                        title="Tablet View"
                        onClick={() => setDeviceMode("tablet")}
                    >
                        <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={deviceMode === "mobile" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-full transition-colors duration-200"
                        title="Mobile View"
                        onClick={() => setDeviceMode("mobile")}
                    >
                        <Smartphone className="h-4 w-4" />
                    </Button>
                </div>


                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {enabled && (
                        <>
                            {/* Undo/Redo Group */}
                            <div className="flex items-center bg-muted/30 rounded-sm border p-0.5">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-xs"
                                    onClick={() => actions.history.undo()}
                                    disabled={!canUndo}
                                    title="Undo (Ctrl+Z)"
                                >
                                    <Undo className="h-3.5 w-3.5" />
                                </Button>
                                <div className="w-px h-4 bg-border/50" />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-xs"
                                    onClick={() => actions.history.redo()}
                                    disabled={!canRedo}
                                    title="Redo (Ctrl+Y)"
                                >
                                    <Redo className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <div className="h-6 w-px bg-border/50 mx-1" />

                            {/* View & Data Tools */}
                            <Button
                                variant={showLayers ? "secondary" : "ghost"}
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => setShowLayers?.(!showLayers)}
                                title="Toggle Layers Panel"
                            >
                                <Layers className="h-4 w-4 mr-2" />
                                Layers
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs px-2">
                                        <Database className="h-4 w-4" />
                                        Tools
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Data & Assets</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => setShowCMS(true)}>
                                        <Database className="h-4 w-4 mr-2" />
                                        <span>CMS Database</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setShowTemplates?.(!showTemplates)}>
                                        <LayoutTemplate className="h-4 w-4 mr-2" />
                                        <span>Templates</span>
                                    </DropdownMenuItem>
                                    {/* @ts-ignore */}
                                    {session?.user?.developerMode && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>Developer</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={handleExportHtml}>
                                                <Code className="h-4 w-4 mr-2" />
                                                <span>Export HTML</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* AI & Sidebar */}
                            <AIGeneratorDialog siteId={siteId} />

                            <Button
                                variant={showSidebar ? "secondary" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setShowSidebar(!showSidebar)}
                                title="Toggle Sidebar"
                            >
                                <SidebarClose className="h-4 w-4" />
                            </Button>

                            <div className="h-6 w-px bg-border/50 mx-1" />
                        </>
                    )}

                    {!enabled && (
                        <div className="h-6 w-px bg-border/50 mx-1" />
                    )}

                    <Button
                        variant={!enabled ? "default" : "secondary"}
                        size="sm"
                        onClick={() => {
                            const newEnabled = !enabled
                            actions.setOptions((options) => (options.enabled = newEnabled))
                            setShowSidebar(newEnabled)
                            if (!newEnabled) {
                                setShowLayers?.(false)
                                setShowTemplates?.(false)
                            }
                        }}
                        className="h-8 text-xs font-medium"
                    >
                        <Eye className="h-3.5 w-3.5 mr-2" />
                        {!enabled ? "Exit Preview" : "Preview"}
                    </Button>

                    {editorMode === "page" ? (
                        <PublishDropdown
                            pageSlug={pageSlug}
                            pageName={pageName}
                            pageStatus={pageStatus}
                            setPageStatus={setPageStatus}
                            siteUrl={siteUrl}
                            subdomain={subdomain}
                            seoScore={seoScore}
                            onSave={onSave}
                            isSaving={isSaving}
                        />
                    ) : (
                        <Button
                            onClick={onSave}
                            disabled={isSaving}
                            className="bg-primary hover:bg-primary/90 min-w-[100px] h-8 text-xs"
                        >
                            {isSaving ? "Saving..." : `Save ${editorMode === "header" ? "Header" : "Footer"}`}
                        </Button>
                    )}
                </div>
            </header >

            {/* Floating Layers Popup - Removed/Moved to Sidebar */}
            {/* <CraftLayersPopup isOpen={showLayers} onClose={() => setShowLayers(false)} /> */}

            {/* CMS Modal */}
            <CMSModal open={showCMS} onOpenChange={setShowCMS} siteId={siteId} />

            {/* Templates Dialog (for dialog-based template selection) */}
            <TemplatesDialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog} />

            <RawHtmlDialog
                open={showRawHtml}
                onOpenChange={setShowRawHtml}
                htmlContent={generatedHtml}
            />

            {/* Hidden Clean Export Renderer */}
            {isExporting && exportJson && (
                <div
                    id="clean-export-wrapper"
                    style={{ position: 'fixed', left: '-9999px', top: 0, width: '100%', maxWidth: '1440px', visibility: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                    {(editorMode === "page" && headerContent) && (
                        <ReadOnlySection content={headerContent} interactive={true} />
                    )}

                    <div className="flex-1">
                        <Editor enabled={false} resolver={resolverWithFallback}>
                            <Frame json={exportJson} />
                            <HtmlCapturer onCapture={finalizeExport} />
                        </Editor>
                    </div>

                    {(editorMode === "page" && footerContent) && (
                        <ReadOnlySection content={footerContent} interactive={true} />
                    )}
                </div>
            )}

            <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
                <AlertDialogContent className="border-zinc-800 bg-zinc-950 p-0 overflow-hidden sm:max-w-md">
                    <div className="p-6 space-y-4">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="font-mono text-lg uppercase tracking-widest text-white">
                                Unsaved Changes
                            </AlertDialogTitle>
                            <AlertDialogDescription className="font-mono text-xs text-zinc-400">
                                You have unsaved changes. Going back will discard them permanently.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="bg-rose-950/20 border border-rose-900/30 p-4 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="font-mono text-xs text-rose-500">
                                Warning: Progress will be lost.
                            </span>
                        </div>
                    </div>

                    <AlertDialogFooter className="p-4 bg-zinc-900/50 border-t border-zinc-900 flex-row gap-2 justify-end">
                        <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)} className="rounded-none h-8 text-[10px] font-mono uppercase bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white mt-0">
                            Stay & Save
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDiscard} className="rounded-none h-8 text-[10px] font-mono uppercase bg-rose-600 hover:bg-rose-700 text-white border-none">
                            Discard & Leave
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

function DeveloperExportButton({ onExport }: { onExport: () => void }) {
    const { data: session } = useSession()
    // @ts-ignore
    if (!session?.user?.developerMode) return null

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onExport}
            title="Export Raw HTML (Developer Mode)"
        >
            <Code className="h-4 w-4" />
        </Button>
    )
}

function HtmlCapturer({ onCapture }: { onCapture: (html: string) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            const wrapper = document.getElementById("clean-export-wrapper")
            if (wrapper) {
                onCapture(wrapper.innerHTML)
            }
        }, 800)
        return () => clearTimeout(timer)
    }, [onCapture])

    return null
}
