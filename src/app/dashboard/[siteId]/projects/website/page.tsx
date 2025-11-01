import { getActiveTeam } from "@/lib/actions/helpers/team"

export default async function Page({ params }: { params: { siteId: string } }) {
  const { siteId } = await params
  const site = await getActiveTeam(siteId)
  if (!site) return <div>Site not found.</div>
  return <div className="flex flex-1 flex-col h-full w-full">
    <iframe className="h-full" src={site?.url} />
  </div>
}
