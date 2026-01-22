import { getSites } from "@/lib/actions/helpers/site"
import { redirect } from "next/navigation"
import { DashboardProjectsView } from "@/components/dashboard/DashboardProjectsView"
import { getAuthSession } from "@/lib/auth"

const page = async () => {
    const session = await getAuthSession()
    if (!session?.user) return redirect("/login")

    const sites = await getSites()

    // If no sites at all, maybe redirect to setup? 
    // Or just show empty dashboard. Vercel shows empty dashboard. 
    // But existing logic was redirect setup. I'll keep redirect if 0 sites for now to avoid confusion, 
    // or arguably showing the dashboard with "Create Project" is better. 
    // Let's show the dashboard even if empty, it's better UX.
    if (!sites || sites.length === 0) {
        return redirect('/setup')
    }

    return <DashboardProjectsView sites={sites} />
}

export default page