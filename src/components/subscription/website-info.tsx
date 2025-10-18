import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Calendar, Package } from "lucide-react"

export function WebsiteInfo() {
  // Mock data - replace with actual website data
  const websiteData = {
    name: "Sophia Platanisioti",
    url: "www.sophiaplatanisioti.gr",
    plan: "Custom",
    createdDate: "January 15, 2023",
    status: "Active",
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
            <p className="text-sm text-green-300">{websiteData.status}</p>
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
