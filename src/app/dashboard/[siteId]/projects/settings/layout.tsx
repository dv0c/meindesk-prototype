import { SettingsLayout } from "@/components/Settings/SettingsLayout"
import { getActiveTeam } from "@/lib/actions/helpers/team"

export default async function SettingsLayoutWrapper({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ siteId: string }>
}) {
    const { siteId } = await params
    const team = await getActiveTeam(siteId)
    const mode = (team?.settings as any)?.mode || 'builder'

    return <SettingsLayout siteId={siteId} mode={mode}>{children}</SettingsLayout>
}
