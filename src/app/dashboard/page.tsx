import { getSites } from "@/lib/actions/helpers/site"
import { redirect } from "next/navigation"
import { DashboardProjectsView } from "@/components/dashboard/DashboardProjectsView"
import { getAuthSession } from "@/lib/auth"

const page = async () => {
    const session = await getAuthSession()
    if (!session?.user) return redirect("/login")

    const sites = await getSites()

    // If no sites at all, we now show the dashboard instead of forcing setup
    // to allow members (who might have been invited but have no owned sites) to navigate.
    /*
    if (!sites || sites.length === 0) {
        return redirect('/setup')
    }
    */

    return <DashboardProjectsView sites={sites} userId={session.user.id} />
}

export default page