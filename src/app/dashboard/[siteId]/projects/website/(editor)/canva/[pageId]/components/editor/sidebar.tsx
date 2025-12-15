"use client"

import { Button } from "@/components/ui/button"
import { useBuilderStore } from "@/lib/store"
import { X, ChevronLeft, LayoutGrid, Globe, Settings, Package } from "lucide-react"
import type { ComponentDefinition } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertiesPanel } from "./properties-panel"
import { ComponentPalette } from "./component-palette"
import { GlobalSettingsPanel } from "./global-settings-panel"
import { cn } from "@/lib/utils"

interface SidebarProps {
  onAddComponent: (component: ComponentDefinition) => void
  onUpdateNode: (updates: Partial<import("@/lib/types").LayoutNode>) => void
  onDeleteNode: () => void
  siteId?: string
}

export function Sidebar({ onAddComponent, onUpdateNode, onDeleteNode, siteId }: SidebarProps) {
  const { selectedNodeId, selectNode, findNode } = useBuilderStore()
  const selectedNode = selectedNodeId ? findNode(selectedNodeId) : null

  return (
    <div className="w-[380px] border-r bg-gradient-to-b from-background to-muted/20 flex flex-col h-full shadow-lg z-20">
      {selectedNode ? (
        // Properties Panel View - Modern minimal design
        <div className="flex flex-col h-full">
          {/* Header with glassmorphism effect */}
          <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-primary/10 transition-colors"
                  onClick={() => selectNode(null)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h3 className="font-semibold text-sm tracking-tight">{selectedNode.type}</h3>
                  <p className="text-xs text-muted-foreground">Component Settings</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={() => selectNode(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Scrollable properties */}
          <div className="flex-1 overflow-y-auto">
            <PropertiesPanel selectedNode={selectedNode} onUpdateNode={onUpdateNode} onDeleteNode={onDeleteNode} siteId={siteId} />
          </div>
        </div>
      ) : (
        // Main Palette View - Modern tabs with icons
        <Tabs defaultValue="elements" className="flex flex-col h-full">
          {/* Premium Tab Navigation */}
          <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/95 border-b">
            <div className="p-4">
              <h2 className="text-lg font-bold tracking-tight mb-4">Builder</h2>
              <TabsList className="w-full grid grid-cols-2 gap-2 bg-muted/50 p-1 h-auto rounded-lg">
                <TabsTrigger
                  value="elements"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200",
                    "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                    "data-[state=active]:scale-[0.98]",
                    "hover:bg-background/50"
                  )}
                >
                  <Package className="w-4 h-4" />
                  <span className="font-medium text-xs">Elements</span>
                </TabsTrigger>
                <TabsTrigger
                  value="global"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-md transition-all duration-200",
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
            <ComponentPalette onAddComponent={onAddComponent} siteId={siteId} />
          </TabsContent>

          <TabsContent value="global" className="flex-1 mt-0 overflow-hidden">
            <GlobalSettingsPanel />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
