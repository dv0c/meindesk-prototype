import { getSite } from "@/lib/actions/helpers/site"

export default async function Page() {
  const site = await getSite()
  if (!site) return <div>Site not found.</div>
  return <iframe className="h-full rounded-lg" src={site?.url} />
}
