import { getCachedSiteDetails } from "@/lib/actions/helpers/cached-tenant"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"

export default async function AdminRedirectNestedPage({
    params,
}: {
    params: Promise<{ tenantId: string; slug: string }>
}) {
    const { tenantId, slug } = await params
    const tenant = await getCachedSiteDetails(tenantId)

    if (!tenant) notFound()

    // Find specific page
    const page = await db.page.findFirst({
        where: {
            siteId: tenant.id,
            slug: slug
        },
        select: { id: true }
    })

    if (!page) notFound()

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    redirect(`${baseUrl}/dashboard/${tenant.id}/projects/website/canva/${page.id}`)
}
