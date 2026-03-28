import { CreateArticleButton } from "@/components/CreateArticleButton"
import { ProjectAnalyticsSummary } from "@/components/dashboard/ProjectAnalyticsSummary"
import { ApiConsoleSheet } from "@/components/Settings/ApiConsoleSheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveTeam } from "@/lib/actions/helpers/team"
import { db } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { Activity, CheckCircle2, Database, ExternalLink, FileText, Globe, Layers, Plus, Zap } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function ProjectDashboard({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params
  const site = await getActiveTeam(siteId)

  if (!site) return redirect("/dashboard")

  const productionUrl = site.url && site.url !== `${site.subdomain}.meindesk.gr`
    ? site.url
    : `${site.subdomain}.meindesk.gr`

  const fullUrl = productionUrl.startsWith('http') ? productionUrl : `https://${productionUrl}`

  const isCMS = (site.settings as any)?.mode === 'cms'

  // Fetch Stats for CMS Mode
  let stats = { articles: 0, categories: 0, collections: 0, members: 0 }
  let recentArticles: any[] = []

  if (isCMS) {
    const [articleCount, categoryCount, collectionCount, recent] = await Promise.all([
      db.article.count({ where: { siteId } }),
      db.category.count({ where: { siteId } }),
      db.collection.count({ where: { siteId } }),
      db.article.findMany({
        where: { siteId },
        orderBy: { updateAt: 'desc' },
        take: 4,
        include: { author: true }
      })
    ])
    stats = { articles: articleCount, categories: categoryCount, collections: collectionCount, members: site.memberIds.length }
    recentArticles = recent
  }

  return (
    <div className="flex flex-col gap-6 md:p-6 p-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{site.title}</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {isCMS ? "HEADLESS CMS MODE" : "VISUAL BUILDER MODE"}
          </p>
        </div>

        {isCMS && (
          <div className="flex gap-2">
            <CreateArticleButton siteId={siteId} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </CreateArticleButton>
            <ApiConsoleSheet siteId={siteId} />
          </div>
        )}

        {!isCMS && (
          <Link href={fullUrl} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Site
            </Button>
          </Link>
        )}
      </div>

      {isCMS ? (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.articles}</div>
                <p className="text-xs text-muted-foreground mt-1">Content Pieces</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.categories}</div>
                <p className="text-xs text-muted-foreground mt-1">Taxonomies</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collections</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.collections}</div>
                <p className="text-xs text-muted-foreground mt-1">Dynamic Schemas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground mt-1">Last 24h</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Recent Activity Feed */}
            <Card className="md:col-span-2 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Recent Content Activity</CardTitle>
                <CardDescription>Latest updates to your content repository.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentArticles.length > 0 ? (
                  <div className="space-y-4">
                    {recentArticles.map((article) => (
                      <div key={article.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-background">
                            {article.author?.name?.substring(0, 2).toUpperCase() || "SY"}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none truncate max-w-[200px] md:max-w-[300px]">{article.title}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className={article.status === 'PUBLISHED' ? "text-green-500" : "text-amber-500"}>
                                {article.status}
                              </span>
                              <span>•</span>
                              <span>{formatDistanceToNow(new Date(article.updateAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/dashboard/${siteId}/projects/website/articles/${article.id}/editor`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground space-y-2">
                    <FileText className="w-8 h-8 opacity-20" />
                    <p>No articles found.</p>
                    <CreateArticleButton siteId={siteId} variant="link" size="sm">Create your first article</CreateArticleButton>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Health / API Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">API Endpoint</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Database</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">CDN Status</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Project ID</span>
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{siteId.substring(0, 8)}...</code>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(site.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* Original Production Deployment Card Logic (Preserved) */
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-medium mb-4">Production Deployment</h2>
              <div className="border rounded-lg overflow-hidden bg-background">
                <div className="aspect-video max-h-[500px] w-full bg-muted/10 relative group border-b">
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
          </div>
        </div>
      )}

      {/* Analytics Section (Common) */}
      <ProjectAnalyticsSummary siteId={site.id} />
    </div>
  )
}



