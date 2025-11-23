// app/(tenant)/[tenantId]/page.tsx

import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import type { PageData } from "@/lib/types"
import ClientPreview from "./ClientPreview" // Direct import — it's already client-side

export default async function PreviewPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = await params

  const tenant = await db.site.findUnique({
    where: { id: tenantId },
    select: { id: true, title: true, description: true, home_Id: true },
  })
  if (!tenant) notFound()
  if (tenant.home_Id === null) notFound()

  const mainPage = await db.page.findUnique({
    where: { slug: tenant?.home_Id as string }, select: { id: true }
  })

  if (!mainPage) notFound()


  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const response = await fetch(`${baseUrl}/api/v1/${tenant.id}/pages/${mainPage.id}`, {
    cache: "no-store",
  })

  if (!response.ok) notFound()
  const page: PageData = await response.json()

  return <ClientPreview tenantId={tenant.id} page={page} />
}
