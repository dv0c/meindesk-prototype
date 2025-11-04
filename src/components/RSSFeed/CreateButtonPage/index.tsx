"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Rss } from "lucide-react"
import { useRouter } from "next/navigation"
import { useFetch } from "@/hooks/useFetch"

export default function CreateNewFeed({ siteId }: { siteId: string }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("websites")
    const [mode, setMode] = useState<"generator" | "builder">("generator")
    const [searchQuery, setSearchQuery] = useState("")
    const [url, setUrl] = useState("")

    const { data, error, loading } = useFetch(`/api/team/${siteId}/rss/feeds`)

    const feeds = Array.isArray(data) ? data : []

    const filteredFeeds = useMemo(() => {
        if (!feeds.length) return []
        const query = searchQuery.toLowerCase()
        return feeds.filter((feed) =>
            feed?.title?.toLowerCase().includes(query)
        )
    }, [feeds, searchQuery])

    const handleGenerate = () => {
        if (!url.trim()) return
        router.push(
            `/dashboard/${siteId}/projects/website/rss/feed/${encodeURIComponent(url)}`
        )
    }

    return (
        <div className="bg-background">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Mode Toggle */}
                <div className="flex justify-center gap-4 mb-8">
                    <Button
                        onClick={() => setMode("generator")}
                        className={`gap-2 px-6 py-2 h-auto ${mode === "generator"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            }`}
                    >
                        <Rss className="w-4 h-4" /> RSS Generator
                    </Button>
                </div>

                {/* URL Input */}
                <div className="flex gap-3 mb-8">
                    <Input
                        type="text"
                        placeholder="Enter URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleGenerate}
                        disabled={!url.trim()}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                    >
                        Generate
                    </Button>
                </div>

                {/* Category Tabs */}
                <div className="mb-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-transparent border-b border-border">
                            <TabsTrigger
                                value="websites"
                                className={`gap-2 px-4 py-2 border-b-2 rounded-none ${activeTab === "websites"
                                    ? "border-blue-500 text-blue-500"
                                    : "border-transparent text-muted-foreground"
                                    }`}
                            >
                                📁 Websites
                            </TabsTrigger>
                            <TabsTrigger
                                disabled
                                value="topics"
                                className={`gap-2 px-4 py-2 border-b-2 rounded-none ${activeTab === "topics"
                                    ? "border-blue-500 text-blue-500"
                                    : "border-transparent text-muted-foreground"
                                    }`}
                            >
                                🏷️ Topics
                            </TabsTrigger>
                            <TabsTrigger
                                disabled
                                value="newsletters"
                                className={`gap-2 px-4 py-2 border-b-2 rounded-none ${activeTab === "newsletters"
                                    ? "border-blue-500 text-blue-500"
                                    : "border-transparent text-muted-foreground"
                                    }`}
                            >
                                📬 Newsletters
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Feed List */}
                {loading ? (
                    <p className="text-muted-foreground">Loading feeds...</p>
                ) : error ? (
                    <p className="text-red-500">Failed to load feeds: {error}</p>
                ) : feeds.length === 0 ? (
                    <p className="text-muted-foreground">No feeds found for this site.</p>
                ) : (
                    <div>
                        <p className="text-muted-foreground mb-4">
                            Select which RSS feed you would like to create
                        </p>

                        <div className="mb-6 flex justify-end">
                            <div className="relative w-48">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-muted"
                                />
                            </div>
                        </div>

                        {filteredFeeds.length === 0 ? (
                            <p className="text-muted-foreground">No feeds match your search.</p>
                        ) : (
                            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                                {filteredFeeds.map((feed) => (
                                    <Button
                                        variant={'outline'}
                                        key={feed.id}
                                        className="w-fit cursor-pointer px-10 py-5 h-full"
                                    >
                                        <span className="text-3xl">{feed.icon && <img src={feed.icon} className="w-8 h-8 object-cover" />}</span>
                                        <span className="text-foreground font-medium ">
                                            <div className="max-w-sm items-start flex flex-col line-clamp-2">
                                                {feed.title || "Untitled Feed"}
                                                <p className="text-xs text-muted-foreground">
                                                    {decodeURIComponent(feed.url) || "Untitled Feed"}
                                                </p>
                                            </div>
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
