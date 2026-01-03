"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Search, Rss, Globe, Merge, Code2, ArrowRight,
    Sparkles, Link2, Check, ArrowLeft, RssIcon
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useFetch } from "@/hooks/useFetch"
import { DialogClose } from "@/components/ui/dialog"

// Popular RSS feeds
const POPULAR_FEEDS = [
    { id: "skai", title: "ΣΚΑΪ Ειδήσεις", url: "https://www.skai.gr/rss.xml" },
    { id: "iefimerida", title: "iefimerida.gr", url: "https://www.iefimerida.gr/rss.xml" },
    { id: "protothema", title: "Πρώτο Θέμα", url: "https://www.protothema.gr/rss/" },
    { id: "in_gr", title: "in.gr", url: "https://www.in.gr/feed/" },
    { id: "naftemporiki", title: "Ναυτεμπορική", url: "https://www.naftemporiki.gr/feed/" },
    { id: "cnn_greece", title: "CNN Greece", url: "https://www.cnn.gr/eidhseis?format=feed&type=rss" },
    { id: "tanea", title: "Τα Νέα", url: "https://www.tanea.gr/feed/" },
    { id: "zougla", title: "Zougla.gr", url: "https://www.zougla.gr/feed" },
    { id: "newsit", title: "Newsit.gr", url: "https://www.newsit.gr/feed/" },
    { id: "enikos", title: "Enikos.gr", url: "https://www.enikos.gr/feed/" },
    { id: "newsbeast", title: "Newsbeast.gr", url: "https://www.newsbeast.gr/feed" },
    { id: "ethnos", title: "Έθνος", url: "https://www.ethnos.gr/rss.xml" },
]

type Mode = "select" | "url" | "merge" | "builder"

export default function CreateNewFeed({ siteId }: { siteId: string }) {
    const router = useRouter()
    const [mode, setMode] = useState<Mode>("select")
    const [url, setUrl] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredFeeds = useMemo(() => {
        if (!searchQuery) return POPULAR_FEEDS
        return POPULAR_FEEDS.filter(f =>
            f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.url.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    const handleGenerate = () => {
        if (!url.trim()) return
        router.push(`/dashboard/${siteId}/projects/website/rss/feed/${encodeURIComponent(url)}`)
    }

    const isValidUrl = useMemo(() => {
        if (!url.trim()) return false
        return /^https?:\/\/[\w.-]+\.[a-z]{2,}/.test(url.trim())
    }, [url])

    // Option cards for the main selection screen
    const OPTIONS = [
        {
            id: "url",
            icon: Link2,
            title: "Add RSS Feed",
            description: "Enter a URL or choose from popular feeds",
            color: "from-blue-500 to-cyan-500",
            badge: "Most Popular",
        },
        {
            id: "merge",
            icon: Merge,
            title: "Merge Feeds",
            description: "Combine multiple feeds with filters",
            color: "from-purple-500 to-pink-500",
            badge: "Pro Feature",
        },
        {
            id: "builder",
            icon: Code2,
            title: "Visual Scraper",
            description: "Build custom feed from any website",
            color: "from-orange-500 to-red-500",
            badge: "Advanced",
        },
    ]

    return (
        <div className="min-h-[60vh] max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8 pt-4">
                {mode === "select" ? (
                    <>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                            <Rss className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Add New Feed</h2>
                        <p className="text-muted-foreground">Choose how you want to add your RSS feed</p>
                    </>
                ) : (
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMode("select")}
                            className="h-9 w-9"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-left">
                            <h2 className="text-xl font-semibold">
                                {mode === "url" && "Add RSS Feed"}
                                {mode === "merge" && "Merge Feeds"}
                                {mode === "builder" && "Visual Scraper"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {mode === "url" && "Enter a feed URL or pick from popular sources"}
                                {mode === "merge" && "Combine multiple RSS feeds into one"}
                                {mode === "builder" && "Create a custom feed from any website"}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mode Selection */}
            {mode === "select" && (
                <div className="grid gap-4 md:grid-cols-3 px-4 pb-4">
                    {OPTIONS.map((option) => (
                        <Card
                            key={option.id}
                            className="relative overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1"
                            onClick={() => {
                                if (option.id === "builder") {
                                    router.push(`/dashboard/${siteId}/projects/website/rss/builder`)
                                } else if (option.id === "merge") {
                                    router.push(`/dashboard/${siteId}/projects/website/rss/merge`)
                                } else {
                                    setMode(option.id as Mode)
                                }
                            }}
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 transition-opacity`} />

                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg`}>
                                        <option.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] font-normal">
                                        {option.badge}
                                    </Badge>
                                </div>

                                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                                    {option.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {option.description}
                                </p>

                                <div className="flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Get started</span>
                                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* URL Mode */}
            {mode === "url" && (
                <div className="px-4 pb-4 space-y-6">
                    {/* URL Input */}
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="https://example.com/feed.xml"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && isValidUrl && handleGenerate()}
                                    className="pl-10 h-12 text-base"
                                />
                            </div>
                            <DialogClose asChild>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={!isValidUrl}
                                    className="h-12 px-6 bg-gradient-to-r from-primary to-primary/80"
                                >
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate
                                </Button>
                            </DialogClose>
                        </div>

                        {url && !isValidUrl && (
                            <p className="text-xs text-destructive">Please enter a valid URL starting with http:// or https://</p>
                        )}
                    </div>

                    {/* Popular Feeds */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-muted-foreground">Popular Feeds</h3>
                            <div className="relative w-48">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 pl-8 text-xs"
                                />
                            </div>
                        </div>

                        <ScrollArea className="h-[240px] rounded-lg border p-2">
                            <div className="grid gap-2 sm:grid-cols-2">
                                {filteredFeeds.map((feed) => {
                                    const isSelected = url === feed.url
                                    return (
                                        <button
                                            key={feed.id}
                                            onClick={() => setUrl(feed.url)}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-lg text-left transition-all
                                                ${isSelected
                                                    ? 'bg-primary/10 border-primary ring-1 ring-primary/20'
                                                    : 'hover:bg-muted border-transparent'
                                                }
                                                border
                                            `}
                                        >
                                            <div className={`
                                                w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                                ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                                            `}>
                                                {isSelected ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <RssIcon className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{feed.title}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">
                                                    {new URL(feed.url).hostname}
                                                </p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            )}
        </div>
    )
}
