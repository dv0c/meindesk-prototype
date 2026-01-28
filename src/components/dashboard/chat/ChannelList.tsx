"use client"

import * as React from "react"
import { Hash, Volume2, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createChannel, deleteChannel, getChannels } from "@/lib/actions/channel-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Channel {
    id: string
    name: string
    type: string
}

interface ChannelListProps {
    siteId: string
    channels: Channel[]
    activeChannelId?: string
    onSelectChannel: (channelId: string) => void
    isAdmin?: boolean // to allow deleting
}

export function ChannelList({ siteId, channels, activeChannelId, onSelectChannel, isAdmin }: ChannelListProps) {
    const [open, setOpen] = React.useState(false)
    const [newChannelName, setNewChannelName] = React.useState("")
    const [creating, setCreating] = React.useState(false)
    const router = useRouter()

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newChannelName) return

        setCreating(true)
        const res = await createChannel(siteId, newChannelName.toLowerCase().replace(/\s+/g, '-'))
        setCreating(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            setOpen(false)
            setNewChannelName("")
            toast.success("Channel created")
            router.refresh()
            // optionally select formatting
            if (res.channel) onSelectChannel(res.channel.id)
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!confirm("Delete this channel?")) return

        const res = await deleteChannel(siteId, id)
        if (res.error) toast.error(res.error)
        else {
            toast.success("Channel deleted")
            router.refresh()
            if (activeChannelId === id) onSelectChannel("") // deselect
        }
    }

    return (
        <div className="flex flex-col w-60 border-r bg-muted/10 h-full">
            <div className="p-4 border-b flex items-center justify-between">
                <span className="font-semibold text-sm">Channels</span>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Channel</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <Input
                                placeholder="channel-name"
                                value={newChannelName}
                                onChange={(e) => setNewChannelName(e.target.value)}
                            />
                            <Button type="submit" disabled={creating || !newChannelName} className="w-full">
                                {creating ? "Creating..." : "Create Channel"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {channels.map((channel) => (
                        <button
                            key={channel.id}
                            onClick={() => onSelectChannel(channel.id)}
                            className={cn(
                                "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors group",
                                activeChannelId === channel.id
                                    ? "bg-accent text-accent-foreground font-medium"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center">
                                {channel.type === "VOICE" ? (
                                    <Volume2 className="h-4 w-4 mr-2 opacity-70" />
                                ) : (
                                    <Hash className="h-4 w-4 mr-2 opacity-70" />
                                )}
                                <span className="truncate">{channel.name}</span>
                            </div>
                            {/* Simple delete check - ideally stricter role check */}
                            {isAdmin && (
                                <div
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded cursor-pointer text-muted-foreground hover:text-destructive transition-all"
                                    onClick={(e) => handleDelete(e, channel.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </div>
                            )}
                        </button>
                    ))}
                    {channels.length === 0 && (
                        <p className="px-2 text-xs text-muted-foreground">No channels yet.</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
