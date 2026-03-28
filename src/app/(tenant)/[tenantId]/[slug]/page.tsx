// app/(tenant)/[tenantId]/[slug]/page.tsx

import { getCachedSiteDetails } from "@/lib/actions/helpers/cached-tenant"
import { db } from "@/lib/db"
import type { PageData } from "@/lib/types"
import { notFound } from "next/navigation"
import ClientPreview from "../ClientPreview"; // adjust path if needed

import { Metadata } from "next"

// Shared data fetcher
async function getPageData(tenantId: string, slug: string) {
  // Fetch tenant/site using cached helper with smart fallback
  const tenant = await getCachedSiteDetails(tenantId)
  if (!tenant) return null

  // 2. Get the specific page under that tenant
  const pageRecord = await db.page.findFirst({
    where: { slug, siteId: tenantId },
    select: { id: true },
  })
  if (!pageRecord) return null

  // 3. Fetch through API for consistent rendering logic
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const response = await fetch(`${baseUrl}/api/v1/${tenant.id}/pages/${pageRecord.id}`, {
    cache: "no-store",
  })

  if (!response.ok) return null
  const page: PageData = await response.json()

  // 4. Fetch Global Header and Footer Snippets
  const headerSnippet = await db.snippet.findFirst({
    where: { siteId: tenantId, category: "header" },
    select: { content: true }
  })

  const footerSnippet = await db.snippet.findFirst({
    where: { siteId: tenantId, category: "footer" },
    select: { content: true }
  })

  return { tenant, page, headerSnippet, footerSnippet }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenantId: string; slug: string }>
}): Promise<Metadata> {
  const { tenantId, slug } = await params
  const data = await getPageData(tenantId, slug)

  if (!data) return {}

  const { page, tenant } = data
  const seo = (page.meta?.seo || {}) as {
    title?: string
    description?: string
    ogImage?: string
    favicon?: string
    preventIndexing?: boolean
    keywords?: string
  }

  const title = seo.title || page.title || tenant.title || "Untitled"
  const description = seo.description || tenant.description || ""

  return {
    title,
    description,
    keywords: seo.keywords ? seo.keywords.split(',').map(k => k.trim()) : [],
    openGraph: {
      title,
      description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
      type: 'website',
    },
    icons: seo.favicon || (tenant.settings as any)?.favicon ? {
      icon: seo.favicon || (tenant.settings as any)?.favicon
    } : undefined,
    robots: {
      index: !seo.preventIndexing,
      follow: !seo.preventIndexing,
    }
  }
}

export default async function TenantPage({
  params,
}: {
  params: Promise<{ tenantId: string; slug: string }>
}) {
  const { tenantId, slug } = await params
  const data = await getPageData(tenantId, slug)

  if (!data) notFound()

  // 4. Reuse your client renderer
  return (
    <ClientPreview
      tenantId={data.tenant.id}
      page={data.page}
      headerContent={data.headerSnippet?.content}
      footerContent={data.footerSnippet?.content}
    />
  )
}

