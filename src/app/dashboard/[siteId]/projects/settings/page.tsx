import { DeleteWebsite } from "@/components/Settings/DeleteSite"
import WebsiteSettings from "@/components/Settings/WebsiteSettings"
import { TeamSettings } from "@/components/Settings/TeamSettings"
import { getActiveTeam } from "@/lib/actions/helpers/team"
import { getAuthSession } from "@/lib/auth"

const page = async ({ params }: { params: { siteId: string } }) => {
  const { siteId } = await params
  const team = await getActiveTeam(siteId)
  if (!team) return <div>
    Site not found.
  </div>

  return (
    <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your project settings and preferences.
        </p>
      </div>
      <div className="grid gap-8">
        <WebsiteSettings site={team} />
        <TeamSettings siteId={team.id} isOwner={team.userId === (await getAuthSession())?.user?.id} />
        <DeleteWebsite siteId={team.id} />
      </div>
    </div>
  )
}

export default page