"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BarChart3, Eye, FileText, Folder, Image as ImageIcon, Layers, Rss } from "lucide-react"
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

    const featureItems = [
        {
            key: "analytics",
            title: "Analytics",
            description: "Visitor stats and event logs.",
            Icon: BarChart3,
        },
        {
            key: "articles",
            title: "Articles",
            description: "Write and publish articles.",
            Icon: FileText,
        },
        {
            key: "pages",
            title: "Pages",
            description: "Manage static pages and landing pages.",
            Icon: Layers,
        },
        {
            key: "categories",
            title: "Categories",
            description: "Organize content with categories.",
            Icon: Folder,
        },
        {
            key: "media",
            title: "Media",
            description: "Upload and manage images/files.",
            Icon: ImageIcon,
        },
        {
            key: "rss",
            title: "RSS",
            description: "Generate and manage RSS feeds.",
            Icon: Rss,
        },
    ] as const

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium tracking-tight">Features</h3>
                    <p className="text-sm text-muted-foreground">
                        Turn features on/off for this project.
                    </p>
                </div>
                <Button onClick={handleFeaturesSave} disabled={featuresLoading} size="sm">
                    {featuresLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Enabled features</CardTitle>
                    <CardDescription>
                        These switches control what shows up in the dashboard and editor.
                    </CardDescription>
                </CardHeader>
                <CardContent className="divide-y">
                    {featureItems.map(({ key, title, description, Icon }) => (
                        <div key={key} className="flex items-center justify-between gap-4 py-4">
                            <div className="flex items-start gap-3">
                                <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium leading-none">{title}</Label>
                                    <p className="text-sm text-muted-foreground">{description}</p>
                                </div>
                            </div>
                            <Switch
                                checked={Boolean((features as any)[key])}
                                onCheckedChange={() => toggleFeature(key)}
                            />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        Limits
                    </CardTitle>
                    <CardDescription>
                        Read-only limits applied to this project.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <Label className="text-sm font-medium">Views / month</Label>
                            <Badge variant="secondary" className="whitespace-nowrap font-mono">
                                {features.viewslimit?.toLocaleString() ?? 0}
                            </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Monthly view cap.
                        </p>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <Label className="text-sm font-medium">API / hour</Label>
                            <Badge variant="secondary" className="whitespace-nowrap font-mono">
                                {features.ratelimit?.toLocaleString() ?? 0}
                            </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Hourly API request cap.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
