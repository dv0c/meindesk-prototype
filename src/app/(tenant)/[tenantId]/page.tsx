
import { getCachedSiteDetails } from "@/lib/actions/helpers/cached-tenant"
import { db } from "@/lib/db"
import { PageData } from "@/lib/types"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import ClientPreview from "./ClientPreview"

interface PreviewPageProps {
  params: { tenantId: string }
}

async function getPageData(tenantId: string) {
  // Fetch tenant/site using cached helper with smart fallback
  const tenant = await getCachedSiteDetails(tenantId)

  if (!tenant || !tenant.home_Id) return null

  // Fetch main page using compound unique: slug + siteId - searching for 'home' slug as requested
  const mainPage = await db.page.findUnique({
    where: {
      slug_siteId: {
        slug: "home",
        siteId: tenant.id,
      },
    },
    select: { id: true },
  })

  if (!mainPage) return null

  // Fetch page data from API
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const response = await fetch(`${baseUrl}/api/v1/${tenant.id}/pages/${mainPage.id}`, {
    cache: "no-store", // always fresh
  })

  if (!response.ok) return null

  const page: PageData = await response.json()
  return { tenant, page }
}

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  const { tenantId } = await params
  const data = await getPageData(tenantId)

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

export default async function Page({ params }: PreviewPageProps) {
  const { tenantId } = await params
  const data = await getPageData(tenantId)

  if (!data) notFound()

  return <ClientPreview tenantId={data.tenant.id} page={data.page} />
}
