import { FeaturesSettings } from "@/components/Settings/FeaturesSettings"
import { getActiveTeam } from "@/lib/actions/helpers/team"

export default async function SettingsFeaturesPage({ params }: { params: { siteId: string } }) {
    const { siteId } = await params
    const team = await getActiveTeam(siteId)
    if (!team) return <div>Site not found</div>

    return (
        <div className="space-y-6">
            {/* Header is handled inside component or here? Component has its own header. Let's keep it simple here. */}
            <FeaturesSettings site={team} />
        </div>
    )
}
