"use client"

import { useEffect, useState } from "react"
import { RenderNode } from "@/app/dashboard/[siteId]/projects/website/(editor)/canva/[pageId]/components/render-node"
import type { PageData } from "@/lib/types"

interface ClientPreviewProps {
  tenantId: string
  page: PageData
}

export default function ClientPreview({ tenantId, page }: ClientPreviewProps) {
  useEffect(() => {
    localStorage.setItem("teamId_session-key", tenantId)
  }, [tenantId])

  return (
    <div className="min-h-screen bg-background">
      <main className="">
        {page.layout.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg text-muted-foreground">This page is empty</p>
              <p className="text-sm text-muted-foreground mt-2">Add components in the editor to see them here</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {page.layout.map((node) => (
              <RenderNode key={node.id} node={node} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
