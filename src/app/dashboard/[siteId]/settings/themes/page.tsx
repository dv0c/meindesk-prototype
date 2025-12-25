"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Download, Trash2, Sparkles, Package, Crown } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface ThemeBlock {
    id: string
    componentName: string
    componentDefinition: {
        category: string
        description: string
        isCore: boolean
    }
}

interface Theme {
    id: string
    name: string
    description: string
    thumbnail: string | null
    price: number
    isPremium: boolean
    blocks: ThemeBlock[]
    _count?: {
        installedIn: number
    }
}

export default function ThemesPage() {
    const params = useParams()
    const siteId = params?.siteId as string

    const [allThemes, setAllThemes] = useState<Theme[]>([])
    const [installedThemeIds, setInstalledThemeIds] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    // Fetch all available themes and installed themes
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                // Fetch all themes
                const themesRes = await fetch("/api/themes")
                const themes = await themesRes.json()
                setAllThemes(themes)

                // Fetch installed themes for this site
                const installedRes = await fetch(`/api/sites/${siteId}/themes`)
                const installed = await installedRes.json()
                setInstalledThemeIds(new Set(installed.map((t: Theme) => t.id)))
            } catch (error) {
                console.error("Error fetching themes:", error)
                toast.error("Failed to load themes")
            } finally {
                setIsLoading(false)
            }
        }

        if (siteId) {
            fetchData()
        }
    }, [siteId])

    const handleInstall = async (themeId: string) => {
        setActionLoading(themeId)
        try {
            const response = await fetch(`/api/sites/${siteId}/themes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ themeId }),
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || "Failed to install theme")
            }

            setInstalledThemeIds(prev => new Set([...prev, themeId]))
            toast.success("Theme installed successfully!")
        } catch (error) {
            console.error("Error installing theme:", error)
            toast.error(error instanceof Error ? error.message : "Failed to install theme")
        } finally {
            setActionLoading(null)
        }
    }

    const handleUninstall = async (themeId: string, themeName: string) => {
        if (themeName === "Core") {
            toast.error("Cannot uninstall the Core theme")
            return
        }

        setActionLoading(themeId)
        try {
            const response = await fetch(`/api/sites/${siteId}/themes?themeId=${themeId}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || "Failed to uninstall theme")
            }

            setInstalledThemeIds(prev => {
                const next = new Set(prev)
                next.delete(themeId)
                return next
            })
            toast.success("Theme uninstalled successfully!")
        } catch (error) {
            console.error("Error uninstalling theme:", error)
            toast.error(error instanceof Error ? error.message : "Failed to uninstall theme")
        } finally {
            setActionLoading(null)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Theme Marketplace</h1>
                    <p className="text-muted-foreground mt-2">
                        Install themes to unlock new components for your website builder.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-40 w-full" />
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full mt-2" />
                            </CardHeader>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Theme Marketplace</h1>
                <p className="text-muted-foreground mt-2">
                    Install themes to unlock new components for your website builder.
                </p>
            </div>

            {allThemes.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No themes available</h3>
                    <p className="text-muted-foreground">
                        Check back later for new themes.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allThemes.map((theme) => {
                        const isInstalled = installedThemeIds.has(theme.id)
                        const isCore = theme.name === "Core"
                        const isActionLoading = actionLoading === theme.id

                        return (
                            <Card
                                key={theme.id}
                                className={`overflow-hidden transition-all duration-200 ${isInstalled ? "ring-2 ring-primary/50" : ""
                                    }`}
                            >
                                {/* Thumbnail */}
                                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20">
                                    {theme.thumbnail ? (
                                        <Image
                                            src={theme.thumbnail}
                                            alt={theme.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-12 h-12 text-primary/50" />
                                        </div>
                                    )}

                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        {isCore && (
                                            <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                                                Essential
                                            </Badge>
                                        )}
                                        {theme.isPremium && (
                                            <Badge className="bg-amber-500/90 text-white backdrop-blur">
                                                <Crown className="w-3 h-3 mr-1" />
                                                Premium
                                            </Badge>
                                        )}
                                    </div>

                                    {isInstalled && (
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-green-500/90 text-white backdrop-blur">
                                                <Check className="w-3 h-3 mr-1" />
                                                Installed
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        {theme.name}
                                        {theme.price > 0 && (
                                            <span className="text-lg font-normal text-muted-foreground">
                                                €{theme.price}
                                            </span>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {theme.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="flex flex-wrap gap-1.5">
                                        {theme.blocks.slice(0, 4).map((block) => (
                                            <Badge
                                                key={block.id}
                                                variant="outline"
                                                className="text-xs"
                                            >
                                                {block.componentName}
                                            </Badge>
                                        ))}
                                        {theme.blocks.length > 4 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{theme.blocks.length - 4} more
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter>
                                    {isCore ? (
                                        <Button className="w-full" disabled>
                                            <Check className="w-4 h-4 mr-2" />
                                            Always Installed
                                        </Button>
                                    ) : isInstalled ? (
                                        <Button
                                            variant="destructive"
                                            className="w-full"
                                            onClick={() => handleUninstall(theme.id, theme.name)}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? (
                                                <span className="animate-pulse">Uninstalling...</span>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Uninstall
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={() => handleInstall(theme.id)}
                                            disabled={isActionLoading}
                                        >
                                            {isActionLoading ? (
                                                <span className="animate-pulse">Installing...</span>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Install Theme
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
