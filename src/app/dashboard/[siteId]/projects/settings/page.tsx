import { GeneralSettings } from "@/components/Settings/GeneralSettings"
import { DeleteWebsite } from "@/components/Settings/DeleteSite"
import { getActiveTeam } from "@/lib/actions/helpers/team"
import { getAuthSession } from "@/lib/auth"

export default async function SettingsGeneralPage({ params }: { params: { siteId: string } }) {
  const { siteId } = await params
  const team = await getActiveTeam(siteId)
  if (!team) return <div>Site not found</div>

  const session = await getAuthSession()
  const isOwner = team.userId === session?.user?.id

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">General</h3>
        <p className="text-sm text-muted-foreground">
          Update your project name and other general settings.
        </p>
      </div>

      <GeneralSettings site={team} />

      {isOwner && (
        <div className="mt-10">
          <DeleteWebsite siteId={team.id} />
        </div>
      )}
    </div>
  )
}