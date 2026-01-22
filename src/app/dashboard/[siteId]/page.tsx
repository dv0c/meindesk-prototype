import { getActiveTeam } from "@/lib/actions/helpers/team"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ExternalLink, Github, GitBranch, Clock, MoreVertical, Globe, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { ProjectAnalyticsSummary } from "@/components/dashboard/ProjectAnalyticsSummary"

export default async function ProjectDashboard({ params }: { params: { siteId: string } }) {
  const { siteId } = await params
  const site = await getActiveTeam(siteId)

  if (!site) return redirect("/dashboard")

  const productionUrl = site.url && site.url !== `${site.subdomain}.meindesk.gr`
    ? site.url
    : `${site.subdomain}.meindesk.gr`

  const fullUrl = productionUrl.startsWith('http') ? productionUrl : `https://${productionUrl}`

  return (
    <div className="flex flex-col gap-6 md:p-6 p-4 max-w-7xl mx-auto w-full">
      {/* Project Header actions could go here if moving out of sidebar/topbar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{site.title}</h1>
        <div className="flex gap-2">
          <Link href={fullUrl} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit
            </Button>
          </Link>
        </div>
      </div>

      {/* Production Deployment Card */}
      <div className="grid grid-cols-1 gap-6">
        {/* Main Column */}
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-medium mb-4">Production Deployment</h2>
            <div className="border rounded-lg overflow-hidden bg-background">
              <div className="aspect-video w-full bg-muted/10 relative group border-b">
                <iframe
                  src={fullUrl}
                  className="w-full h-full object-cover pointer-events-none border-0"
                  tabIndex={-1}
                  loading="lazy"
                  scrolling="no"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">Deployment</div>
                  <div className="font-mono truncate">
                    <Link href={fullUrl} target="_blank" className="hover:underline">
                      {productionUrl}
                    </Link>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">Domains</div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-full border">
                      <Globe className="w-3 h-3" />
                      {productionUrl}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Ready
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs">Created</div>
                  <div>{formatDistanceToNow(new Date(site.createdAt), { addSuffix: true })}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Analytics Section */}
          <ProjectAnalyticsSummary siteId={site.id} />
        </div>
      </div>
    </div>
  )
}
