"use client"

import { useEditor } from "@craftjs/core"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Trash2, FileCode } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Palette, LayoutTemplate } from "lucide-react"
import { cn } from "@/lib/utils"
import { CraftToolbox } from "./CraftToolbox"
import { CraftPropertiesPanel } from "./CraftPropertiesPanel"
import { GlobalStylesPanel } from "./GlobalSettings"
import { DesignPanel } from "./DesignPanel"
import { TemplatesDialog } from "./TemplatesDialog"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

// Animation variants
const slideVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
}

const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
}

const contentVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
}

const headerVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
}

export function CraftSidebar() {
    const { selected, name, isDeletable, actions } = useEditor((state) => {
        const currentNodeId = state.events.selected?.values().next().value
        const node = currentNodeId ? state.nodes[currentNodeId] : null
        return {
            selected: currentNodeId,
            name: node?.data.custom.displayName || node?.data.displayName || node?.data.name,
            isDeletable: node && node.data.custom.isDeletable !== false,
        }
    })

    // Track the current view for animations
    const [currentView, setCurrentView] = useState<"palette" | "properties">(selected ? "properties" : "palette")

    useEffect(() => {
        setCurrentView(selected ? "properties" : "palette")
    }, [selected])

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
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex flex-col h-full"
                    >
                        <PropertiesView
                            selected={selected}
                            name={name}
                            isDeletable={isDeletable}
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
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex flex-col h-full"
                    >
                        <PaletteView />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Properties View Component
function PropertiesView({
    selected,
    name,
    isDeletable,
    onBack,
    onDelete
}: {
    selected: string
    name?: string
    isDeletable?: boolean
    onBack: () => void
    onDelete: () => void
}) {
    const [activeTab, setActiveTab] = useState("content")

    return (
        <Tabs
            key={selected || 'selected'}
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col h-full"
        >
            {/* Header with glassmorphism effect */}
            <motion.div
                className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b"
                variants={headerVariants}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.2, delay: 0.1 }}
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

                    <TabsList className="w-full grid grid-cols-2 gap-1 bg-muted/50 p-1 h-auto rounded-lg">
                        <TabsTrigger
                            value="content"
                            className={cn(
                                "relative flex items-center gap-1 px-2 py-2 rounded-md transition-all duration-200",
                                "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                "hover:bg-background/50"
                            )}
                        >
                            <Palette className="w-3.5 h-3.5 mr-2" />
                            <span className="font-medium text-xs">Content</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="styles"
                            className={cn(
                                "relative flex items-center gap-1 px-2 py-2 rounded-md transition-all duration-200",
                                "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                "hover:bg-background/50"
                            )}
                        >
                            <Palette className="w-3.5 h-3.5 mr-2" />
                            <span className="font-medium text-xs">Styles</span>
                        </TabsTrigger>
                    </TabsList>
                </div>
            </motion.div>

            {/* Scrollable properties with animated content */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                    <TabsContent value="content" className="flex-1 overflow-y-auto mt-0" asChild>
                        <motion.div
                            key="content-tab"
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.15 }}
                        >
                            <CraftPropertiesPanel />
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                    <TabsContent value="styles" className="flex-1 overflow-y-auto mt-0 px-4 py-2" asChild>
                        <motion.div
                            key="styles-tab"
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.15 }}
                        >
                            <GlobalStylesPanel />
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </div>
        </Tabs>
    )
}

// Palette View Component
const PaletteView = () => {
    const [activeTab, setActiveTab] = useState("elements")
    const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)

    // When templates tab is clicked, open dialog and switch back to elements
    useEffect(() => {
        if (activeTab === "templates") {
            setShowTemplatesDialog(true)
            setActiveTab("elements") // Switch back to elements tab
        }
    }, [activeTab])

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
                            className="text-lg font-bold tracking-tight mb-4"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            Builder
                        </motion.h2>
                        <TabsList className="w-full grid grid-cols-3 gap-1 bg-muted/50 p-1 h-auto rounded-lg">
                            <TabsTrigger
                                value="elements"
                                className={cn(
                                    "relative flex items-center gap-1 px-2 py-2 rounded-md transition-all duration-200",
                                    "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                    "hover:bg-background/50"
                                )}
                            >
                                <Package className="w-4 h-4" />
                                <span className="font-medium text-xs">Elements</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="templates"
                                className={cn(
                                    "relative flex items-center gap-1 px-2 py-2 rounded-md transition-all duration-200",
                                    "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                    "hover:bg-background/50"
                                )}
                            >
                                <LayoutTemplate className="w-4 h-4" />
                                <span className="font-medium text-xs">Templates</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="design"
                                className={cn(
                                    "relative flex items-center gap-1 px-2 py-2 rounded-md transition-all duration-200",
                                    "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                    "hover:bg-background/50"
                                )}
                            >
                                <Palette className="w-4 h-4" />
                                <span className="font-medium text-xs">Design</span>
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
                            <CraftToolbox />
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    <TabsContent value="templates" className="flex-1 mt-0 overflow-hidden" asChild>
                        <motion.div
                            key="templates-tab"
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.15 }}
                            className="h-full flex items-center justify-center p-4"
                        >
                            <div className="text-center text-sm text-muted-foreground">
                                <LayoutTemplate className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">Templates</p>
                                <p className="text-xs mt-1">Use the Templates button in the header to insert templates</p>
                            </div>
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
            </Tabs>

            {/* Templates Dialog */}
            <TemplatesDialog
                open={showTemplatesDialog}
                onOpenChange={setShowTemplatesDialog}
            />
        </>
    )
}
