"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, Globe, MapPin, Monitor, Mouse, User } from "lucide-react"
import { useEffect, useState } from "react"
import { format } from "date-fns"

interface AnalyticsEvent {
    id: string
    path: string
    referrer: string | null
    userAgent: string | null
    region: string | null
    device: string | null
    source: string | null
    eventType: string
    ipAddress: string | null
    createdAt: string
}

interface AnalyticsLogsProps {
    siteId: string
    range: string
}

export function AnalyticsLogs({ siteId, range }: AnalyticsLogsProps) {
    const [events, setEvents] = useState<AnalyticsEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true)
                setError(null)

                const res = await fetch(`/api/analytics/${siteId}/events?range=${range}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                })

                if (!res.ok) {
                    throw new Error(`Failed to load events: ${res.statusText}`)
                }

                const json = await res.json()
                setEvents(json.events || [])
            } catch (err: any) {
                setError(err.message || "Unknown error")
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [siteId, range])

    const getDeviceIcon = (userAgent: string | null) => {
        if (!userAgent) return <Monitor className="h-4 w-4" />
        const ua = userAgent.toLowerCase()
        if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("android")) {
            return <Monitor className="h-4 w-4" />
        }
        return <Monitor className="h-4 w-4" />
    }

    const getDeviceType = (userAgent: string | null) => {
        if (!userAgent) return "Unknown"
        const ua = userAgent.toLowerCase()
        if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("android")) return "Mobile"
        if (ua.includes("tablet") || ua.includes("ipad")) return "Tablet"
        return "Desktop"
    }

    const getTrafficSource = (referrer: string | null, source: string | null) => {
        if (source) return source.charAt(0).toUpperCase() + source.slice(1)
        if (!referrer) return "Direct"
        if (referrer.includes("google")) return "Google"
        if (referrer.includes("facebook") || referrer.includes("instagram")) return "Social Media"
        return "Referral"
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Analytics Event Log</CardTitle>
                    <CardDescription>Real-time visitor activity and behavior</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="h-12 bg-muted rounded" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Analytics Event Log</CardTitle>
                    <CardDescription>Real-time visitor activity and behavior</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">Error: {error}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Analytics Event Log</CardTitle>
                <CardDescription>
                    Real-time visitor activity • {events.length} events tracked
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Time</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Page</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Device</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Visitor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No events recorded yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                events.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-mono text-xs">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <div>
                                                    <div>{format(new Date(event.createdAt), "MMM d, HH:mm:ss")}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {event.eventType?.replace(/_/g, " ") || "page view"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Mouse className="h-3 w-3 text-muted-foreground" />
                                                <span className="font-medium">{event.path}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{event.region || "Unknown"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="gap-1">
                                                {getDeviceIcon(event.userAgent)}
                                                {event.device || getDeviceType(event.userAgent)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="gap-1">
                                                <Globe className="h-3 w-3" />
                                                {getTrafficSource(event.referrer, event.source)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <User className="h-3 w-3" />
                                                {event.ipAddress || "Unknown"}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
