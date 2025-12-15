"use client"

import { useEffect, useMemo, memo } from "react"
import RenderNodePreview from "./RenderNodePreview"
import type { PageData } from "@/lib/types"

interface ClientPreviewProps {
  tenantId: string
  page: PageData
}

function ClientPreview({ tenantId, page }: ClientPreviewProps) {
  // Optimize localStorage update - only run when tenantId changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("teamId_session-key", tenantId)
    }
  }, [tenantId])

  // Memoize the rendered layout nodes to prevent re-creating on every render
  const renderedLayout = useMemo(() => {
    if (page.layout.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">This page is empty</p>
            <p className="text-sm text-muted-foreground mt-2">Add components in the editor to see them here</p>
          </div>
        </div>
      )
    }

    return (
      <main>
        {page.layout.map((node) => (
          <RenderNodePreview key={node.id} node={node} />
        ))}
      </main>
    )
  }, [page.layout])

  return (
    <div>
      <main>{renderedLayout}</main>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(ClientPreview)
