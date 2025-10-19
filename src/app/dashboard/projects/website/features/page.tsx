import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getSite } from "@/lib/actions/helpers/site"
import { BarChart3, Eye, FileText, Zap } from "lucide-react"


export default async function FeaturesPage() {
    const site = await getSite()
    if (!site) return <div>No site found.</div>
    
    const features = site.features
    if (!features) return <div>Features are disabled</div>

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
                        <Badge variant="secondary" className="h-fit">
                            Active
                        </Badge>
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
                                        <Label htmlFor="analytics" className="text-sm font-medium leading-none">
                                            Analytics
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Track visitor analytics and insights</p>
                                    </div>
                                </div>
                                <Switch id="analytics" checked={features.analytics} disabled />
                            </div>

                            {/* Articles Toggle */}
                            <div className="flex items-center justify-between space-x-4 rounded-lg border border-border bg-card p-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div className="space-y-1">
                                        <Label htmlFor="articles" className="text-sm font-medium leading-none">
                                            Articles
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Enable article publishing and management</p>
                                    </div>
                                </div>
                                <Switch id="articles" checked={features.articles} disabled />
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
                                        {features.viewslimit.toLocaleString()}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">Maximum page views allowed per month</p>
                            </div>

                            {/* Rate Limit - Read Only */}
                            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Rate Limit</Label>
                                    <Badge variant="secondary" className="whitespace-nowrap font-mono">
                                        {features.ratelimit.toLocaleString()}
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
                                <div className="mt-1 font-mono text-sm text-foreground">{features.id}</div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <div className="text-sm font-medium text-muted-foreground">Analytics</div>
                                <div className="mt-1 text-sm font-semibold text-foreground">
                                    {features.analytics ? (
                                        <span className="text-green-600 dark:text-green-400">Enabled</span>
                                    ) : (
                                        <span className="text-muted-foreground">Disabled</span>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <div className="text-sm font-medium text-muted-foreground">Articles</div>
                                <div className="mt-1 text-sm font-semibold text-foreground">
                                    {features.articles ? (
                                        <span className="text-green-600 dark:text-green-400">Enabled</span>
                                    ) : (
                                        <span className="text-muted-foreground">Disabled</span>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <div className="text-sm font-medium text-muted-foreground">Views Remaining</div>
                                <div className="mt-1 text-sm font-semibold text-foreground">{features.viewslimit.toLocaleString()}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
