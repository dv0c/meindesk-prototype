import { DomainsSettings } from "@/components/Settings/DomainsSettings"
import { getActiveTeam } from "@/lib/actions/helpers/team"

export default async function SettingsDomainsPage({ params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = await params
    const team = await getActiveTeam(siteId)
    if (!team) return <div>Site not found</div>

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Domains</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your custom domains and subdomains.
                </p>
            </div>
            <DomainsSettings site={team} />
        </div>
    )
}
