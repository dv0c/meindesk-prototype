import { getSite } from "@/lib/actions/helpers/site";

export default async function Page() {
  const site = await getSite()
  if (!site) {
    return <div className="flex flex-1 items-center justify-center p-4">
      <p className="text-muted-foreground">Site not found.</p>
    </div>
  }
  return <div className="flex flex-1 flex-col gap-4 p-4">
    Welcome back
  </div>
}
