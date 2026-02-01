"use client"

import * as React from "react"
import { updatePresence, getOnlineMembers } from "@/lib/actions/presence-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface OnlineMember {
    id: string
    name: string
    image: string | null
    isOnline: boolean
}

interface OnlineMembersProps {
    siteId: string
    currentUserId: string
    showLabel?: boolean
    showSeparator?: boolean
}

export function OnlineMembers({ siteId, currentUserId, showLabel = false, showSeparator = false }: OnlineMembersProps) {
    const [members, setMembers] = React.useState<OnlineMember[]>([])

    // 1. Heartbeat: Update my presence every 30s
    React.useEffect(() => {
        // Initial update
        updatePresence()

        const interval = setInterval(() => {
            updatePresence()
        }, 30 * 1000)

        return () => clearInterval(interval)
    }, [])

    // 2. Fetch Members: Poll every 10s to see who is online
    React.useEffect(() => {
        const fetchMembers = async () => {
            const data = await getOnlineMembers(siteId)
            setMembers(data as OnlineMember[])
        }

        fetchMembers()
        const interval = setInterval(fetchMembers, 10000)
        return () => clearInterval(interval)
    }, [siteId])

    // Hide if only the current user is online (or no one)
    if (members.length <= 1) return null

    // Filter to show max 5 users in stack
    const displayMembers = members.slice(0, 5)
    const remainingCount = Math.max(0, members.length - 5)

    return (
        <div className={cn("flex items-center gap-2", showSeparator && "pl-4 border-l h-6")}>
            {showLabel && (
                <span className="text-[10px] font-medium text-muted-foreground uppercase hidden sm:block">Online</span>
            )}
            <div className="flex items-center -space-x-2 overflow-hidden py-1 px-1">
                <TooltipProvider delayDuration={0}>
                    {displayMembers.map((member) => (
                        <Tooltip key={member.id}>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "relative transition-transform hover:z-10 hover:-translate-y-1 block",
                                    member.isOnline ? "z-10" : "z-0 opacity-70 grayscale"
                                )}>
                                    <Avatar className="h-8 w-8 ring-2 ring-background border border-border">
                                        <AvatarImage src={member.image || ""} />
                                        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                            {member.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    {member.isOnline && (
                                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background block" />
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs font-medium">
                                    {member.name} {member.id === currentUserId && "(You)"}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{member.isOnline ? "Online" : "Offline"}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                    {remainingCount > 0 && (
                        <div className="h-8 w-8 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground relative z-0">
                            +{remainingCount}
                        </div>
                    )}
                </TooltipProvider>
            </div>
        </div>
    )
}
