"use client"
import { Button } from "@/components/ui/button"
import type React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Site } from "@prisma/client"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const WebsiteSettings = ({ site }: { site: Site }) => {
    const [name, setName] = useState(site.title)
    const [url, setUrl] = useState(site.url || "")
    const [nameError, setNameError] = useState("")
    const [urlError, setUrlError] = useState("")
    const [isLoading, setLoading] = useState(false)
    const [isUrlLoading, setUrlLoading] = useState(false)
    const router = useRouter()

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setNameError("")
        setLoading(true)

        try {
            await axios.put("/api/team/" + site.id, {
                title: name,
                description: site.description,
                link: site.url,
                siteId: site.id,
            })
            toast.success("Website name updated successfully!")
            location.reload()
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to update website name"
            setNameError(errorMessage)
            toast.error(errorMessage)
        } finally {
                setLoading(false)
        }
    }

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUrlError("")
        setUrlLoading(true)

        try {
            await axios.put("/api/team/" + site.id, {
                title: site.title,
                description: site.description,
                link: url,
                siteId: site.id,
            })
            toast.success("Website URL updated successfully!")
            location.reload()
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to update website URL"
            setUrlError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setUrlLoading(false)
        }
    }

    return (
        <div className="max-w-3xl w-full">
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Change your website name</CardTitle>
                        <CardDescription>Change the name of your website to something more memorable.</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-0">
                        <form id="submit" onSubmit={handleNameSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="name">Website Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Your website name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                {nameError && <p className="text-sm font-medium text-destructive">{nameError}</p>}
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="border-t px-6">
                        <Button className="cursor-pointer" form="submit" disabled={isLoading}>
                            {isLoading ? "Loading..." : "Update"}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Change your website URL</CardTitle>
                        <CardDescription>Update the URL where your website is hosted.</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-0">
                        <form id="submit-url" onSubmit={handleUrlSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="url">Website URL</Label>
                                <Input
                                    id="url"
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                                {urlError && <p className="text-sm font-medium text-destructive">{urlError}</p>}
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="border-t px-6 ">
                        <Button className="cursor-pointer" form="submit-url" disabled={isUrlLoading}>
                            {isUrlLoading ? "Loading..." : "Update"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default WebsiteSettings
