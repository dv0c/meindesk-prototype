"use client"

import { useEffect, memo } from "react"
import { Editor, Frame } from "@craftjs/core"
import { resolverWithFallback } from "@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/user-components/registry"
import { PageData } from "@/lib/types"
import { DesignSystemStyles } from "@/components/DesignSystemStyles"
import { DesignSettings } from "@/lib/design-system"

interface ClientPreviewProps {
  tenantId: string
  page: PageData
}

function ClientPreview({ tenantId, page }: ClientPreviewProps) {
  // Set teamId in localStorage for any components that need it
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("teamId_session-key", tenantId)
    }
  }, [tenantId])

  // CraftJS stores layout as [craftState] where craftState is the serialized editor state
  // The craftState is a flat object with stringified JSON
  // We need to pass the serialized string to the Frame json prop, or deserialized object?
  // <Frame json={...}> accepts the serialized JSON string.

  // page.layout is Json[] from Prisma. 
  // In page.tsx (editor), we save implementation:
  // layout: [JSON.parse(json)] where json is query.serialize() which returns a string.
  // So page.layout[0] is an Object (the deserialized state).

  // CraftJS Frame `json` prop expects a string.
  const craftStateObj = page.layout?.[0]
  const craftStateJson = craftStateObj ? JSON.stringify(craftStateObj) : null

  if (!craftStateJson) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">This page is empty</p>
          <p className="text-sm text-muted-foreground mt-2">Add components in the editor to see them here</p>
        </div>
      </div>
    )
  }

  // Extract design settings from page metadata
  const designSettings = (page as any).meta?.design as DesignSettings | undefined

  return (
    <main>
      <DesignSystemStyles settings={designSettings} />
      <Editor
        enabled={false} // Read-only mode
        resolver={resolverWithFallback}
      >
        <Frame json={craftStateJson}>
          {/* Frame content is hydrated from json, children here are ignored/replaced */}
          <div />
        </Frame>
      </Editor>
    </main>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ClientPreview)
