
import { getActiveTeam } from "@/lib/actions/helpers/team"
import { ApiPlayground } from "@/components/Settings/ApiPlayground"
import { redirect } from "next/navigation"

export default async function ApiSettingsPage({ params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = await params
    const team = await getActiveTeam(siteId)

    if (!team) return redirect("/dashboard")

    // Only allow CMS mode or if explicitly enabled? 
    // The tabs hide it, but good to check. 
    // For now, loose check is fine, or check mode.
    if ((team.settings as any)?.mode !== 'cms') {
        // Optional: Redirect if accessing directly in builder mode?
        // return redirect(`/dashboard/${siteId}/projects/settings`)
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">API Connections</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your API keys and test endpoints.
                </p>
            </div>

            <div className="border rounded-lg p-6 bg-card space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium">API Access</h3>
                        <p className="text-sm text-muted-foreground">Credentials for accessing your content.</p>
                    </div>
                </div>
                <div className="bg-muted p-3 rounded-md flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs uppercase font-mono text-muted-foreground">Project ID</span>
                        <div className="font-mono text-sm">{team.id}</div>
                    </div>
                </div>
            </div>

            <div className="border rounded-lg p-6 bg-card space-y-4">
                <h3 className="text-lg font-medium">API Documentation</h3>
                <div className="space-y-2 text-sm">
                    <p>Base URL: <code className="bg-muted px-1 rounded">https://meindesk.gr/api/v1/{team.id}</code></p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li><code className="text-foreground">GET /articles</code> - List all articles</li>
                        <li><code className="text-foreground">GET /articles/:id</code> - Get single article</li>
                        <li><code className="text-foreground">GET /categories</code> - List content categories</li>
                        <li><code className="text-foreground">GET /authors</code> - List team members</li>
                    </ul>
                </div>
            </div>

            <ApiPlayground siteId={team.id} />
        </div>
    )
}
