"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BarChart3, Eye, FileText, Zap, Folder, Image as ImageIcon, Rss, Layers } from "lucide-react"
import { useTeam } from "@/hooks/useTeam"
import { useSite } from "@/components/Contexts/site-id-context"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import axios from "axios"
import { Loader2 } from "lucide-react"

export default function FeaturesPage() {
    // We can use the logic from WebsiteSettings here
    // But since this is a page, we might need to fetch the site data client-side or assume it's passed?
    // The previous implementation used `getSite()`, a server action.
    // To make it interactive with "use client", we should rely on the `useTeam` hook or fetch it.

    // Attempting to reuse the context/hooks pattern effectively found in Sidebar/Settings

    // However, since the previous page was a Server Component using a helper, 
    // let's stick to client-side data fetching for the interactive part to be safe and consistent with `WebsiteSettings`.

    // Actually, `useTeam` provides the site context globally if we are under the specific route.
    const { siteId } = useSite() // context from sidebar/layout usually
    const { team: site, loading, error } = useTeam(siteId)

    const [featuresLoading, setFeaturesLoading] = useState(false)
    const [features, setFeatures] = useState<any>(null)

    // Sync features from site data when available
    useEffect(() => {
        if (site?.features) {
            setFeatures(site.features)
        } else if (site && !features) {
            // Fallback default if features not present but site loaded
            setFeatures({
                articles: true,
                pages: true,
                categories: true,
                media: true,
                analytics: true,
                rss: true,
                viewslimit: site.features?.viewslimit ?? 500,
                ratelimit: site.features?.ratelimit ?? 10000
            })
        }
    }, [site])

    const handleFeaturesSave = async () => {
        if (!site) return
        setFeaturesLoading(true)
        try {
            await axios.put(`/api/team/${site.id}`, {
                siteId: site.id,
                features: features
            })
            toast.success("Site features updated")
            // Optionally force revalidation or reload
            window.location.reload()
        } catch (err) {
            console.error(err)
            toast.error("Failed to update features")
        } finally {
            setFeaturesLoading(false)
        }
    }

    const toggleFeature = (key: string) => {
        if (!features) return
        setFeatures((prev: any) => ({ ...prev, [key]: !prev[key] }))
    }

    if (loading) return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
    if (error || !site) return <div className="p-8">Failed to load site settings.</div>
    if (!features) return <div className="p-8">Initializing features...</div>

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Features</h1>
                            <p className="mt-2 text-muted-foreground">Manage your feature settings and view your plan limits</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="h-fit">
                                Active
                            </Badge>
                            <Button onClick={handleFeaturesSave} disabled={featuresLoading}>
                                {featuresLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Feature Toggles Card */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-primary" />
                                Feature Toggles
                            </CardTitle>
                            <CardDescription>Enable or disable features for your sites</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Analytics Toggle */}
                            <div className="flex items-center justify-between space-x-4 rounded-lg border border-border bg-card p-4">
                                <div className="flex items-start gap-3">
                                    <BarChart3 className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium leading-none">
                                            Analytics
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Track visitor analytics and insights</p>
                                    </div>
                                </div>
                                <Switch checked={features.analytics} onCheckedChange={() => toggleFeature('analytics')} />
                            </div>

                            {/* Articles Toggle */}
                            <div className="flex items-center justify-between space-x-4 rounded-lg border border-border bg-card p-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium leading-none">
                                            Articles
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Enable article publishing and management</p>
                                    </div>
                                </div>
                                <Switch checked={features.articles} onCheckedChange={() => toggleFeature('articles')} />
                            </div>

                            {/* Pages Toggle */}
                            <div className="flex items-center justify-between space-x-4 rounded-lg border border-border bg-card p-4">
                                <div className="flex items-start gap-3">
                                    <Layers className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium leading-none">
                                            Pages
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Enable static pages management</p>
                                    </div>
                                </div>
                                <Switch checked={features.pages} onCheckedChange={() => toggleFeature('pages')} />
                            </div>

                            {/* Categories Toggle */}
                            <div className="flex items-center justify-between space-x-4 rounded-lg border border-border bg-card p-4">
                                <div className="flex items-start gap-3">
                                    <Folder className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium leading-none">
                                            Categories
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Enable taxonomy and categorization</p>
                                    </div>
                                </div>
                                <Switch checked={features.categories} onCheckedChange={() => toggleFeature('categories')} />
                            </div>

                            {/* Media Toggle */}
                            <div className="flex items-center justify-between space-x-4 rounded-lg border border-border bg-card p-4">
                                <div className="flex items-start gap-3">
                                    <ImageIcon className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium leading-none">
                                            Media Gallery
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Enable image and file management</p>
                                    </div>
                                </div>
                                <Switch checked={features.media} onCheckedChange={() => toggleFeature('media')} />
                            </div>

                            {/* RSS Toggle */}
                            <div className="flex items-center justify-between space-x-4 rounded-lg border border-border bg-card p-4">
                                <div className="flex items-start gap-3">
                                    <Rss className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium leading-none">
                                            RSS Feeds
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Enable RSS feed aggregation</p>
                                    </div>
                                </div>
                                <Switch checked={features.rss} onCheckedChange={() => toggleFeature('rss')} />
                            </div>

                        </CardContent>
                    </Card>

                    {/* Plan Limits Card */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-primary" />
                                Plan Limits
                            </CardTitle>
                            <CardDescription>Your current usage limits set by admin</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Views Limit - Read Only */}
                            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Views Limit</Label>
                                    <Badge variant="secondary" className="whitespace-nowrap font-mono">
                                        {features.viewslimit?.toLocaleString() ?? 0}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">Maximum page views allowed per month</p>
                            </div>

                            {/* Rate Limit - Read Only */}
                            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Rate Limit</Label>
                                    <Badge variant="secondary" className="whitespace-nowrap font-mono">
                                        {features.ratelimit?.toLocaleString() ?? 0}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">Maximum API requests allowed per hour</p>
                            </div>

                            <div className="rounded-lg bg-blue-500/10 p-3 text-sm text-blue-600 dark:text-blue-400">
                                Need higher limits? Contact your administrator to upgrade your plan.
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Card */}
                <Card className="mt-6 border-border">
                    <CardHeader>
                        <CardTitle>Current Configuration</CardTitle>
                        <CardDescription>Summary of your feature settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <div className="text-sm font-medium text-muted-foreground">Feature ID</div>
                                <div className="mt-1 font-mono text-sm text-foreground">{features?.id || "Pending..."}</div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <div className="text-sm font-medium text-muted-foreground">Analytics</div>
                                <div className="mt-1 text-sm font-semibold text-foreground">
                                    {features?.analytics ? (
                                        <span className="text-green-600 dark:text-green-400">Enabled</span>
                                    ) : (
                                        <span className="text-muted-foreground">Disabled</span>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <div className="text-sm font-medium text-muted-foreground">Articles</div>
                                <div className="mt-1 text-sm font-semibold text-foreground">
                                    {features?.articles ? (
                                        <span className="text-green-600 dark:text-green-400">Enabled</span>
                                    ) : (
                                        <span className="text-muted-foreground">Disabled</span>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <div className="text-sm font-medium text-muted-foreground">Views Remaining</div>
                                <div className="mt-1 text-sm font-semibold text-foreground">{features?.viewslimit?.toLocaleString() ?? 0}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
