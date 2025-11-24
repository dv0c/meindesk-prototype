"use client"

import { Button } from "@/components/ui/button"
import { useBuilderStore } from "@/lib/store"
import { X, ChevronLeft, LayoutGrid, Globe } from "lucide-react"
import type { ComponentDefinition } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertiesPanel } from "./properties-panel"
import { ComponentPalette } from "./component-palette"
import { GlobalSettingsPanel } from "./global-settings-panel"

interface SidebarProps {
  onAddComponent: (component: ComponentDefinition) => void
  onUpdateNode: (updates: Partial<import("@/lib/types").LayoutNode>) => void
  onDeleteNode: () => void
}

export function Sidebar({ onAddComponent, onUpdateNode, onDeleteNode }: SidebarProps) {
  const { selectedNodeId, selectNode, findNode } = useBuilderStore()
  const selectedNode = selectedNodeId ? findNode(selectedNodeId) : null

  return (
    <div className="w-[340px] border-r bg-background flex flex-col h-full shadow-sm z-20 animate-in slide-in-from-left duration-300">
      {selectedNode ? (
        <div className="flex flex-col h-full pb-10 animate-in slide-in-from-left-10 duration-200">
          <div className="border-b p-3 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => selectNode(null)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold text-sm">Edit {selectedNode.type}</h3>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => selectNode(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <PropertiesPanel selectedNode={selectedNode} onUpdateNode={onUpdateNode} onDeleteNode={onDeleteNode} />
        </div>
      ) : (
        <Tabs defaultValue="elements" className="flex flex-col h-full">
          <div className="border-b px-2 bg-muted/20">
            <TabsList className="w-full justify-start gap-6 bg-transparent h-12 p-0 rounded-none">
              <TabsTrigger
                value="elements"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 pb-0"
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                ELEMENTS
              </TabsTrigger>
              <TabsTrigger
                value="global"
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 pb-0"
              >
                <Globe className="w-4 h-4 mr-2" />
                GLOBAL
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="elements" className="flex-1 mt-0 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <ComponentPalette onAddComponent={onAddComponent} />
            </div>
          </TabsContent>

          <TabsContent value="global" className="flex-1 mt-0 overflow-hidden">
            <div className="h-full overflow-y-auto">
              <GlobalSettingsPanel />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
