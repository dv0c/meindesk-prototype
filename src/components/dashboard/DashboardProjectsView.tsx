"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Plus, MapPin, ExternalLink, GitBranch, Github, MoreHorizontal } from "lucide-react"
import { Site } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Framework icons mapping (mock for now, mostly Next.js/React)
const FrameworkIcon = ({ type }: { type?: string }) => {
    return (
        <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
            <svg viewBox="0 0 180 180" width="18" height="18" fill="currentColor">
                <mask height="180" id="mask0_408_134" maskUnits="userSpaceOnUse" width="180" x="0" y="0" style={{ maskType: 'alpha' }}>
                    <circle cx="90" cy="90" fill="black" r="90"></circle>
                </mask>
                <g mask="url(#mask0_408_134)">
                    <circle cx="90" cy="90" data-circle="true" fill="black" r="90"></circle>
                    <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0_linear_408_134)"></path>
                    <rect fill="url(#paint1_linear_408_134)" height="72" width="12" x="115" y="54"></rect>
                </g>
                <defs>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_408_134" x1="109" x2="144.5" y1="116.5" y2="160.5">
                        <stop stopColor="white"></stop>
                        <stop offset="1" stopColor="white" stopOpacity="0"></stop>
                    </linearGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_408_134" x1="121" x2="120.799" y1="54" y2="106.875">
                        <stop stopColor="white"></stop>
                        <stop offset="1" stopColor="white" stopOpacity="0"></stop>
                    </linearGradient>
                </defs>
            </svg>
        </div>
    )
}

import { DashboardNavigation } from "@/components/nav/DashboardNavigation"

// ... imports

export function DashboardProjectsView({ sites, userId }: { sites: Site[], userId: string }) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")

    const filteredSites = sites.filter(site =>
        site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.subdomain?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Top Bar for View Selection (Vercel Style) */}
            <div className="sticky top-0 z-10">
                <DashboardNavigation />
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Search and Add Area */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between">
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            className="pl-9 bg-background border-muted-foreground/20 focus-visible:ring-1 focus-visible:ring-foreground"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="hidden md:flex">
                                    Add New...
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push('/setup')}>Project</DropdownMenuItem>
                                <DropdownMenuItem>Domain</DropdownMenuItem>
                                <DropdownMenuItem>Team Member</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button onClick={() => router.push('/setup')}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Project
                        </Button>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSites.map((site) => (
                        <Card
                            key={site.id}
                            className={cn(
                                "group hover:border-foreground/50 transition-colors duration-200 cursor-pointer",
                                site.userId !== userId && "border-orange-500/50 hover:border-orange-500"
                            )}
                            onClick={() => router.push(`/dashboard/${site.id}`)}
                        >
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="flex gap-3 items-center">
                                    <FrameworkIcon />
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-medium leading-none">
                                            {site.title}
                                        </CardTitle>
                                        <CardDescription className="text-xs break-all">
                                            {site.url || `${site.subdomain}.meindesk.gr`}
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="rounded-md border bg-muted/20 p-3 text-xs font-mono mb-4 text-muted-foreground truncate">
                                    {site.description || "No description provided."}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <GitBranch className="w-3 h-3" />
                                    <span>main</span>
                                    <span className="mx-1">•</span>
                                    <span>{formatDistanceToNow(new Date(site.createdAt), { addSuffix: true })}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 pb-4 px-6 flex justify-between items-center text-xs text-muted-foreground border-t bg-muted/5 mt-4 group-hover:bg-muted/10 transition-colors rounded-b-lg">
                                <div className="flex items-center gap-2 pt-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Ready
                                </div>
                                <div className="pt-3 hover:text-foreground transition-colors" onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(site.url ? (site.url.startsWith('http') ? site.url : `https://${site.url}`) : `https://${site.subdomain}.meindesk.gr`, '_blank');
                                }}>
                                    <div className="flex items-center gap-1">
                                        Visit <ExternalLink className="w-3 h-3" />
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}

                    {/* Empty State */}
                    {filteredSites.length === 0 && (
                        <div className="col-span-full py-12 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
                            <p>No projects found matching your search.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
