import { getActiveTeam } from "@/lib/actions/helpers/team"
import { DomainSetupForm } from "@/components/DomainSetupForm"
import { redirect } from "next/navigation"

export default async function DomainSetupPage({ params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = await params
    const team = await getActiveTeam(siteId)

    if (!team) {
        return redirect("/dashboard")
    }

    return <DomainSetupForm siteId={siteId} />
}
