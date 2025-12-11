"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function SeedAnalyticsPage() {
    const [siteId, setSiteId] = useState("692fedf935643e45ec44576d")
    const [numEvents, setNumEvents] = useState(500)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSeed = async () => {
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const response = await fetch("/api/analytics/seed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ siteId, numEvents }),
            })

            const data = await response.json()

            if (response.ok) {
                setResult(data)
            } else {
                setError(data.error || "Failed to seed analytics")
            }
        } catch (err: any) {
            setError(err.message || "Unknown error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Seed Analytics Data</CardTitle>
                    <CardDescription>
                        Generate fake analytics events for testing
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="siteId">Site ID</Label>
                        <Input
                            id="siteId"
                            value={siteId}
                            onChange={(e) => setSiteId(e.target.value)}
                            placeholder="Enter site ID"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="numEvents">Number of Events</Label>
                        <Input
                            id="numEvents"
                            type="number"
                            value={numEvents}
                            onChange={(e) => setNumEvents(parseInt(e.target.value))}
                            placeholder="500"
                        />
                    </div>

                    <Button
                        onClick={handleSeed}
                        disabled={loading || !siteId}
                        className="w-full"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Seeding..." : "Seed Analytics Data"}
                    </Button>

                    {result && (
                        <div className="rounded-md bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                ✅ {result.message}
                            </p>
                            <ul className="mt-2 text-xs text-green-700 dark:text-green-300 space-y-1">
                                <li>• Deleted: {result.deletedCount} events</li>
                                <li>• Inserted: {result.insertedCount} events</li>
                                <li>• Site ID: {result.siteId}</li>
                            </ul>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-md bg-red-50 dark:bg-red-950 p-4 border border-red-200 dark:border-red-800">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                ❌ {error}
                            </p>
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-4">
                        <p className="font-medium mb-1">This will:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Delete all existing analytics for the site</li>
                            <li>Generate fake events spanning last 90 days</li>
                            <li>Include various pages, devices, and locations</li>
                            <li>Create realistic traffic patterns</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
