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
  const craftStateJson = craftStateObj ? JSON.stringify(craftStateObj) : null

  // Extract design settings from page metadata
  const designSettings = (page as any).meta?.design as DesignSettings | undefined

  return (
    <main className="min-h-screen flex flex-col">
      <DesignSystemStyles settings={designSettings} />
      <EditorThemeProvider>

        {/* Header */}
        {headerContent && (
          <div className="w-full z-50 relative">
            <Editor enabled={false} resolver={resolverWithFallback}>
              <Frame json={JSON.stringify(headerContent)} />
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
        {footerContent && (
          <div className="w-full relative mt-auto">
            <Editor enabled={false} resolver={resolverWithFallback}>
              <Frame json={JSON.stringify(footerContent)} />
            </Editor>
          </div>
        )}

      </EditorThemeProvider>
    </main>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ClientPreview)
