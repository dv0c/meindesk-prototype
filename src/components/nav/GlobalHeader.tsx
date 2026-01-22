"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Slash, Command, ChevronsUpDown, Check, Plus, MessageSquare, HelpCircle, Bell } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NavUser } from "@/components/nav-user"
import { useTeams } from "@/hooks/useTeams"
import { GalleryVerticalEnd } from "lucide-react"

import { CommandMenu } from "@/components/CommandMenu"
import { UserMenu } from "@/components/nav/UserMenu"

export function GlobalHeader() {
    const { teams } = useTeams()
    const router = useRouter()
    const pathname = usePathname()
    const [open, setOpen] = React.useState(false)

    // Extract active team/site ID from URL
    const currentId = React.useMemo(() => {
        const parts = pathname.split("/")
        // URL is /dashboard/[siteId]/...
        // parts[0] = "", parts[1] = "dashboard", parts[2] = siteId
        return parts[2] || null
    }, [pathname])

    // Determine context (Team/Site)
    const activeTeam = teams.find(t => t.id === currentId) || null

    const handleTeamChange = (teamId: string) => {
        // Simple navigation to dashboard of that team
        router.push(`/dashboard/${teamId}`)
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4 md:px-6 gap-2">
                {/* Logo Area */}
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <div className="bg-black dark:bg-white text-white dark:text-black flex size-6 items-center justify-center rounded-lg">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    <span className="hidden md:block">Meindesk</span>
                </Link>

                <Slash className="text-muted-foreground/30 w-4 h-4 rotate-[-15deg]" />

                {/* Scope Switcher (User / Team) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 gap-2 px-2 text-sm font-normal">
                            <span className="font-medium">{activeTeam ? activeTeam.title : "Tasos User"}</span>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Personal Account</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                            <Avatar className="h-5 w-5">
                                <AvatarFallback>T</AvatarFallback>
                            </Avatar>
                            Tasos
                            <Check className={!activeTeam ? "ml-auto w-4 h-4" : "ml-auto w-4 h-4 opacity-0"} />
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Teams</DropdownMenuLabel>
                        {teams.map(team => (
                            <DropdownMenuItem key={team.id} onClick={() => handleTeamChange(team.id)} className="gap-2 cursor-pointer">
                                <div className="flex size-5 items-center justify-center rounded border bg-background">
                                    <GalleryVerticalEnd className="size-3" />
                                </div>
                                {team.title}
                                <Check className={activeTeam?.id === team.id ? "ml-auto w-4 h-4" : "ml-auto w-4 h-4 opacity-0"} />
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/setup')}>
                            <Plus className="w-4 h-4 mr-2" /> Create Team
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Right Side Actions */}
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="hidden md:flex h-8 w-64 justify-start text-muted-foreground bg-muted/50"
                        onClick={() => setOpen(true)}
                    >
                        <span className="truncate">Search...</span>
                        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button>
                    <CommandMenu open={open} setOpen={setOpen} />

                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <HelpCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Bell className="h-4 w-4" />
                    </Button>

                    <div className="pl-2">
                        <UserMenu />
                    </div>
                </div>
            </div>
        </header>
    )
}
