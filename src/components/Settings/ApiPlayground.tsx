"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { AlertCircle, Clock, Copy, Loader2, Play } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function ApiPlayground({ siteId, className, hideHeader = false }: { siteId: string, className?: string, hideHeader?: boolean }) {
    const [method, setMethod] = useState("GET")
    const [endpoint, setEndpoint] = useState("articles")
    const [response, setResponse] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<number | null>(null)
    const [time, setTime] = useState<number | null>(null)
    const [queryParams, setQueryParams] = useState<Record<string, string>>({})

    const handleEndpointChange = (val: string) => {
        setEndpoint(val)
        setQueryParams({})
        setResponse(null)
        setStatus(null)
        setTime(null)
    }

    const updateQueryParam = (key: string, value: string) => {
        setQueryParams(prev => {
            const next = { ...prev }
            if (!value) {
                delete next[key]
            } else {
                next[key] = value
            }
            return next
        })
    }

    const fetchEndpoint = async () => {
        setLoading(true)
        setResponse(null)
        setStatus(null)
        setTime(null)

        const startTime = performance.now()

        const qs = new URLSearchParams(queryParams).toString()
        const url = `/api/v1/${siteId}/${endpoint}${qs ? `?${qs}` : ""}`

        try {
            const res = await fetch(url)
            const endTime = performance.now()
            setTime(Math.round(endTime - startTime))
            setStatus(res.status)

            const data = await res.json()
            setResponse(data)
        } catch (error) {
            setStatus(500)
            setResponse({ error: "Network Error" })
        } finally {
            setLoading(false)
        }
    }

    const copyResponse = () => {
        if (!response) return
        navigator.clipboard.writeText(JSON.stringify(response, null, 2))
        toast.success("Response copied to clipboard")
    }

    const qs = new URLSearchParams(queryParams).toString()
    const fullUrl = `https://meindesk.gr/api/v1/${siteId}/${endpoint}${qs ? `?${qs}` : ""}`

    return (
        <Card className={cn("flex flex-col h-full shadow-md border-border/50", className)}>
            {!hideHeader && (
                <CardHeader className="pb-4 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                API Console
                            </CardTitle>
                            <CardDescription className="font-mono text-xs mt-1">
                                {siteId}
                            </CardDescription>
                        </div>
                        {status !== null && (
                            <div className="flex items-center gap-2 text-xs font-mono">
                                <Badge variant={status >= 200 && status < 300 ? "default" : "destructive"} className="h-6">
                                    {status} {status === 200 ? "OK" : "ERROR"}
                                </Badge>
                                <Badge variant="outline" className="h-6 gap-1">
                                    <Clock className="w-3 h-3" />
                                    {time}ms
                                </Badge>
                            </div>
                        )}
                    </div>
                </CardHeader>
            )}
            <CardContent className="p-0 flex flex-col md:flex-row flex-1 min-h-0">
                {/* Sidebar / Controls */}
                <div className="w-full md:w-[360px] border-b md:border-b-0 md:border-r p-5 space-y-6 bg-muted/10 shrink-0 overflow-y-auto">
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1 h-3 bg-primary rounded-full"></span>
                            Request Method
                        </label>
                        <div className="flex gap-2">
                            <Select value={method} onValueChange={setMethod} disabled>
                                <SelectTrigger className="w-[110px] h-10 font-mono font-bold text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 dark:text-blue-400 border-blue-200 dark:border-blue-900/30">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button className="flex-1 h-10 font-semibold shadow-sm" onClick={fetchEndpoint} disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2 fill-current" />}
                                Send Request
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1 h-3 bg-primary rounded-full"></span>
                            Target Endpoint
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-x-0 -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                <span className="bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-lg border">
                                    Base: https://meindesk.gr/api/v1/{siteId}
                                </span>
                            </div>
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs font-medium">/v1/</span>
                            <Select value={endpoint} onValueChange={setEndpoint}>
                                <SelectTrigger className="pl-10 h-10 font-mono text-sm bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="articles">articles</SelectItem>
                                    <SelectItem value="categories">categories</SelectItem>
                                    <SelectItem value="authors">authors</SelectItem>
                                    <SelectItem value="collections">collections</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-[10px] text-muted-foreground border rounded bg-muted/30 p-2 break-all font-mono leading-relaxed select-all">
                            <span className="opacity-50 select-none">GET </span>
                            https://meindesk.gr/api/v1/{siteId}/{endpoint}
                        </div>
                    </div>

                    <div className="pt-2">
                        <Tabs defaultValue="params" className="w-full">
                            <TabsList className="w-full grid grid-cols-2 h-9 p-1 bg-muted/50">
                                <TabsTrigger value="params" className="text-xs font-medium">Parameters</TabsTrigger>
                                <TabsTrigger value="headers" className="text-xs font-medium">Headers</TabsTrigger>
                            </TabsList>
                            <TabsContent value="params" className="mt-4 border rounded-md border-dashed bg-muted/10 p-3">
                                {endpoint === "articles" ? (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-medium uppercase text-muted-foreground">Limit</label>
                                            <Input
                                                className="h-8 text-xs bg-background"
                                                placeholder="e.g. 10"
                                                value={queryParams.limit || ""}
                                                onChange={(e) => updateQueryParam("limit", e.target.value)}
                                                type="number"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-medium uppercase text-muted-foreground">Filter Categories</label>
                                            <Input
                                                className="h-8 text-xs bg-background"
                                                placeholder="e.g. tech, design"
                                                value={queryParams.categories || ""}
                                                onChange={(e) => updateQueryParam("categories", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ) : endpoint === "categories" ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border rounded-md p-3 bg-background">
                                            <label className="text-xs font-medium uppercase text-muted-foreground">Only with Articles</label>
                                            <Switch
                                                checked={queryParams.has_articles === "true"}
                                                onCheckedChange={(checked) => updateQueryParam("has_articles", checked ? "true" : "")}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground text-center py-4 italic">No query parameters available</div>
                                )}
                            </TabsContent>
                            <TabsContent value="headers" className="mt-4 space-y-2 border rounded-md p-3 bg-background">
                                <div className="flex justify-between items-center text-xs font-mono border-b pb-2 last:border-0 last:pb-0">
                                    <span className="text-muted-foreground">Accept</span>
                                    <span className="bg-muted px-1.5 py-0.5 rounded text-foreground">application/json</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-mono border-b pb-2 pt-2 last:border-0 last:pb-0">
                                    <span className="text-muted-foreground">Content-Type</span>
                                    <span className="bg-muted px-1.5 py-0.5 rounded text-foreground">application/json</span>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Response Area */}
                <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 dark:bg-black/50">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-zinc-900/50">
                        <span className="text-xs font-medium text-zinc-400">Response Body</span>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white hover:bg-white/10" onClick={copyResponse} disabled={!response}>
                                <Copy className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                        {response ? (
                            <pre className="font-mono text-xs text-green-400 leading-relaxed">
                                {JSON.stringify(response, null, 2)}
                            </pre>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-3 opacity-50">
                                <div className="w-12 h-12 rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-900">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-medium">No response yet</p>
                                <p className="text-xs max-w-[200px] text-center">Click "Send" to execute the request and see the results.</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

