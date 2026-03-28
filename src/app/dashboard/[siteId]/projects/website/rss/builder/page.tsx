'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, Image, Link2, Loader2, MousePointer2, Save, Type, User, Calendar, FileText, Wand2, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface SelectorField {
    key: string;
    label: string;
    description: string;
    value: string;
    required?: boolean;
    icon: React.ReactNode;
}

const RSSBuilderPage = ({ params }: { params: Promise<{ siteId: string }> }) => {
    const router = useRouter()
    const { siteId } = use(params as any) as any

    const iframeRef = useRef<HTMLIFrameElement>(null)

    const [url, setUrl] = useState("")
    const [templateName, setTemplateName] = useState("")
    const [loading, setLoading] = useState(false)
    const [iframeLoaded, setIframeLoaded] = useState(false)
    const [activeField, setActiveField] = useState<string | null>(null)
    const [previewItems, setPreviewItems] = useState<any[]>([])
    const [saving, setSaving] = useState(false)
    const [showSaveDialog, setShowSaveDialog] = useState(false)

    // Selector fields with icons
    const [selectors, setSelectors] = useState<SelectorField[]>([
        { key: "containerSelector", label: "Container", description: "Article wrapper element", value: "", required: true, icon: <MousePointer2 className="h-4 w-4" /> },
        { key: "titleSelector", label: "Title", description: "Article headline", value: "", icon: <Type className="h-4 w-4" /> },
        { key: "linkSelector", label: "Link", description: "Article URL", value: "", icon: <Link2 className="h-4 w-4" /> },
        { key: "thumbnailSelector", label: "Image", description: "Featured thumbnail", value: "", icon: <Image className="h-4 w-4" /> },
        { key: "descriptionSelector", label: "Excerpt", description: "Summary text", value: "", icon: <FileText className="h-4 w-4" /> },
        { key: "dateSelector", label: "Date", description: "Publish date", value: "", icon: <Calendar className="h-4 w-4" /> },
        { key: "authorSelector", label: "Author", description: "Writer name", value: "", icon: <User className="h-4 w-4" /> },
    ])

    // Load URL in iframe via proxy
    const loadPage = useCallback(async () => {
        if (!url) return

        setLoading(true)
        setIframeLoaded(false)
        setPreviewItems([])

        try {
            new URL(url)
        } catch {
            toast.error("Please enter a valid URL")
            setLoading(false)
            return
        }

        // Reset selectors
        setSelectors(prev => prev.map(s => ({ ...s, value: "" })))
        setActiveField(null)

        // Load via proxy
        if (iframeRef.current) {
            iframeRef.current.src = `/api/proxy?url=${encodeURIComponent(url)}`
        }
    }, [url])

    // Handle iframe load
    const handleIframeLoad = useCallback(() => {
        setLoading(false)
        setIframeLoaded(true)
    }, [])

    // Handle messages from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type !== 'rss-builder') return

            const { action, selector, tagName, text, src, href } = event.data

            if (action === 'ready') {
                console.log('RSS Builder iframe ready')
            }

            if (action === 'element-selected' && activeField) {
                setSelectors(prev => prev.map(s =>
                    s.key === activeField ? { ...s, value: selector } : s
                ))

                toast.success(`Selected: ${tagName}`, {
                    description: text?.slice(0, 50) || src?.slice(0, 50) || href?.slice(0, 50) || "Element selected"
                })

                // Auto-advance to next empty field
                const currentIndex = selectors.findIndex(s => s.key === activeField)
                const nextEmpty = selectors.find((s, i) => i > currentIndex && !s.value)
                if (nextEmpty) {
                    setActiveField(nextEmpty.key)
                } else {
                    setActiveField(null)
                }
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [activeField, selectors])

    // Preview the scraped items
    const previewScrape = async () => {
        const container = selectors.find(s => s.key === "containerSelector")?.value
        if (!container) {
            toast.error("Please select a container element first")
            return
        }

        setLoading(true)
        try {
            const response = await fetch(`/api/team/${siteId}/rss/templates/preview`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetUrl: url,
                    ...Object.fromEntries(selectors.map(s => [s.key, s.value]))
                })
            })

            if (!response.ok) throw new Error("Preview failed")

            const data = await response.json()
            setPreviewItems(data.items || [])
            toast.success(`Found ${data.items?.length || 0} items`)
        } catch (err: any) {
            toast.error("Preview failed: " + (err.message || "Unknown error"))
        } finally {
            setLoading(false)
        }
    }

    // Save the template
    const saveTemplate = async () => {
        if (!templateName.trim()) {
            toast.error("Please enter a template name")
            return
        }

        const container = selectors.find(s => s.key === "containerSelector")?.value
        if (!container) {
            toast.error("Container selector is required")
            return
        }

        setSaving(true)
        try {
            const response = await fetch(`/api/team/${siteId}/rss/templates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: templateName,
                    targetUrl: url,
                    ...Object.fromEntries(selectors.map(s => [s.key, s.value || null]))
                })
            })

            if (!response.ok) throw new Error("Failed to save template")

            toast.success("Template saved successfully!")
            setShowSaveDialog(false)
            router.push(`/dashboard/${siteId}/projects/website/rss`)
        } catch (err: any) {
            toast.error("Save failed: " + (err.message || "Unknown error"))
        } finally {
            setSaving(false)
        }
    }

    const completedCount = selectors.filter(s => s.value).length
    const totalRequired = selectors.filter(s => s.required).length
    const requiredComplete = selectors.filter(s => s.required && s.value).length === totalRequired

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* Header */}
            <header className="shrink-0 border-b bg-background">
                <div className="flex items-center justify-between h-14 px-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/dashboard/${siteId}/projects/website/rss`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="h-4 w-px bg-border" />
                        <div>
                            <h1 className="text-sm font-medium">RSS Builder</h1>
                            <p className="text-xs text-muted-foreground">Create custom feed</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {iframeLoaded && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={previewScrape}
                                    disabled={loading || !requiredComplete}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Wand2 className="h-4 w-4 mr-1.5" />}
                                    Test
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setShowSaveDialog(true)}
                                    disabled={!requiredComplete}
                                >
                                    <Save className="h-4 w-4 mr-1.5" />
                                    Save
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex min-h-0">
                {/* Sidebar */}
                <div className="w-72 shrink-0 border-r flex flex-col bg-muted/30">
                    {/* URL Input Section */}
                    <div className="p-4 border-b">
                        <Label className="text-xs font-medium text-muted-foreground mb-2 block">Target URL</Label>
                        <div className="flex gap-1.5">
                            <Input
                                placeholder="https://example.com/blog"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && loadPage()}
                                className="h-9 text-sm"
                            />
                            <Button
                                onClick={loadPage}
                                disabled={loading || !url}
                                size="sm"
                                className="h-9 px-2.5"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Selectors List */}
                    <ScrollArea className="flex-1">
                        <div className="p-3">
                            {iframeLoaded ? (
                                <>
                                    <div className="flex items-center justify-between mb-2 px-1">
                                        <span className="text-xs font-medium text-muted-foreground">Element Selectors</span>
                                        <span className="text-[10px] text-muted-foreground">{completedCount}/{selectors.length}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {selectors.map((selector) => {
                                            const isActive = activeField === selector.key;
                                            const hasValue = !!selector.value;

                                            return (
                                                <div
                                                    key={selector.key}
                                                    className={`
                                                        rounded-lg border transition-all
                                                        ${isActive
                                                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                                            : hasValue
                                                                ? 'border-green-500/30 bg-green-500/5'
                                                                : 'border-border hover:border-muted-foreground/30'
                                                        }
                                                    `}
                                                >
                                                    <button
                                                        className="w-full flex items-center gap-2 p-2 text-left"
                                                        onClick={() => setActiveField(isActive ? null : selector.key)}
                                                    >
                                                        <div className={`
                                                            shrink-0 w-7 h-7 rounded-md flex items-center justify-center
                                                            ${isActive
                                                                ? 'bg-primary text-primary-foreground'
                                                                : hasValue
                                                                    ? 'bg-green-500/20 text-green-600'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }
                                                        `}>
                                                            {hasValue ? <CheckCircle2 className="h-3.5 w-3.5" /> : selector.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0 overflow-hidden">
                                                            <div className="flex items-center gap-1">
                                                                <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                                                                    {selector.label}
                                                                </span>
                                                                {selector.required && !hasValue && (
                                                                    <span className="text-destructive text-xs">*</span>
                                                                )}
                                                            </div>
                                                            <p
                                                                className="text-[10px] text-muted-foreground truncate max-w-full"
                                                                title={hasValue ? selector.value : selector.description}
                                                            >
                                                                {hasValue ? selector.value.split(' > ').slice(-2).join(' > ') : selector.description}
                                                            </p>
                                                        </div>
                                                        {hasValue && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectors(prev => prev.map(s =>
                                                                        s.key === selector.key ? { ...s, value: '' } : s
                                                                    ));
                                                                }}
                                                                className="shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 px-4">
                                    <MousePointer2 className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
                                    <p className="text-sm text-muted-foreground">Enter a URL above to start</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Preview Results */}
                    {previewItems.length > 0 && (
                        <div className="border-t p-3 bg-background/50">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-xs font-semibold">Scraped Articles</span>
                                <Badge className="text-[10px] h-5 bg-green-500/15 text-green-600 border-green-500/30">
                                    {previewItems.length} found
                                </Badge>
                            </div>
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {previewItems.map((item, i) => (
                                    <div
                                        key={i}
                                        className="group bg-background rounded-lg border p-2 hover:border-primary/30 transition-colors"
                                    >
                                        <div className="flex gap-2.5">
                                            {item.thumbnail ? (
                                                <div className="w-14 h-14 rounded-md bg-muted shrink-0 overflow-hidden">
                                                    <img
                                                        src={item.thumbnail}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => e.currentTarget.style.display = 'none'}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-14 h-14 rounded-md bg-muted shrink-0 flex items-center justify-center">
                                                    <FileText className="h-5 w-5 text-muted-foreground/30" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-medium leading-snug line-clamp-2">
                                                    {item.title || 'Untitled'}
                                                </h4>
                                                {item.description && (
                                                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                                                        {item.description}
                                                    </p>
                                                )}
                                                {item.link && (
                                                    <a
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] text-primary/70 hover:text-primary flex items-center gap-0.5 mt-1"
                                                    >
                                                        <ExternalLink className="h-2.5 w-2.5" />
                                                        <span className="truncate">{new URL(item.link).hostname}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Panel */}
                <div className="flex-1 relative bg-muted/5">
                    {!iframeLoaded && !loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center max-w-xs">
                                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                                    <MousePointer2 className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-base font-medium text-muted-foreground mb-1">Load a website</h3>
                                <p className="text-sm text-muted-foreground/70">
                                    Enter a URL in the sidebar to preview and select elements
                                </p>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-2" />
                                <p className="text-sm text-muted-foreground">Loading page...</p>
                            </div>
                        </div>
                    )}

                    {activeField && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                            <Badge className="bg-primary text-primary-foreground shadow-lg px-3 py-1">
                                <MousePointer2 className="h-3 w-3 mr-1.5" />
                                Select {selectors.find(s => s.key === activeField)?.label}
                            </Badge>
                        </div>
                    )}

                    <iframe
                        ref={iframeRef}
                        className="w-full h-full border-0"
                        onLoad={handleIframeLoad}
                        sandbox="allow-same-origin allow-scripts"
                    />
                </div>
            </div>

            {/* Save Dialog */}
            <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Save Feed Template</AlertDialogTitle>
                        <AlertDialogDescription>
                            Give your template a name to save it for future use
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                        <Label htmlFor="template-name" className="text-sm">Template Name</Label>
                        <Input
                            id="template-name"
                            placeholder="e.g., Tech News Feed"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="mt-2"
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
                        <Button onClick={saveTemplate} disabled={saving || !templateName.trim()}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Save Template
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default RSSBuilderPage
