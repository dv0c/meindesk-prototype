import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSite } from "@/lib/actions/helpers/site"
import { getActiveTeam } from "@/lib/actions/helpers/team"
import { cn } from "@/lib/utils"
import { Globe, Calendar, Package } from "lucide-react"

export async function WebsiteInfo({ siteId }: { siteId: string }) {
  const data = await getActiveTeam(siteId)
  if (!data) return <div>Site not found</div>
  const websiteData = {
    name: "",
    url: "",
    plan: "Enterprise",
    createdDate: "",
    status: "Active",
  }

  if (data) {
    websiteData.name = data.title
    websiteData.url = data.url || "No URL provided"
    // websiteData.createdDate = data.createdAt.toDateString()
    websiteData.plan = data.subscription?.plan || "Not Implemented"
    websiteData.status = data.subscription?.status || "Error"
  }
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Website Information</CardTitle>
        <CardDescription>Your website details and status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Globe className="w-4 h-4" />
              <span>Website Name</span>
            </div>
            <p className="text-lg font-semibold">{websiteData.name}</p>
            <p className="text-sm text-muted-foreground">{websiteData.url}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Package className="w-4 h-4" />
              <span>Plan Type</span>
            </div>
            <p className="text-lg font-semibold">{websiteData.plan}</p>
            <p className={cn("text-sm", websiteData.status === "Active" ? "text-green-500" : "text-red-500")}>{websiteData.status}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="w-4 h-4" />
              <span>Created</span>
            </div>
            <p className="text-lg font-semibold">{websiteData.createdDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
