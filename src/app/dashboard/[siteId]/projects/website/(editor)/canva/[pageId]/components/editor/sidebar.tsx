"use client"

import { Button } from "@/components/ui/button"
import { useBuilderStore } from "@/lib/store"
import { X, ChevronLeft, Settings, Package, Puzzle } from "lucide-react"
import type { ComponentDefinition, LayoutNode } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertiesPanel } from "./properties-panel"
import { ComponentPalette } from "./component-palette"
import { GlobalSettingsPanel } from "./global-settings-panel"
import { SnippetsPanel } from "./snippets-panel"
import { useSnippets } from "./snippets-context"
import { cn } from "@/lib/utils"

interface SidebarProps {
  onAddComponent: (component: ComponentDefinition) => void
  onUpdateNode: (updates: Partial<LayoutNode>) => void
  onUpdateSnippetContent?: (snippetId: string, contentNodeId: string, updates: Partial<LayoutNode>) => void
  onDeleteNode: () => void
  onInsertSnippet: (snippetId: string, snippetName: string) => void
  siteId?: string
  hideSnippets?: boolean
  hideSettings?: boolean
}

export function Sidebar({ onAddComponent, onUpdateNode, onUpdateSnippetContent, onDeleteNode, onInsertSnippet, siteId, hideSnippets, hideSettings }: SidebarProps) {
  const { selectedNodeId, selectNode, findNode } = useBuilderStore()
  const selectedNode = selectedNodeId ? findNode(selectedNodeId) : null
  const { getSnippet } = useSnippets()

  // Check if selected node is a SnippetRef and get its content
  const isSnippetRef = selectedNode?.type === "SnippetRef"
  const snippetId = isSnippetRef ? selectedNode?.snippetId : null
  const snippet = snippetId ? getSnippet(snippetId) : null

  // If it's a snippet ref, show the snippet's first content node for editing
  const nodeToEdit = isSnippetRef && snippet?.content?.[0] ? snippet.content[0] : selectedNode

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
              {/* Snippet Edit Mode Banner */}
              {isSnippetRef && snippet && (
                <div className="absolute -bottom-10 left-0 right-0 bg-purple-500/10 border-b border-purple-500/20 px-4 py-2 flex items-center gap-2">
                  <Puzzle className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    Editing Snippet: {snippet.name} - Changes apply to all pages
                  </span>
                </div>
              )}
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
          <div className={cn("flex-1 overflow-y-auto", isSnippetRef && "mt-10")}>
            <PropertiesPanel
              selectedNode={nodeToEdit}
              onUpdateNode={isSnippetRef && snippet && onUpdateSnippetContent
                ? (updates) => onUpdateSnippetContent(snippet.id, nodeToEdit!.id, updates)
                : onUpdateNode
              }
              onDeleteNode={onDeleteNode}
              siteId={siteId}
            />
          </div>
        </div>
      ) : (
        // Main Palette View - Modern tabs with icons
        <Tabs defaultValue="elements" className="flex flex-col h-full">
          {/* Premium Tab Navigation */}
          <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/95 border-b">
            <div className="p-4">
              <h2 className="text-lg font-bold tracking-tight mb-4">Builder</h2>
              <TabsList className={`w-full grid ${hideSnippets && hideSettings ? 'grid-cols-1' : hideSnippets || hideSettings ? 'grid-cols-2' : 'grid-cols-3'} gap-1 bg-muted/50 p-1 h-auto rounded-lg`}>
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
                {!hideSnippets && (
                  <TabsTrigger
                    value="snippets"
                    className={cn(
                      "flex items-center gap-1 px-2 py-2 rounded-md transition-all duration-200",
                      "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                      "data-[state=active]:scale-[0.98]",
                      "hover:bg-background/50"
                    )}
                  >
                    <Puzzle className="w-4 h-4" />
                    <span className="font-medium text-xs">Snippets</span>
                  </TabsTrigger>
                )}
                {!hideSettings && (
                  <TabsTrigger
                    value="global"
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
                )}
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="elements" className="flex-1 mt-0 overflow-hidden">
            <ComponentPalette onAddComponent={onAddComponent} siteId={siteId} />
          </TabsContent>

          {!hideSnippets && (
            <TabsContent value="snippets" className="flex-1 mt-0 overflow-hidden">
              {siteId ? (
                <SnippetsPanel siteId={siteId} onInsertSnippet={onInsertSnippet} />
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Site ID required for snippets
                </div>
              )}
            </TabsContent>
          )}

          {!hideSettings && (
            <TabsContent value="global" className="flex-1 mt-0 overflow-hidden">
              <GlobalSettingsPanel />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  )
}
