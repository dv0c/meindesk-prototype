import { getCachedSiteDetails } from "@/lib/actions/helpers/cached-tenant"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"

export default async function AdminRedirectPage({
    params,
}: {
    params: Promise<{ tenantId: string }>
}) {
    const { tenantId } = await params
    const tenant = await getCachedSiteDetails(tenantId)

    if (!tenant) notFound()

    // Find home page
    const homePage = await db.page.findFirst({
        where: {
            siteId: tenant.id,
            slug: "home"
        },
        select: { id: true }
    })

    if (!homePage) notFound()

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    redirect(`${baseUrl}/dashboard/${tenant.id}/projects/website/canva/${homePage.id}`)
}
