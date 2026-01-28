"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Site, User } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { DashboardNavigation } from "@/components/nav/DashboardNavigation"
import { Settings, Users, Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type SiteWithMembers = Site & {
    members: User[]
    _count?: {
        members: number
    }
}

export function DashboardTeamsView({ sites, userId }: { sites: SiteWithMembers[], userId: string }) {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <div className="sticky top-0 z-10">
                <DashboardNavigation />
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
                        <p className="text-muted-foreground text-sm">Manage members and permissions across your projects.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sites.map((site) => (
                        <Card key={site.id} className="flex flex-col">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">{site.title}</CardTitle>
                                <CardDescription className="text-xs">{site.url || site.subdomain}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 pb-3">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs font-medium text-muted-foreground mb-2">Members</div>
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {site.members.slice(0, 5).map((member) => (
                                                <Avatar key={member.id} className="inline-block border-2 border-background h-8 w-8">
                                                    <AvatarImage src={member.image || ""} />
                                                    <AvatarFallback>{member.name?.[0]?.toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {(site.members.length > 5 || (site._count?.members || 0) > 5) && (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
                                                    +{(site._count?.members || site.members.length) - 5}
                                                </div>
                                            )}
                                            {site.members.length === 0 && (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/50 bg-transparent text-[10px] text-muted-foreground">
                                                    0
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 flex justify-between">
                                <div className="text-xs text-muted-foreground">
                                    Created {formatDistanceToNow(new Date(site.createdAt), { addSuffix: true })}
                                </div>
                                <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/${site.id}/projects/settings/team`)}>
                                    <Settings className="w-3 h-3 mr-2" />
                                    Manage
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {sites.length === 0 && (
                        <div className="col-span-full py-12 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
                            <p>You are not part of any teams yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
