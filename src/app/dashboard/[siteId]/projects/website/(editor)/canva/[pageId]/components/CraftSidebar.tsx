"use client"

import { useEditor } from "@craftjs/core"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Trash2, FileCode } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Package, Palette, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { CraftToolbox } from "./CraftToolbox"
import { CraftPropertiesPanel } from "./CraftPropertiesPanel"
import { GlobalStylesPanel } from "./GlobalSettings"
import { DesignPanel } from "./DesignPanel"
import { SEOPanel } from "./seo"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

// Animation variants
const slideVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 }
}

const headerVariants = {
    initial: { opacity: 0, y: -5 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 5 }
}

const contentVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -5 }
}

export function CraftSidebar({ isArticlePage = false, editorMode = "page", siteId, uxMode = "simple" }: { isArticlePage?: boolean; editorMode?: "page" | "header" | "footer", siteId?: string, uxMode?: "simple" | "advanced" }) {
    const { selected, name, isDeletable, styleConfig, actions } = useEditor((state) => {
        const currentNodeId = state.events.selected?.values().next().value
        const node = currentNodeId ? state.nodes[currentNodeId] : null
        return {
            selected: currentNodeId,
            name: node?.data.custom.displayName || node?.data.displayName || node?.data.name,
            isDeletable: node && node.data.custom.isDeletable !== false,
            styleConfig: node?.data.custom.styleConfig, // Get style config from component
        }
    })

    // Track the current view for animations
    const [currentView, setCurrentView] = useState<"palette" | "properties">(selected ? "properties" : "palette")

    useEffect(() => {
        setCurrentView(selected ? "properties" : "palette")
    }, [selected])

    if (uxMode === "simple") {
        return <SimpleSidebar isArticlePage={isArticlePage} editorMode={editorMode} siteId={siteId} selected={selected} />
    }

    return (
        <div className="w-[380px] border-r bg-gradient-to-b from-background to-muted/20 flex flex-col h-full shadow-lg z-20 overflow-hidden">
            <AnimatePresence mode="wait">
                {selected ? (
                    <motion.div
                        key="properties"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={slideVariants}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="flex flex-col h-full"
                    >
                        <PropertiesView
                            selected={selected}
                            name={name}
                            isDeletable={isDeletable as boolean}
                            styleConfig={styleConfig}
                            onBack={() => actions.selectNode(undefined)}
                            onDelete={() => {
                                if (selected) actions.delete(selected)
                            }}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="palette"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={slideVariants}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="flex flex-col h-full"
                    >
                        <PaletteView isArticlePage={isArticlePage} editorMode={editorMode} siteId={siteId} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function SimpleSidebar({
    isArticlePage,
    editorMode,
    siteId,
    selected,
}: {
    isArticlePage: boolean
    editorMode: "page" | "header" | "footer"
    siteId?: string
    selected?: string
}) {
    const [activeTab, setActiveTab] = useState<"build" | "edit" | "design" | "seo">("build")

    useEffect(() => {
        if (selected) setActiveTab("edit")
    }, [selected])

    return (
        <div className="w-[380px] border-r bg-background flex flex-col h-full z-20 overflow-hidden">
            <div className="border-b p-4 space-y-3">
                <h2 className="text-sm font-semibold">Builder</h2>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList className="grid grid-cols-4 w-full h-9">
                        <TabsTrigger value="build" className="text-xs">Build</TabsTrigger>
                        <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
                        <TabsTrigger value="design" className="text-xs">Design</TabsTrigger>
                        <TabsTrigger value="seo" className="text-xs" disabled={editorMode !== "page"}>SEO</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {activeTab === "build" && (
                <div className="flex-1 overflow-hidden">
                    <div className="mx-4 mt-4 rounded-lg border bg-muted/30 p-3 text-xs">
                        <p className="font-medium mb-1">Start here</p>
                        <ol className="space-y-1 text-muted-foreground list-decimal ml-4">
                            <li>Drag a block into the canvas.</li>
                            <li>Click it to edit content.</li>
                            <li>Use Save/Publish when done.</li>
                        </ol>
                    </div>
                    <div className="h-[calc(100%-110px)]">
                        <CraftToolbox isArticlePage={isArticlePage} />
                    </div>
                </div>
            )}

            {activeTab === "edit" && (
                <ScrollArea className="flex-1 min-h-0 px-4">
                    {!selected ? (
                        <div className="py-8 text-sm text-muted-foreground">
                            Select a block in the canvas to edit it.
                        </div>
                    ) : (
                        <CraftPropertiesPanel />
                    )}
                </ScrollArea>
            )}

            {activeTab === "design" && (
                <div className="flex-1 overflow-y-auto">
                    <DesignPanel />
                </div>
            )}

            {activeTab === "seo" && editorMode === "page" && (
                <div className="flex-1 overflow-y-auto">
                    <SEOPanel onBack={() => setActiveTab("build")} />
                </div>
            )}
        </div>
    )
}

// Properties View Component
function PropertiesView({
    selected,
    name,
    isDeletable,
    styleConfig,
    onBack,
    onDelete
}: {
    selected: string
    name?: string
    isDeletable?: boolean
    styleConfig?: any
    onBack: () => void
    onDelete: () => void
}) {
    return (
        <div className="flex flex-col h-full">
            {/* Header with glassmorphism effect */}
            <motion.div
                className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b"
                variants={headerVariants}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.15, delay: 0.05 }}
            >
                <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full hover:bg-primary/10 transition-colors"
                                    onClick={onBack}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <h3 className="font-semibold text-sm tracking-tight">{name || 'Component'}</h3>
                            </motion.div>
                        </div>
                        {isDeletable && (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                    onClick={onDelete}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Scrollable properties with animated content */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto mt-0">
                    <motion.div
                        key="content-panel"
                        variants={contentVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.15 }}
                    >
                        <CraftPropertiesPanel />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}


// Palette View Component
import { SavedComponentsPanel } from "./SavedComponentsPanel"
import { BookTemplate } from "lucide-react"

const PaletteView = ({ isArticlePage, editorMode, siteId }: { isArticlePage: boolean; editorMode: "page" | "header" | "footer", siteId?: string }) => {
    const [activeTab, setActiveTab] = useState("elements")

    return (
        <>
            <Tabs
                key="palette"
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex flex-col h-full"
            >
                {/* Premium Tab Navigation */}
                <motion.div
                    className="sticky top-0 z-10 backdrop-blur-xl bg-background/95 border-b"
                    variants={headerVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 0.2 }}
                >
                    <div className="p-4">
                        <motion.h2
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            Builder
                        </motion.h2>
                        <TabsList className="w-full grid grid-cols-4 gap-1 bg-muted/50 p-1 h-auto rounded-lg">
                            <TabsTrigger
                                value="elements"
                                className={cn(
                                    "relative flex items-center justify-center gap-1 px-1 py-2 rounded-md transition-all duration-200",
                                    "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                    "hover:bg-background/50"
                                )}
                            >
                                <Package className="w-4 h-4" />
                            </TabsTrigger>

                            <TabsTrigger
                                value="saved"
                                className={cn(
                                    "relative flex items-center justify-center gap-1 px-1 py-2 rounded-md transition-all duration-200",
                                    "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                    "hover:bg-background/50"
                                )}
                            >
                                <BookTemplate className="w-4 h-4" />
                            </TabsTrigger>

                            <TabsTrigger
                                value="design"
                                className={cn(
                                    "relative flex items-center justify-center gap-1 px-1 py-2 rounded-md transition-all duration-200",
                                    "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                    "hover:bg-background/50"
                                )}
                            >
                                <Palette className="w-4 h-4" />
                            </TabsTrigger>
                            <TabsTrigger
                                value="seo"
                                className={cn(
                                    "relative flex items-center justify-center gap-1 px-1 py-2 rounded-md transition-all duration-200",
                                    "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                    "hover:bg-background/50",
                                    (editorMode !== "page") && "opacity-50 cursor-not-allowed"
                                )}
                                disabled={editorMode !== 'page'}
                            >
                                <Search className="w-4 h-4" />
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </motion.div>

                {/* Tab Content with animations */}
                <AnimatePresence mode="wait">
                    <TabsContent value="elements" className="flex-1 mt-0 overflow-hidden" asChild>
                        <motion.div
                            key="elements-tab"
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.15 }}
                            className="h-full"
                        >
                            <CraftToolbox isArticlePage={isArticlePage} />
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    <TabsContent value="saved" className="flex-1 mt-0 overflow-hidden" asChild>
                        <motion.div
                            key="saved-tab"
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.15 }}
                            className="h-full"
                        >
                            <SavedComponentsPanel siteId={siteId} />
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    <TabsContent value="design" className="flex-1 mt-0 overflow-y-auto" asChild>
                        <motion.div
                            key="design-tab"
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.15 }}
                        >
                            <DesignPanel />
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    <TabsContent value="seo" className="flex-1 mt-0 overflow-y-auto" asChild>
                        <motion.div
                            key="seo-tab"
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.15 }}
                            className="h-full"
                        >
                            <SEOPanel onBack={() => setActiveTab("elements")} />
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>

        </>
    )
}
