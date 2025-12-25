"use client"

import { useEditor } from "@craftjs/core"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Settings, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { CraftToolbox } from "./CraftToolbox"
import { CraftPropertiesPanel } from "./CraftPropertiesPanel"
import { GlobalStylesPanel } from "./GlobalSettings"
import { DesignPanel } from "./DesignPanel"

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

    return (
        <div className="w-[380px] border-r bg-gradient-to-b from-background to-muted/20 flex flex-col h-full shadow-lg z-20">
            {selected ? (
                <Tabs key={selected || 'selected'} defaultValue="content" className="flex flex-col h-full">
                    {/* Header with glassmorphism effect */}
                    <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b">
                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full hover:bg-primary/10 transition-colors"
                                        onClick={() => actions.selectNode(undefined)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <div>
                                        <h3 className="font-semibold text-sm tracking-tight">{name || 'Component'}</h3>
                                    </div>
                                </div>
                                {isDeletable && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        onClick={() => {
                                            if (selected) actions.delete(selected)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <TabsList className="w-full grid grid-cols-2 gap-1 bg-muted/50 p-1 h-auto rounded-lg">
                                <TabsTrigger
                                    value="content"
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-2 rounded-md transition-all duration-200",
                                        "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                        "data-[state=active]:scale-[0.98]",
                                        "hover:bg-background/50"
                                    )}
                                >
                                    <Settings className="w-3.5 h-3.5 mr-2" />
                                    <span className="font-medium text-xs">Content</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="styles"
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-2 rounded-md transition-all duration-200",
                                        "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                        "data-[state=active]:scale-[0.98]",
                                        "hover:bg-background/50"
                                    )}
                                >
                                    <Palette className="w-3.5 h-3.5 mr-2" />
                                    <span className="font-medium text-xs">Styles</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    {/* Scrollable properties */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <TabsContent value="content" className="flex-1 overflow-y-auto mt-0">
                            <CraftPropertiesPanel />
                        </TabsContent>
                        <TabsContent value="styles" className="flex-1 overflow-y-auto mt-0 px-4 py-2">
                            <GlobalStylesPanel />
                        </TabsContent>
                    </div>
                </Tabs>
            ) : (
                // Main Palette View - Modern tabs with icons
                <Tabs key="palette" defaultValue="elements" className="flex flex-col h-full">
                    {/* Premium Tab Navigation */}
                    <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/95 border-b">
                        <div className="p-4">
                            <h2 className="text-lg font-bold tracking-tight mb-4">CraftJS Builder</h2>
                            <TabsList className="w-full grid grid-cols-2 gap-1 bg-muted/50 p-1 h-auto rounded-lg">
                                <TabsTrigger
                                    value="elements"
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-2 rounded-md transition-all duration-200",
                                        "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                        "data-[state=active]:scale-[0.98]",
                                        "hover:bg-background/50"
                                    )}
                                >
                                    <Package className="w-4 h-4" />
                                    <span className="font-medium text-xs">Elements</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="settings"
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-2 rounded-md transition-all duration-200",
                                        "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                                        "data-[state=active]:scale-[0.98]",
                                        "hover:bg-background/50"
                                    )}
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="font-medium text-xs">Settings</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <TabsContent value="elements" className="flex-1 mt-0 overflow-hidden">
                        <CraftToolbox />
                    </TabsContent>

                    <TabsContent value="settings" className="flex-1 mt-0 overflow-y-auto">
                        <DesignPanel />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
