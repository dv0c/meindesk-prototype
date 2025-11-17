"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Rss, Youtube, Globe, Newspaper } from "lucide-react"
import { useRouter } from "next/navigation"
import { useFetch } from "@/hooks/useFetch"

export default function CreateNewFeed({ siteId }: { siteId: string }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("websites")
    const [mode, setMode] = useState<"generator" | "builder">("generator")
    const [searchQuery, setSearchQuery] = useState("")
    const [url, setUrl] = useState("")
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null)

    const { data, error, loading } = useFetch(`/api/team/${siteId}/rss/feeds`)
    const feeds = Array.isArray(data) ? data : []

    // --- Hardcoded feeds ---
    const hardcodedFeeds = [
        {
            id: "skai",
            title: "ΣΚΑΪ Ειδήσεις",
            url: "https://www.skai.gr/rss",
            icon: "https://www.skai.gr/favicon.ico",
        },
        {
            id: "iefimerida",
            title: "iefimerida.gr",
            url: "https://www.iefimerida.gr/rss.xml",
            icon: "https://www.iefimerida.gr/favicon.ico",
        },
        {
            id: "protothema",
            title: "Πρώτο Θέμα",
            url: "https://www.protothema.gr/rss/general/",
            icon: "https://www.protothema.gr/favicon.ico",
        },
        {
            id: "in_gr",
            title: "in.gr",
            url: "https://www.in.gr/feed/",
            icon: "https://www.in.gr/favicon.ico",
        },
        {
            id: "naftemporiki",
            title: "Ναυτεμπορική",
            url: "https://www.naftemporiki.gr/feed/",
            icon: "https://www.naftemporiki.gr/favicon.ico",
        },
        {
            id: "kathimerini",
            title: "Καθημερινή",
            url: "https://www.kathimerini.gr/rss",
            icon: "https://www.kathimerini.gr/favicon.ico",
        },
        {
            id: "cnn_greece",
            title: "CNN Greece",
            url: "https://www.cnn.gr/feed",
            icon: "https://www.cnn.gr/favicon.ico",
        },
        {
            id: "tanea",
            title: "Τα Νέα",
            url: "https://www.tanea.gr/feed/",
            icon: "https://www.tanea.gr/favicon.ico",
        },
        {
            id: "news247",
            title: "News247",
            url: "https://www.news247.gr/feed/",
            icon: "https://www.news247.gr/favicon.ico",
        },
        {
            id: "zougla",
            title: "Zougla.gr",
            url: "https://www.zougla.gr/feed",
            icon: "https://www.zougla.gr/favicon.ico",
        },
        {
            id: "newsbomb",
            title: "Newsbomb.gr",
            url: "https://www.newsbomb.gr/rss",
            icon: "https://www.newsbomb.gr/favicon.ico",
        },
        {
            id: "documentonews",
            title: "Documento News",
            url: "https://www.documentonews.gr/feed/",
            icon: "https://www.documentonews.gr/favicon.ico",
        },
        {
            id: "newsit",
            title: "Newsit.gr",
            url: "https://www.newsit.gr/feed/",
            icon: "https://www.newsit.gr/favicon.ico",
        },
        {
            id: "tvxs",
            title: "TVXS.gr",
            url: "https://tvxs.gr/rss.xml",
            icon: "https://tvxs.gr/favicon.ico",
        },
        {
            id: "enikos",
            title: "Enikos.gr",
            url: "https://www.enikos.gr/feed/",
            icon: "https://www.enikos.gr/favicon.ico",
        },
        {
            id: "newsbeast",
            title: "Newsbeast.gr",
            url: "https://www.newsbeast.gr/rss",
            icon: "https://www.newsbeast.gr/favicon.ico",
        },
        {
            id: "capital",
            title: "Capital.gr Οικονομία",
            url: "https://www.capital.gr/rssFeed.aspx?catID=0",
            icon: "https://www.capital.gr/favicon.ico",
        },
        {
            id: "gazzetta",
            title: "Gazzetta.gr Αθλητικά",
            url: "https://www.gazzetta.gr/rss.xml",
            icon: "https://www.gazzetta.gr/favicon.ico",
        },
        {
            id: "sport24",
            title: "Sport24",
            url: "https://www.sport24.gr/feed/",
            icon: "https://www.sport24.gr/favicon.ico",
        },
        {
            id: "caranddrivergr",
            title: "Car and Driver Greece",
            url: "https://www.caranddriver.gr/feed/",
            icon: "https://www.caranddriver.gr/favicon.ico",
        },
        {
            id: "insomnia",
            title: "Insomnia.gr Τεχνολογία",
            url: "https://www.insomnia.gr/rss/all.xml/",
            icon: "https://www.insomnia.gr/favicon.ico",
        },
        {
            id: "unboxholics",
            title: "Unboxholics",
            url: "https://unboxholics.com/rss.xml",
            icon: "https://unboxholics.com/favicon.ico",
        },
        {
            id: "ethnos",
            title: "Έθνος",
            url: "https://www.ethnos.gr/rss.xml",
            icon: "https://www.ethnos.gr/favicon.ico",
        },
        {
            id: "newsauto",
            title: "NewsAuto.gr",
            url: "https://www.newsauto.gr/feed/",
            icon: "https://www.newsauto.gr/favicon.ico",
        },
        {
            id: "mononews",
            title: "Mononews.gr",
            url: "https://www.mononews.gr/feed",
            icon: "https://www.mononews.gr/favicon.ico",
        },
        {
            id: "ot",
            title: "OT.gr Οικονομικός Ταχυδρόμος",
            url: "https://www.ot.gr/feed/",
            icon: "https://www.ot.gr/favicon.ico",
        },
        {
            id: "athensvoice",
            title: "Athens Voice",
            url: "https://www.athensvoice.gr/feed/",
            icon: "https://www.athensvoice.gr/favicon.ico",
        },
        {
            id: "lifo",
            title: "LiFO.gr",
            url: "https://www.lifo.gr/feed",
            icon: "https://www.lifo.gr/favicon.ico",
        },
        {
            id: "readergr",
            title: "Reader.gr",
            url: "https://www.reader.gr/feed/",
            icon: "https://www.reader.gr/favicon.ico",
        },
    ];


    const allFeeds = [...hardcodedFeeds, ...feeds]

    const filterPresets = [
        {
            id: "youtube",
            label: "YouTube",
            icon: <Youtube className="w-4 h-4 text-red-500" />,
            match: (feed: any) =>
                feed.url?.includes("youtube.com") || feed.title?.toLowerCase().includes("youtube"),
            template: "https://youtube.com/@",
            validate: (value: string) => /^https:\/\/(www\.)?youtube\.com\/@[\w-]+$/.test(value.trim()),
        },
        {
            id: "news",
            label: "News",
            icon: <Newspaper className="w-4 h-4 text-blue-500" />,
            match: (feed: any) =>
                feed.title?.toLowerCase().includes("news") || feed.url?.includes("news"),
            template: "https://",
            validate: (value: string) => /^https?:\/\/[\w.-]+\.[a-z]{2,}/.test(value.trim()),
        },
        {
            id: "general",
            label: "General",
            icon: <Globe className="w-4 h-4 text-green-500" />,
            match: () => true,
            template: "https://",
            validate: (value: string) => /^https?:\/\/[\w.-]+\.[a-z]{2,}/.test(value.trim()),
        },
    ]

    const handlePresetSelect = (presetId: string) => {
        const preset = filterPresets.find(p => p.id === presetId)
        if (!preset) return
        setSelectedFilter(presetId)
        setUrl(preset.template)
    }

    const filteredFeeds = useMemo(() => {
        if (!allFeeds.length) return []
        const query = searchQuery.toLowerCase()

        let filtered = allFeeds.filter(feed =>
            feed?.title?.toLowerCase().includes(query)
        )

        if (selectedFilter) {
            const preset = filterPresets.find(p => p.id === selectedFilter)
            if (preset) filtered = filtered.filter(preset.match)
        }

        return filtered
    }, [allFeeds, searchQuery, selectedFilter])

    const handleGenerate = () => {
        if (!url.trim()) return
        router.push(
            `/dashboard/${siteId}/projects/website/rss/feed/${encodeURIComponent(url)}`
        )
    }

    const isUrlValid = useMemo(() => {
        if (!url.trim()) return false
        const preset = filterPresets.find(p => p.id === selectedFilter)
        if (preset && preset.validate) return preset.validate(url)
        return /^https?:\/\/[\w.-]+\.[a-z]{2,}/.test(url.trim())
    }, [url, selectedFilter])

    return (
        <div className="bg-background min-h-[80vh]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Mode Toggle */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    <Button
                        onClick={() => setMode("generator")}
                        className={`gap-2 px-6 py-2 h-auto text-sm sm:text-base ${mode === "generator"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            }`}
                    >
                        <Rss className="w-4 h-4" /> RSS Generator
                    </Button>
                </div>

                {/* URL Input */}
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                    <Input
                        type="text"
                        placeholder="Enter website URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 min-w-0"
                    />
                    <Button
                        onClick={handleGenerate}
                        disabled={!isUrlValid}
                        className={`px-8 whitespace-nowrap ${isUrlValid
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                            }`}
                    >
                        Generate
                    </Button>
                </div>

                {/* Category Tabs */}
                <div className="mb-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-transparent border-b border-border w-full overflow-x-auto">
                            <TabsTrigger
                                value="websites"
                                className={`gap-2 px-4 py-2 border-b-2 rounded-none text-sm sm:text-base ${activeTab === "websites"
                                    ? "border-blue-500 text-blue-500"
                                    : "border-transparent text-muted-foreground"
                                    }`}
                            >
                                📁 Websites
                            </TabsTrigger>
                            <TabsTrigger disabled value="topics" className="gap-2 px-4 py-2 border-b-2 rounded-none text-sm sm:text-base border-transparent text-muted-foreground">
                                🏷️ Topics
                            </TabsTrigger>
                            <TabsTrigger disabled value="newsletters" className="gap-2 px-4 py-2 border-b-2 rounded-none text-sm sm:text-base border-transparent text-muted-foreground">
                                📬 Newsletters
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Feed List */}
                {loading ? (
                    <p className="text-muted-foreground text-center">Loading feeds...</p>
                ) : error ? (
                    <p className="text-red-500 text-center">Failed to load feeds: {error}</p>
                ) : allFeeds.length === 0 ? (
                    <p className="text-muted-foreground text-center">
                        No feeds found for this site.
                    </p>
                ) : (
                    <div>
                        {/* Header section */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 border-b border-border pb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">
                                    Select which RSS feed you’d like to create
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Choose from available sources or search to find a specific feed.
                                </p>
                            </div>

                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search feeds..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-muted"
                                />
                            </div>
                        </div>

                        {/* Preset Filter Buttons */}
                        <div className="flex flex-wrap gap-2 mb-8">
                            {filterPresets.map((preset) => (
                                <Button
                                    key={preset.id}
                                    variant={selectedFilter === preset.id ? "default" : "outline"}
                                    className={`gap-2 px-4 py-2 text-sm transition ${selectedFilter === preset.id
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    onClick={() => handlePresetSelect(preset.id)}
                                >
                                    {preset.icon}
                                    {preset.label}
                                </Button>
                            ))}
                            {selectedFilter && (
                                <Button
                                    variant="ghost"
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => setSelectedFilter(null)}
                                >
                                    Clear filter
                                </Button>
                            )}
                        </div>

                        {/* Feed Grid */}
                        {filteredFeeds.length === 0 ? (
                            <p className="text-muted-foreground text-center">
                                No feeds match your search or selected filter.
                            </p>
                        ) : (
                            <div className="grid max-h-[300px] overflow-auto gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {filteredFeeds.map((feed) => (
                                    <Button
                                        key={feed.id}
                                        onClick={() => setUrl(feed.url)}
                                        variant="outline"
                                        className="flex flex-col items-start justify-start p-5 gap-3 h-full text-left hover:bg-muted/50 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            {feed.icon && (
                                                <img
                                                    src={feed.icon}
                                                    alt="feed icon"
                                                    className="w-8 h-8 object-cover rounded"
                                                />
                                            )}
                                            <h3 className="font-medium text-foreground line-clamp-1">
                                                {feed.title || "Untitled Feed"}
                                            </h3>
                                        </div>
                                        <p
                                            className="text-xs text-muted-foreground break-all line-clamp-1 max-w-full"
                                            title={decodeURIComponent(feed.url)}
                                        >
                                            {decodeURIComponent(feed.url) || "Untitled Feed"}
                                        </p>
                                        {hardcodedFeeds.some(h => h.id === feed.id) && (
                                            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                                Built-in
                                            </span>
                                        )}
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
