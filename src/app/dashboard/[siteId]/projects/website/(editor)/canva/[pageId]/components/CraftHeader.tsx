"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Monitor, Tablet, Smartphone, Eye, Undo, Redo, SidebarClose, Layers } from "lucide-react"
import { useEditor } from "@craftjs/core"
import Link from "next/link"
import { CraftLayersPopup } from "./CraftLayers"
import { TemplatesDialog } from "./TemplatesDialog"
import { LayoutTemplate } from "lucide-react"
import { AIGeneratorDialog } from "./AIGeneratorDialog"
import { PublishDropdown } from "./PublishDropdown"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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



    const [showLayers, setShowLayers] = useState(false)
    const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)




    return (
        <>
            <header className="h-16 border-b backdrop-blur-xl bg-background/80 shadow-sm flex items-center justify-between px-6 z-30 shrink-0">
                {/* Left: Page title */}
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => history.back()}
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
                        className="h-8 w-8 rounded-full transition-all"
                        title="Desktop View"
                        onClick={() => setDeviceMode("desktop")}
                    >
                        <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={deviceMode === "tablet" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-full transition-all"
                        title="Tablet View"
                        onClick={() => setDeviceMode("tablet")}
                    >
                        <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={deviceMode === "mobile" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-full transition-all"
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
                            {/* Layers Toggle */}
                            <Button
                                variant={showLayers ? "secondary" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setShowLayers(!showLayers)}
                                title="Toggle Layers Panel"
                            >
                                <Layers className="h-4 w-4" />
                            </Button>

                            <Button
                                variant={showSidebar ? "secondary" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setShowSidebar(!showSidebar)}
                                title="Toggle Sidebar"
                            >
                                <SidebarClose className="h-4 w-4" />
                            </Button>

                            <Button
                                variant={showTemplates ? "secondary" : "ghost"}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setShowTemplates?.(!showTemplates)}
                                title="Toggle Sections Panel"
                            >
                                <LayoutTemplate className="h-4 w-4" />
                            </Button>

                            <div className="h-6 w-px bg-border/50 mx-1" />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => actions.history.undo()}
                                disabled={!canUndo}
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => actions.history.redo()}
                                disabled={!canRedo}
                                title="Redo (Ctrl+Y)"
                            >
                                <Redo className="h-4 w-4" />
                            </Button>

                            <div className="h-6 w-px bg-border/50 mx-1" />
                        </>
                    )}

                    <AIGeneratorDialog />

                    <Button
                        variant={!enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            const newEnabled = !enabled
                            actions.setOptions((options) => (options.enabled = newEnabled))
                            setShowSidebar(newEnabled)
                            if (!newEnabled) {
                                setShowLayers(false)
                                setShowTemplates?.(false)
                            }
                        }}
                    >
                        <Eye className="h-4 w-4 mr-2" />
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
                            className="bg-primary hover:bg-primary/90 min-w-[100px]"
                        >
                            {isSaving ? "Saving..." : `Save ${editorMode === "header" ? "Header" : "Footer"}`}
                        </Button>
                    )}
                </div>
            </header >

            {/* Floating Layers Popup */}
            <CraftLayersPopup isOpen={showLayers} onClose={() => setShowLayers(false)} />

            {/* Templates Dialog (for dialog-based template selection) */}
            <TemplatesDialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog} />
        </>
    )
}
