import { getCachedSiteDetails } from "@/lib/actions/helpers/cached-tenant"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { getAuthSession } from "@/lib/auth"

export default async function AdminRedirectPage({
    params,
}: {
    params: Promise<{ tenantId: string }>
}) {
    const { tenantId } = await params
    const tenant = await getCachedSiteDetails(tenantId)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    if (!tenant) notFound()

    // 1. Auth Check - Redirect to login if not authenticated
    const session = await getAuthSession()
    if (!session?.user) {
        redirect(baseUrl + "/login")
    }

    // 2. Ownership Check - Allow only Owner or System Admin
    const isOwner = tenant.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    // If user is neither the owner nor a system admin, block access
    // We can either 404 or redirect to Home. 404 is safer to not leak tenant existence/ownership?
    // But redirect to home is friendlier. Let's do notFound for security/obscurity or strictness.
    if (!isOwner && !isAdmin) {
        notFound()
    }

    // Find home page
    const homePage = await db.page.findFirst({
        where: {
            siteId: tenant.id,
            slug: "home"
        },
        select: { id: true }
    })

    if (!homePage) notFound()

    redirect(`${baseUrl}/dashboard/${tenant.id}/projects/website/canva/${homePage.id}`)
}
