"use client"

import { FileIcon, FileText, FolderIcon, ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { useStats } from "@/hooks/use-stats"

const StatsCards = ({ siteId }: { siteId: string }) => {
    const { data, loading, error } = useStats(siteId)

    if (loading) {
        return <div className="grid gap-4 md:grid-cols-2 mb-6 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        <div className="size-4 animate-pulse rounded bg-muted" />
                    </CardHeader>
                    <CardContent>
                        <div className="mb-2 h-8 w-16 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                    </CardContent>
                </Card>
            ))}
        </div>
    }

    if (error) {
        return null
    }

    return (
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Articles */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                    <FileText className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data?.totals.articles}</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">
                            +{data?.newFromLastMonth.articles}
                        </span>{" "}
                        from last month
                    </p>
                </CardContent>
            </Card>

            {/* Pages */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                    <FileIcon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data?.totals.pages || 0}</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">
                            +{data?.newFromLastMonth.pages || 0}
                        </span>{" "}
                        from last month
                    </p>
                </CardContent>
            </Card>

            {/* Categories */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categories</CardTitle>
                    <FolderIcon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data?.totals.categories}</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">
                            +{data?.newFromLastMonth.categories}
                        </span>{" "}
                        from last month
                    </p>
                </CardContent>
            </Card>

            {/* Media Files */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Media Files</CardTitle>
                    <ImageIcon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data?.totals.media || "Work in progress"}</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-green-600">
                            +{data?.newFromLastMonth.media || 0}
                        </span>{" "}
                        from last month
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default StatsCards
