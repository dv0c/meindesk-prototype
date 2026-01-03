'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Plus, Trash2, Loader2, Check, X, Rss, Filter, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useState, useMemo } from "react"
import { toast } from "sonner"

// Hardcoded popular feeds - only actual RSS/Atom feed URLs
const POPULAR_FEEDS = [
    { id: "skai", title: "ΣΚΑΪ Ειδήσεις", url: "https://www.skai.gr/rss.xml" },
    { id: "iefimerida", title: "iefimerida.gr", url: "https://www.iefimerida.gr/rss.xml" },
    { id: "protothema", title: "Πρώτο Θέμα", url: "https://www.protothema.gr/rss/" },
    { id: "in_gr", title: "in.gr", url: "https://www.in.gr/feed/" },
    { id: "naftemporiki", title: "Ναυτεμπορική", url: "https://www.naftemporiki.gr/feed/" },
    { id: "cnn_greece", title: "CNN Greece", url: "https://www.cnn.gr/eidhseis?format=feed&type=rss" },
    { id: "tanea", title: "Τα Νέα", url: "https://www.tanea.gr/feed/" },
    { id: "zougla", title: "Zougla.gr", url: "https://www.zougla.gr/feed" },
    { id: "newsbomb", title: "Newsbomb.gr", url: "https://www.newsbomb.gr/oles-oi-eidhseis?format=feed&type=rss" },
    { id: "newsit", title: "Newsit.gr", url: "https://www.newsit.gr/feed/" },
    { id: "enikos", title: "Enikos.gr", url: "https://www.enikos.gr/feed/" },
    { id: "newsbeast", title: "Newsbeast.gr", url: "https://www.newsbeast.gr/feed" },
    { id: "ethnos", title: "Έθνος", url: "https://www.ethnos.gr/rss.xml" },
    { id: "mononews", title: "Mononews.gr", url: "https://www.mononews.gr/feed" },
    { id: "athensvoice", title: "Athens Voice", url: "https://www.athensvoice.gr/rss/echobox/" },
    { id: "kathimerini", title: "Καθημερινή", url: "https://www.kathimerini.gr/feed/" },
    { id: "tovima", title: "Το Βήμα", url: "https://www.tovima.gr/feed/" },
    { id: "reporter", title: "Reporter.gr", url: "https://www.reporter.gr/feed" },
]

const FILTER_PRESETS = [
    { id: "tech", label: "Technology", keywords: ["tech", "technology", "software", "AI", "startup"] },
    { id: "sports", label: "Sports", keywords: ["sports", "football", "basketball", "soccer"] },
    { id: "politics", label: "Politics", keywords: ["politics", "government", "election"] },
    { id: "business", label: "Business", keywords: ["business", "economy", "finance", "market"] },
    { id: "entertainment", label: "Entertainment", keywords: ["entertainment", "movies", "music", "celebrity"] },
    { id: "science", label: "Science", keywords: ["science", "research", "space", "physics"] },
]

const STEPS = [
    { id: 1, title: "Select Sources", description: "Choose feeds to merge" },
    { id: 2, title: "Add Filters", description: "Filter by keywords" },
    { id: 3, title: "Name & Save", description: "Finish setup" },
]

