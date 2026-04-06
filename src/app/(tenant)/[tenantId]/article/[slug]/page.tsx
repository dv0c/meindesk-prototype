// app/(tenant)/[tenantId]/article/[slug]/page.tsx

import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import type { PageData } from "@/lib/types"
import { isValidObjectId } from "@/lib/actions/helpers/cached-tenant"
import { getPageWithChildrenJson } from "@/lib/server/get-page-with-children"
import ClientPreview from "../../ClientPreview"

export default async function TenantPage({
  params,
}: {
  params: Promise<{ tenantId: string; slug: string }>
}) {
  const { tenantId, slug } = await params

  if (!isValidObjectId(tenantId)) notFound()

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

  const raw = await getPageWithChildrenJson(tenant.id, articlePageRecord.id)
  if (!raw) notFound()

  const page = raw as unknown as PageData

  const headerSnippet = await db.snippet.findFirst({
    where: { siteId: tenantId, category: "header" },
    select: { content: true },
  })

  const footerSnippet = await db.snippet.findFirst({
    where: { siteId: tenantId, category: "footer" },
    select: { content: true },
  })

  return (
    <ClientPreview
      tenantId={tenant.id}
      page={page}
      headerContent={headerSnippet?.content}
      footerContent={footerSnippet?.content}
    />
  )
}
