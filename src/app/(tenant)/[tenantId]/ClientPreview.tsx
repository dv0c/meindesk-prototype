"use client"

import { useEffect, memo } from "react"
import { Editor, Frame } from "@craftjs/core"
import { resolverWithFallback } from "@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/user-components/registry"
import { PageData } from "@/lib/types"
import { DesignSystemStyles } from "@/components/DesignSystemStyles"
import { DesignSettings } from "@/lib/design-system"

import { EditorThemeProvider } from "@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/ThemeContext"


interface ClientPreviewProps {
  tenantId: string
  page: PageData
  headerContent?: any
  footerContent?: any
}

function ClientPreview({ tenantId, page, headerContent, footerContent }: ClientPreviewProps) {
  // Set teamId in localStorage for any components that need it
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("teamId_session-key", tenantId)
    }
  }, [tenantId])

  // CraftJS stores layout as [craftState] where craftState is the serialized editor state
  const craftStateObj = page.layout?.[0]

  // Sanitize the Page ROOT node to ensure it's never hidden (prevents White Screen issues)
  const pageRoot = craftStateObj?.nodes?.ROOT || craftStateObj?.ROOT
  if (pageRoot?.props?.responsive?.hiddenOn) {
    pageRoot.props.responsive.hiddenOn = []
  }

  const craftStateJson = craftStateObj ? JSON.stringify(craftStateObj) : null

  // Extract design settings from page metadata
  const designSettings = (page as any).meta?.design as DesignSettings | undefined

  // Helper to namespace Root IDs to prevent CSS collisions
  const namespaceRootId = (content: any, newRootId: string) => {
    // Check if content itself is the nodes map (standard CraftJS serialization)
    // Structure: { "ROOT": { ... }, "node-1": { ... } }
    if (!content || !content.ROOT) return content

    const nodes = JSON.parse(JSON.stringify(content)) // Deep clone the whole map
    const rootNode = nodes.ROOT

    // 1. Rename ROOT key to newRootId
    nodes[newRootId] = { ...rootNode, id: newRootId }
    delete nodes.ROOT

    // 2. Update children to point to new parent ID
    // Children of Root need to know their parent changed from "ROOT" to newRootId
    if (rootNode.nodes && rootNode.nodes.length > 0) {
      rootNode.nodes.forEach((childId: string) => {
        if (nodes[childId]) {
          nodes[childId].parent = newRootId
        }
      })
    }

    // 3. Update linked nodes parents if any
    if (rootNode.linkedNodes) {
      Object.values(rootNode.linkedNodes).forEach((linkedId: any) => {
        if (nodes[linkedId]) {
          nodes[linkedId].parent = newRootId
        }
      })
    }

    // 4. Update parent pointers of any node that explicitly points to ROOT (sanity check)
    Object.keys(nodes).forEach(key => {
      if (nodes[key].parent === "ROOT") {
        nodes[key].parent = newRootId
      }
    })

    return nodes
  }

  // Pre-process Header/Footer to have unique Root IDs
  const processedHeader = headerContent ? namespaceRootId(headerContent, "HEADER_ROOT") : null
  const processedFooter = footerContent ? namespaceRootId(footerContent, "FOOTER_ROOT") : null

  return (
    <main className="min-h-screen flex flex-col">
      <DesignSystemStyles settings={designSettings} />
      <EditorThemeProvider>

        {/* Header */}
        {processedHeader && (
          <div className="w-full z-50 relative">
            <Editor enabled={false} resolver={resolverWithFallback}>
              <Frame json={JSON.stringify(processedHeader)} />
            </Editor>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1">
          {craftStateJson ? (
            <Editor enabled={false} resolver={resolverWithFallback}>
              <Frame json={craftStateJson} />
            </Editor>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-lg text-muted-foreground">This page is empty</p>
                <p className="text-sm text-muted-foreground mt-2">Add components in the editor to see them here</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {processedFooter && (
          <div className="w-full relative mt-auto">
            <Editor enabled={false} resolver={resolverWithFallback}>
              <Frame json={JSON.stringify(processedFooter)} />
            </Editor>
          </div>
        )}

      </EditorThemeProvider>
    </main>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ClientPreview)
