import { getSite } from "@/lib/actions/helpers/site"
import { getActiveTeam } from "@/lib/actions/helpers/team"

export default async function Page({ params }: { params: { siteId: string } }) {
  const site = await getActiveTeam(params.siteId)
  if (!site) return <div>Site not found.</div>
  return <iframe className="h-full rounded-lg" src={site?.url} />
}
