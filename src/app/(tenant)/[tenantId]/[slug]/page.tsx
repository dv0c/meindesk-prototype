// app/(tenant)/[tenantId]/[slug]/page.tsx

import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import type { PageData } from "@/lib/types"
import { isValidObjectId } from "@/lib/actions/helpers/cached-tenant"
import ClientPreview from "../ClientPreview" // adjust path if needed

export default async function TenantPage({
  params,
}: {
  params: { tenantId: string; slug: string }
}) {
  const { tenantId, slug } = await params

  if (!isValidObjectId(tenantId)) notFound()

  // 1. Confirm tenant exists
  const tenant = await db.site.findUnique({
    where: { id: tenantId },
    select: { id: true, title: true },
  })
  if (!tenant) notFound()

  // 2. Get the specific page under that tenant
  const pageRecord = await db.page.findFirst({
    where: { slug, siteId: tenantId },
    select: { id: true },
  })
  if (!pageRecord) notFound()

  // 3. Fetch through API for consistent rendering logic
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const response = await fetch(`${baseUrl}/api/v1/${tenant.id}/pages/${pageRecord.id}`, {
    cache: "no-store",
  })

  if (!response.ok) notFound()
  const page: PageData = await response.json()

  // 4. Reuse your client renderer
  return <ClientPreview tenantId={tenant.id} page={page} />
}
