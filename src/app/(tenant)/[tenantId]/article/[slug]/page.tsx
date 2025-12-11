// app/(tenant)/[tenantId]/[slug]/page.tsx

import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import type { PageData } from "@/lib/types"
import ClientPreview from "../../ClientPreview";

export default async function TenantPage({
  params,
}: {
  params: { tenantId: string; slug: string }
}) {
  const { tenantId, slug } = await params

  // 1. Confirm tenant exists
  const tenant = await db.site.findUnique({
    where: { id: tenantId },
    select: { id: true, title: true },
  })
  if (!tenant) notFound()

  // 2. Find the /article page (pre-configured for tenants)
  const articlePageRecord = await db.page.findFirst({
    where: {
      slug: "article",
      siteId: tenantId,
    },
    select: { id: true },
  })
  if (!articlePageRecord) notFound()

  // 3. Fetch through API for consistent rendering logic
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const response = await fetch(`${baseUrl}/api/v1/${tenant.id}/pages/${articlePageRecord.id}`, {
    cache: "no-store",
  })

  if (!response.ok) notFound()
  const page: PageData = await response.json()

  // 4. Reuse your client renderer
  return <ClientPreview tenantId={tenant.id} page={page} />
}