const MergeFeedsPage = ({ params }: { params: Promise<{ siteId: string }> }) => {
    const router = useRouter()
    const { siteId } = use(params)

    const [currentStep, setCurrentStep] = useState(1)
    const [selectedFeeds, setSelectedFeeds] = useState<string[]>([])
    const [customUrl, setCustomUrl] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    const [includeKeywords, setIncludeKeywords] = useState<string[]>([])
    const [excludeKeywords, setExcludeKeywords] = useState<string[]>([])
    const [customInclude, setCustomInclude] = useState("")
    const [customExclude, setCustomExclude] = useState("")

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [saving, setSaving] = useState(false)

    // Filter feeds by search
    const filteredFeeds = useMemo(() => {
        if (!searchQuery) return POPULAR_FEEDS
        return POPULAR_FEEDS.filter(f =>
            f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.url.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    const toggleFeed = (url: string) => {
        setSelectedFeeds(prev =>
            prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
        )
    }

    const addCustomUrl = () => {
        if (customUrl.trim() && !selectedFeeds.includes(customUrl.trim())) {
            setSelectedFeeds([...selectedFeeds, customUrl.trim()])
            setCustomUrl("")
        }
    }

    const removeCustomUrl = (url: string) => {
        setSelectedFeeds(selectedFeeds.filter(u => u !== url))
    }

    const togglePreset = (presetId: string, type: "include" | "exclude") => {
        const preset = FILTER_PRESETS.find(p => p.id === presetId)
        if (!preset) return

        const keywords = type === "include" ? includeKeywords : excludeKeywords
        const setKeywords = type === "include" ? setIncludeKeywords : setExcludeKeywords

        const hasAll = preset.keywords.every(k => keywords.includes(k))
        if (hasAll) {
            setKeywords(keywords.filter(k => !preset.keywords.includes(k)))
        } else {
            setKeywords([...new Set([...keywords, ...preset.keywords])])
        }
    }

    const addCustomKeyword = (type: "include" | "exclude") => {
        const value = type === "include" ? customInclude.trim() : customExclude.trim()
        if (!value) return

        if (type === "include") {
            if (!includeKeywords.includes(value)) setIncludeKeywords([...includeKeywords, value])
            setCustomInclude("")
        } else {
            if (!excludeKeywords.includes(value)) setExcludeKeywords([...excludeKeywords, value])
            setCustomExclude("")
        }
    }

    const removeKeyword = (keyword: string, type: "include" | "exclude") => {
        if (type === "include") setIncludeKeywords(includeKeywords.filter(k => k !== keyword))
        else setExcludeKeywords(excludeKeywords.filter(k => k !== keyword))
    }

    const canProceed = () => {
        if (currentStep === 1) return selectedFeeds.length >= 1
        if (currentStep === 2) return true
        if (currentStep === 3) return name.trim().length > 0
        return true
    }

    const saveFeed = async () => {
        setSaving(true)
        try {
            const filters: any = {}
            if (includeKeywords.length > 0) filters.include = includeKeywords
            if (excludeKeywords.length > 0) filters.exclude = excludeKeywords

            const response = await fetch(`/api/team/${siteId}/rss/merged`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description: description || null,
                    sources: selectedFeeds.map(url => ({ type: "url", value: url })),
                    filters: Object.keys(filters).length > 0 ? filters : null,
                })
            })

            if (!response.ok) throw new Error("Failed to save")

            const feed = await response.json()
            const feedUrl = `${window.location.origin}/api/rss/merged/${feed.id}`
            navigator.clipboard.writeText(feedUrl)

            toast.success("Merged feed created!", { description: "Feed URL copied to clipboard" })
            // Navigate to the feed view like a regular RSS feed
            const feedViewUrl = `/api/rss/merged/${feed.id}`
            router.push(`/dashboard/${siteId}/projects/website/rss/feed/${encodeURIComponent(feedViewUrl)}`)
        } catch (err: any) {
            toast.error("Failed to save: " + (err.message || "Unknown error"))
        } finally {
            setSaving(false)
        }
    }

    // Get custom URLs (ones not in POPULAR_FEEDS)
    const customUrls = selectedFeeds.filter(url => !POPULAR_FEEDS.find(f => f.url === url))

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <header className="shrink-0 border-b">
                <div className="flex items-center justify-between h-14 px-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/dashboard/${siteId}/projects/website/rss/my-feed`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="h-4 w-px bg-border" />
                        <h1 className="text-sm font-medium">Merge Feeds</h1>
                    </div>
                </div>
            </header>

            {/* Step Indicator - Airbnb Style */}
            <div className="border-b px-6 py-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                                        ${currentStep > step.id
                                            ? 'bg-primary text-primary-foreground'
                                            : currentStep === step.id
                                                ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                                                : 'bg-muted text-muted-foreground'
                                        }
                                    `}>
                                        {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <p className={`text-xs font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {step.title}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground hidden sm:block">{step.description}</p>
                                    </div>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div className={`w-16 sm:w-24 h-0.5 mx-2 mt-[-1.5rem] ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <ScrollArea className="flex-1">
                <div className="max-w-2xl mx-auto p-6">
                    {/* Step 1: Select Sources */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold mb-1">Select feeds to merge</h2>
                                <p className="text-sm text-muted-foreground">Choose from popular feeds or add custom URLs</p>
                            </div>

                            {/* Custom URL */}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add custom feed URL..."
                                    value={customUrl}
                                    onChange={(e) => setCustomUrl(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addCustomUrl()}
                                />
                                <Button onClick={addCustomUrl} disabled={!customUrl.trim()}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Custom URLs added */}
                            {customUrls.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {customUrls.map(url => (
                                        <Badge key={url} variant="secondary" className="gap-1 pr-1">
                                            <span className="max-w-[200px] truncate">{url}</span>
                                            <button onClick={() => removeCustomUrl(url)} className="ml-1 hover:text-destructive">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search feeds..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Feed Grid */}
                            <div className="grid gap-2 sm:grid-cols-2">
                                {filteredFeeds.map(feed => {
                                    const isSelected = selectedFeeds.includes(feed.url)
                                    return (
                                        <button
                                            key={feed.id}
                                            onClick={() => toggleFeed(feed.url)}
                                            className={`
                                                flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                                                ${isSelected
                                                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                                    : 'border-border hover:border-muted-foreground/30'
                                                }
                                            `}
                                        >
                                            <div className={`
                                                w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                                                ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'}
                                            `}>
                                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">{feed.title}</p>
                                                <p className="text-[10px] text-muted-foreground truncate">{feed.url}</p>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            <p className="text-sm text-muted-foreground text-center">
                                {selectedFeeds.length} feed{selectedFeeds.length !== 1 ? 's' : ''} selected
                            </p>
                        </div>
                    )}

                    {/* Step 2: Filters */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold mb-1">Add content filters</h2>
                                <p className="text-sm text-muted-foreground">Optional: Filter articles by topic</p>
                            </div>

                            {/* Include */}
                            <Card>
                                <CardContent className="pt-4 space-y-3">
                                    <Label className="text-green-600 flex items-center gap-1.5">
                                        <Check className="h-4 w-4" /> Include (show only matching)
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {FILTER_PRESETS.map(preset => {
                                            const active = preset.keywords.some(k => includeKeywords.includes(k))
                                            return (
                                                <Button
                                                    key={preset.id}
                                                    variant={active ? "default" : "outline"}
                                                    size="sm"
                                                    className={active ? "bg-green-500 hover:bg-green-600" : ""}
                                                    onClick={() => togglePreset(preset.id, "include")}
                                                >
                                                    {preset.label}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                    {includeKeywords.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {includeKeywords.map(k => (
                                                <Badge key={k} className="bg-green-500/10 text-green-700 gap-1">
                                                    {k}
                                                    <button onClick={() => removeKeyword(k, "include")}><X className="h-3 w-3" /></button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add custom keyword..."
                                            value={customInclude}
                                            onChange={(e) => setCustomInclude(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addCustomKeyword("include")}
                                            className="h-8"
                                        />
                                        <Button size="sm" variant="outline" className="h-8" onClick={() => addCustomKeyword("include")}>
                                            <Plus className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Exclude */}
                            <Card>
                                <CardContent className="pt-4 space-y-3">
                                    <Label className="text-red-600 flex items-center gap-1.5">
                                        <X className="h-4 w-4" /> Exclude (hide matching)
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {FILTER_PRESETS.map(preset => {
                                            const active = preset.keywords.some(k => excludeKeywords.includes(k))
                                            return (
                                                <Button
                                                    key={preset.id}
                                                    variant={active ? "default" : "outline"}
                                                    size="sm"
                                                    className={active ? "bg-red-500 hover:bg-red-600" : ""}
                                                    onClick={() => togglePreset(preset.id, "exclude")}
                                                >
                                                    {preset.label}
                                                </Button>
                                            )
                                        })}
                                    </div>
                                    {excludeKeywords.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {excludeKeywords.map(k => (
                                                <Badge key={k} className="bg-red-500/10 text-red-700 gap-1">
                                                    {k}
                                                    <button onClick={() => removeKeyword(k, "exclude")}><X className="h-3 w-3" /></button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add custom keyword..."
                                            value={customExclude}
                                            onChange={(e) => setCustomExclude(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addCustomKeyword("exclude")}
                                            className="h-8"
                                        />
                                        <Button size="sm" variant="outline" className="h-8" onClick={() => addCustomKeyword("exclude")}>
                                            <Plus className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Step 3: Name & Save */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold mb-1">Name your feed</h2>
                                <p className="text-sm text-muted-foreground">Give your merged feed a recognizable name</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Feed Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Greek News Combined"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="desc">Description (optional)</Label>
                                    <Input
                                        id="desc"
                                        placeholder="Optional description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="mt-1.5"
                                    />
                                </div>
                            </div>

                            {/* Summary */}
                            <Card className="bg-muted/50">
                                <CardContent className="pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sources:</span>
                                        <span className="font-medium">{selectedFeeds.length} feeds</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Include filters:</span>
                                        <span className="font-medium">{includeKeywords.length || "None"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Exclude filters:</span>
                                        <span className="font-medium">{excludeKeywords.length || "None"}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Footer Navigation */}
            <div className="border-t px-6 py-4">
                <div className="max-w-2xl mx-auto flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentStep(s => s - 1)}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>

                    {currentStep < 3 ? (
                        <Button onClick={() => setCurrentStep(s => s + 1)} disabled={!canProceed()}>
                            Next
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={saveFeed} disabled={saving || !canProceed()}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                            Create Feed
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MergeFeedsPage
