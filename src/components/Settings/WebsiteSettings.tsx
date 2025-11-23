"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Site } from "@prisma/client"

import { usePages } from "@/hooks/use-pages"

interface Page {
    id: string
    title: string
    slug: string
}

const WebsiteSettings = ({ site }: { site: Site }) => {
    const router = useRouter()

    // --- State ---
    const [name, setName] = useState(site.title)
    const [url, setUrl] = useState(site.url || "")
    const [homePageId, setHomePageId] = useState<string | null>(null)
    const [isNameLoading, setNameLoading] = useState(false)
    const [isUrlLoading, setUrlLoading] = useState(false)
    const [isHomePageLoading, setHomePageLoading] = useState(false)
    const [nameError, setNameError] = useState("")
    const [urlError, setUrlError] = useState("")

    const { pages, getPages, loading: pagesLoading } = usePages()

    // --- Fetch pages on mount ---
    useEffect(() => {
        getPages(site.id).then((fetchedPages) => {
            const currentHome = fetchedPages.find((p: any) => p.slug === site.home_Id)
            if (currentHome) setHomePageId(currentHome.slug)
        })
    }, [site.id, getPages])

    // --- Handlers ---
    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setNameError("")
        setNameLoading(true)

        try {
            await axios.put(`/api/team/${site.id}`, {
                title: name,
                description: site.description,
                link: site.url,
                siteId: site.id,
            })
            toast.success("Website name updated successfully!")
            router.refresh()
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to update website name"
            setNameError(message)
            toast.error(message)
        } finally {
            setNameLoading(false)
        }
    }

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUrlError("")
        setUrlLoading(true)

        try {
            await axios.put(`/api/team/${site.id}`, {
                title: site.title,
                description: site.description,
                link: url,
                siteId: site.id,
            })
            toast.success("Website URL updated successfully!")
            router.refresh()
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to update website URL"
            setUrlError(message)
            toast.error(message)
        } finally {
            setUrlLoading(false)
        }
    }

    const handleSaveHomePage = async () => {
        if (!homePageId) {
            toast.error("Please select a homepage first")
            return
        }

        setHomePageLoading(true)
        try {
            await axios.put(`/api/team/${site.id}`, {
                siteId: site.id,
                home_Id: homePageId
                
            })
            toast.success("Homepage updated successfully!")
        } catch (err) {
            console.error(err)
            toast.error("Failed to update homepage")
        } finally {
            setHomePageLoading(false)
        }
    }

    return (
        <div className="max-w-3xl pl-5 w-full">
            <div className="grid gap-6">

                {/* Website Name */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change your website name</CardTitle>
                        <CardDescription>Change the name of your website to something more memorable.</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-0">
                        <form onSubmit={handleNameSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="name">Website Name</Label>
                                <Input id="name" placeholder="Your website name" value={name} onChange={(e) => setName(e.target.value)} />
                                {nameError && <p className="text-sm font-medium text-destructive">{nameError}</p>}
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="border-t px-6">
                        <Button form="" onClick={handleNameSubmit} disabled={isNameLoading}>
                            {isNameLoading ? "Loading..." : "Update"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Website URL */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change your website URL</CardTitle>
                        <CardDescription>Update the URL where your website is hosted.</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-0">
                        <form onSubmit={handleUrlSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="url">Website URL</Label>
                                <Input id="url" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
                                {urlError && <p className="text-sm font-medium text-destructive">{urlError}</p>}
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="border-t px-6">
                        <Button form="" onClick={handleUrlSubmit} disabled={isUrlLoading}>
                            {isUrlLoading ? "Loading..." : "Update"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Homepage selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change your Home Page</CardTitle>
                        <CardDescription>Select which page should be the homepage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="homepage">Homepage Page</Label>
                            <Select value={homePageId || ""} onValueChange={setHomePageId} disabled={pagesLoading}>
                                <SelectTrigger>
                                    <SelectValue className="w-full" defaultValue={pages.find((f) => f.slug == site.home_Id)} placeholder={pagesLoading ? "Loading pages..." : "Select a page"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {pages.map((p: Page) => (
                                        <SelectItem key={p.slug} value={p.slug}>
                                            {p.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6">
                        <Button onClick={handleSaveHomePage} disabled={isHomePageLoading || pagesLoading}>
                            {isHomePageLoading ? "Saving..." : "Update"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default WebsiteSettings
