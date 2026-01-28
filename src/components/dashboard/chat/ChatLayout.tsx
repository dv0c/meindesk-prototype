"use client"

import * as React from "react"
import { ChannelList } from "./ChannelList"
import { ChatInterface } from "./ChatInterface"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { OnlineMembers } from "./OnlineMembers"

interface ChatLayoutProps {
    siteId: string
    currentUserId: string
    channels: any[] // Prisma Channel type
    initialMessages?: any[]
}

export default function ChatLayout({ siteId, currentUserId, channels }: ChatLayoutProps) {
    // We can store active channel in URL search param or state. URL is better for sharing.
    // e.g. ?channelId=...
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    // Default to first channel if exists and none selected
    const activeChannelId = searchParams?.get("channelId") || (channels.length > 0 ? channels[0].id : undefined)

    // Find active channel object for title etc
    const activeChannel = channels.find(c => c.id === activeChannelId)

    const handleSelectChannel = (channelId: string) => {
        const params = new URLSearchParams(searchParams?.toString())
        params.set("channelId", channelId)
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] border rounded-lg overflow-hidden bg-background shadow-sm">
            <div className="flex flex-col w-60 border-r bg-muted/10 h-full">
                {/* Channel List is main content of sidebar */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <ChannelList
                        siteId={siteId}
                        channels={channels}
                        activeChannelId={activeChannelId}
                        onSelectChannel={handleSelectChannel}
                        isAdmin={true}
                    />
                </div>
                {/* Online Members at bottom of sidebar */}
                <div className="p-3 border-t bg-background/50">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 px-1">Team Members</p>
                    <OnlineMembers siteId={siteId} currentUserId={currentUserId} />
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                {activeChannelId ? (
                    <ChatInterface
                        key={activeChannelId} // Remount on channel change to reset state cleanly
                        siteId={siteId}
                        currentUserId={currentUserId}
                        channelId={activeChannelId}
                        channelName={activeChannel?.name}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/5">
                        <div className="text-center">
                            <p>Select a channel to start chatting</p>
                            <p className="text-xs opacity-70">or create a new one</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
