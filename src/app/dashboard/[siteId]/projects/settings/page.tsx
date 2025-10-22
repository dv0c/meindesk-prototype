import { DeleteWebsite } from "@/components/Settings/DeleteSite"
import WebsiteSettings from "@/components/Settings/WebsiteSettings"
import { getActiveTeam } from "@/lib/actions/helpers/team"

const page = async ({ params }: { params: { siteId: string } }) => {
  const { siteId } = await params
  const team = await getActiveTeam(siteId)
  if (!team) return <div>
    Site not found.
  </div>

  return <div className="gap-6 flex flex-col">
    <WebsiteSettings site={team} />
    <DeleteWebsite siteId={team.id} />
  </div>
}

export default page