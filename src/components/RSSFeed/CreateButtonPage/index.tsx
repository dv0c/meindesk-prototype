"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Rss, Zap } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTeam } from "@/hooks/useTeam"
import { useRouter } from "next/navigation"

interface FeedOption {
    id: string
    name: string
    icon: React.ReactNode
}

const feedOptions: FeedOption[] = [
    { id: "webpage", name: "Webpage to RSS Feed", icon: "🌐" },
    { id: "instagram", name: "Instagram RSS Feed", icon: "📷" },
    { id: "twitter", name: "X / Twitter RSS Feed", icon: "𝕏" },
    { id: "google-news", name: "Google News RSS Feed", icon: "📰" },
    { id: "linkedin", name: "LinkedIn RSS Feed", icon: "💼" },
    { id: "tiktok", name: "TikTok RSS Feed", icon: "🎵" },
    { id: "threads", name: "Threads RSS Feed", icon: "◉" },
    { id: "reddit", name: "Reddit RSS Feed", icon: "🔴" },
    { id: "facebook", name: "Facebook RSS Feed", icon: "f" },
    { id: "youtube", name: "YouTube RSS Feed", icon: "▶️" },
    { id: "telegram", name: "Telegram RSS Feed", icon: "✈️" },
    { id: "bluesky", name: "Bluesky RSS Feed", icon: "🦋" },
    { id: "mastodon", name: "Mastodon RSS Feed", icon: "🐘" },
    { id: "substack", name: "Substack RSS Feed", icon: "📧" },
]

export default function CreateNewFeed() {
    const router = useRouter()
    const team = useTeam().team
    const [activeTab, setActiveTab] = useState("websites")
    const [mode, setMode] = useState<"generator" | "builder">("generator")
    const [searchQuery, setSearchQuery] = useState("")
    const [url, setUrl] = useState("")

    const filteredFeeds = feedOptions.filter((feed) =>
        feed.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleGenerate = async () => {
        if (!url) return
        router.push(`/dashboard/${team?.id}/projects/website/rss/feed/${encodeURIComponent(url)}`)
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
                    <Button
                        onClick={() => setMode("builder")}
                        className={`gap-2 px-6 py-2 h-auto ${mode === "builder"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            }`}
                    >
                        <Zap className="w-4 h-4" /> RSS Builder
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
                    <Button onClick={handleGenerate} className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                        Generate
                    </Button>
                </div>

                {/* Feed Result */}

                {/* Category Tabs */}
                <div className="mb-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-transparent border-b border-border">
                            <TabsTrigger
                                value="websites"
                                className={`gap-2 px-4 py-2 border-b-2 rounded-none ${activeTab === "websites" ? "border-blue-500 text-blue-500" : "border-transparent text-muted-foreground"
                                    }`}
                            >
                                📁 Websites
                            </TabsTrigger>
                            <TabsTrigger
                                value="topics"
                                className={`gap-2 px-4 py-2 border-b-2 rounded-none ${activeTab === "topics" ? "border-blue-500 text-blue-500" : "border-transparent text-muted-foreground"
                                    }`}
                            >
                                🏷️ Topics
                            </TabsTrigger>
                            <TabsTrigger
                                value="newsletters"
                                className={`gap-2 px-4 py-2 border-b-2 rounded-none ${activeTab === "newsletters" ? "border-blue-500 text-blue-500" : "border-transparent text-muted-foreground"
                                    }`}
                            >
                                📬 Newsletters
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Feed Options */}
                <div>
                    <p className="text-muted-foreground mb-4">Select which RSS feed you would like to create</p>
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

                    <div className="grid grid-cols-3 gap-4">
                        {filteredFeeds.map((feed) => (
                            <button key={feed.id} className="p-6 border border-border rounded-lg hover:border-primary hover:shadow-md transition-all text-left">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{feed.icon}</span>
                                    <span className="text-foreground font-medium">{feed.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
