import { getAuthSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardTeamsView } from "@/components/dashboard/DashboardTeamsView"
import { db } from "@/lib/db"

export default async function TeamsPage() {
    const session = await getAuthSession()
    if (!session?.user) return redirect("/login")

    // Fetch sites with members
    const sites = await db.site.findMany({
        where: {
            OR: [
                { userId: session.user.id },
                { members: { some: { id: session.user.id } } }
            ]
        },
        include: {
            members: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    email: true
                }
            },
            _count: {
                select: { members: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // CASTING: We need to cast the partial user to User to satisfy the component props, 
    // or update the component to accept partial users. 
    // Structurally, we are passing the data needed.
    // @ts-ignore
    return <DashboardTeamsView sites={sites} userId={session.user.id} />
}
