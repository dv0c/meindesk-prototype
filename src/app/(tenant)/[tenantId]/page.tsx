
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { isValidObjectId } from "@/lib/actions/helpers/cached-tenant"
import ClientPreview from "./ClientPreview"
import { PageData } from "@/lib/types"
import { Metadata } from "next"

interface PreviewPageProps {
  params: { tenantId: string }
}

async function getPageData(tenantId: string) {
  if (!isValidObjectId(tenantId)) return null

  // Fetch tenant/site
  const tenant = await db.site.findUnique({
    where: { id: tenantId },
    select: { id: true, title: true, description: true, home_Id: true, settings: true },
  })

  if (!tenant || !tenant.home_Id) return null

  // Fetch main page using compound unique: slug + siteId
  const mainPage = await db.page.findUnique({
    where: {
      slug_siteId: {
        slug: tenant.home_Id,
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
    icons: {
      icon: seo.favicon || (tenant.settings as any)?.favicon || '/favicon.ico'
    },
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
