import { getActiveTeam } from "@/lib/actions/helpers/team"
import { redirect } from "next/navigation"

export default async function Page({ params }: { params: { siteId: string } }) {
  const { siteId } = await params
  const site = await getActiveTeam(siteId)
  if (!site) return redirect('/')
  return <div className="flex flex-1 flex-col h-full w-full">
    <iframe className="h-[calc(100vh-100px)]" src={site?.url} />
  </div>
}
