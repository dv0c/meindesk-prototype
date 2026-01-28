"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BarChart3, Eye, FileText, Zap, Folder, Image as ImageIcon, Rss, Layers } from "lucide-react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { toast } from "sonner"
import type { Site } from "@prisma/client"

interface FeaturesSettingsProps {
    site: Site
}

export function FeaturesSettings({ site }: FeaturesSettingsProps) {
    const [featuresLoading, setFeaturesLoading] = useState(false)
    const [features, setFeatures] = useState<any>(null)

    // Sync features from site data when available
    useEffect(() => {
        // @ts-ignore
        if (site?.features) {
            // @ts-ignore
            setFeatures(site.features)
        } else if (site && !features) {
            setFeatures({
                articles: true,
                pages: true,
                categories: true,
                media: true,
                analytics: true,
                rss: true,
                // @ts-ignore
                viewslimit: site.features?.viewslimit ?? 500,
                // @ts-ignore
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

    if (!features) return <div className="p-8">Initializing features...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium leading-none tracking-tight mb-2">Features Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage which features are enabled for your site.
                    </p>
                </div>
                <Button onClick={handleFeaturesSave} disabled={featuresLoading} size="sm">
                    {featuresLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6">
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
