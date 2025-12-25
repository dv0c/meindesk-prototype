"use client"

import { useEditor } from "@craftjs/core"
import { Button } from "@/components/ui/button"
import { ChevronLeft, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { CraftToolbox } from "./CraftToolbox"
import { CraftPropertiesPanel } from "./CraftPropertiesPanel"

export function CraftSidebar() {
    const { selected, actions } = useEditor((state) => {
        const currentNodeId = state.events.selected?.values().next().value
        return {
            selected: currentNodeId,
        }
    })

    return (
        <div className="w-[380px] border-r bg-gradient-to-b from-background to-muted/20 flex flex-col h-full shadow-lg z-20">
            {selected ? (
                // Properties Panel View
                <div className="flex flex-col h-full">
                    {/* Header with glassmorphism effect */}
                    <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b">
                        <div className="p-4 flex items-center justify-between">
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
                                    <h3 className="font-semibold text-sm tracking-tight">Component Settings</h3>
                                    <p className="text-xs text-muted-foreground">Edit properties</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                                onClick={() => actions.selectNode(undefined)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Scrollable properties */}
                    <div className="flex-1 overflow-y-auto">
                        <CraftPropertiesPanel />
                    </div>
                </div>
            ) : (
                // Main Palette View - Modern tabs with icons
                <Tabs defaultValue="elements" className="flex flex-col h-full">
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

                    <TabsContent value="settings" className="flex-1 mt-0 overflow-hidden">
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            Global settings coming soon
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
