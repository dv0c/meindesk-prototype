// app/(tenant)/[tenantId]/page.tsx

import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import type { PageData } from "@/lib/types"
import { isValidObjectId } from "@/lib/actions/helpers/cached-tenant"
import ClientPreview from "./ClientPreview"

interface PreviewPageProps {
  params: { tenantId: string }
}

export default async function Page({ params }: PreviewPageProps) {
  const { tenantId } = await params

  if (!isValidObjectId(tenantId)) notFound()

  // Fetch tenant/site
  const tenant = await db.site.findUnique({
    where: { id: tenantId },
    select: { id: true, title: true, description: true, home_Id: true },
  })

  if (!tenant || !tenant.home_Id) notFound()

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

  if (!mainPage) notFound()

  // Fetch page data from API
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const response = await fetch(`${baseUrl}/api/v1/${tenant.id}/pages/${mainPage.id}`, {
    cache: "no-store", // always fresh
  })

  if (!response.ok) notFound()

  const page: PageData = await response.json()

  return <ClientPreview tenantId={tenant.id} page={page} />
}
