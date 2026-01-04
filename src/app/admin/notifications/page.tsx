"use client"

import { useState, useEffect, useTransition } from "react"
import { getAdminSentNotifications, sendNotification } from "@/lib/actions/notification-actions"
import { searchUsers } from "@/lib/actions/user-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Mail, Plus, Send, Search, BellRing, Info, AlertTriangle, AlertCircle, CheckCircle, Trash2, Archive, ArchiveX, MoreVertical, Reply, Forward } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow, format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export default function AdminNotificationsPage() {
    const [sentNotifications, setSentNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isComposeOpen, setIsComposeOpen] = useState(false)
    const [selectedMailId, setSelectedMailId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // Compose State
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [type, setType] = useState("INFO")
    const [link, setLink] = useState("")

    useEffect(() => {
        loadNotifications()
    }, [])

    const loadNotifications = async () => {
        setLoading(true)
        const res = await getAdminSentNotifications()
        if (res.notifications) {
            setSentNotifications(res.notifications)
            if (res.notifications.length > 0 && !selectedMailId) {
                setSelectedMailId(res.notifications[0].id)
            }
        }
        setLoading(false)
    }

    const handleSend = async () => {
        if (!selectedUser || !title || !message) {
            toast.error("Please fill required fields")
            return
        }

        startTransition(async () => {
            const res = await sendNotification({
                userId: selectedUser.id,
                title,
                message,
                type: type as any,
                link,
            })

            if (res.success) {
                toast.success("Notification Sent")
                setIsComposeOpen(false)
                resetForm()
                loadNotifications()
            } else {
                toast.error(res.error || "Failed")
            }
        })
    }

    const resetForm = () => {
        setSelectedUser(null)
        setTitle("")
        setMessage("")
    }

    const selectedMail = sentNotifications.find(n => n.id === selectedMailId)

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-background rounded-lg border shadow-sm mx-4 mb-4">
            {/* Left Sidebar (Nav) */}
            <div className="w-[250px] border-r bg-muted/10 flex flex-col p-3 gap-2 hidden md:flex">
                <Button
                    onClick={() => setIsComposeOpen(true)}
                    className="w-full justify-start gap-2 mb-2"
                    size="lg"
                >
                    <Plus className="w-4 h-4" /> New Message
                </Button>

                <div className="space-y-1">
                    <Button variant="secondary" className="w-full justify-start font-medium">
                        <Send className="w-4 h-4 mr-2" /> Sent
                        <span className="ml-auto text-xs text-muted-foreground">{sentNotifications.length}</span>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start font-normal text-muted-foreground">
                        <Archive className="w-4 h-4 mr-2" /> Archived
                    </Button>
                    <Button variant="ghost" className="w-full justify-start font-normal text-muted-foreground">
                        <Trash2 className="w-4 h-4 mr-2" /> Trash
                    </Button>
                </div>
            </div>

            {/* Middle: Mail List */}
            <div className="flex-1 md:max-w-[350px] border-r flex flex-col min-w-0">
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search messages..." className="pl-8" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {loading ? (
                        <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
                    ) : (
                        <div className="flex flex-col gap-1 p-2">
                            {sentNotifications.map((item) => (
                                <button
                                    key={item.id}
                                    className={cn(
                                        "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                                        selectedMailId === item.id && "bg-accent"
                                    )}
                                    onClick={() => setSelectedMailId(item.id)}
                                >
                                    <div className="flex w-full flex-col gap-1">
                                        <div className="flex items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="font-semibold">{item.user?.name || "Unknown"}</div>
                                                {!item.read && (
                                                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                                                )}
                                            </div>
                                            <div className={cn(
                                                "ml-auto text-xs",
                                                selectedMailId === item.id ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium">{item.title}</div>
                                    </div>
                                    <div className="line-clamp-2 text-xs text-muted-foreground w-full">
                                        {item.message.substring(0, 300)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={getBadgeVariant(item.type)} className="text-[10px] px-1 py-0 h-5">
                                            {item.type}
                                        </Badge>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Right: Reading Pane */}
            <div className="flex-1 flex flex-col min-w-0 bg-background/50">
                {selectedMail ? (
                    <div className="flex flex-col h-full">
                        {/* Toolbar */}
                        <div className="flex items-center p-2 border-b gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" disabled>
                                            <Archive className="h-4 w-4" />
                                            <span className="sr-only">Archive</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Archive</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" disabled>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Move to trash</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Move to trash</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <div className="ml-auto flex items-center gap-2">
                                <Separator orientation="vertical" className="mx-1 h-6" />
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={selectedMail.sender?.image} />
                                    <AvatarFallback>{selectedMail.sender?.name?.[0] || "A"}</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col overflow-y-auto">
                            <div className="p-8 border-b">
                                <div className="flex items-start justify-between">
                                    <div className="grid gap-1">
                                        <h1 className="font-semibold text-xl">{selectedMail.title}</h1>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium text-muted-foreground">To:</span>
                                            <span>{selectedMail.user?.name} &lt;{selectedMail.user?.email}&gt;</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {format(new Date(selectedMail.createdAt), "PPpp")}
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 text-sm leading-relaxed whitespace-pre-wrap">
                                {selectedMail.message}
                            </div>
                            {selectedMail.link && (
                                <div className="p-8 pt-0">
                                    <div className="p-4 rounded-md bg-muted/20 border flex items-center gap-3">
                                        <div className="bg-background p-2 rounded-md border shadow-sm">
                                            <Info className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium">Attached Link</p>
                                            <a href={selectedMail.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline break-all">
                                                {selectedMail.link}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer / Reply Area Placeholder */}
                        <div className="p-4 border-t bg-muted/5">
                            <form>
                                <div className="grid gap-4">
                                    <Textarea className="p-4 min-h-[100px]" placeholder={`Reply to ${selectedMail.user?.name}... (Simulated)`} disabled />
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="mute" className="flex items-center gap-2 text-xs font-normal">

                                        </Label>
                                        <Button size="sm" className="ml-auto" disabled>
                                            Send
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-muted-foreground m-auto">
                        <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
                        <h3 className="text-lg font-medium">No message selected</h3>
                        <p className="text-sm">Select a message from the list to view details.</p>
                    </div>
                )}
            </div>

            <UserSearchDialog
                open={isComposeOpen}
                onOpenChange={setIsComposeOpen}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                title={title}
                setTitle={setTitle}
                message={message}
                setMessage={setMessage}
                type={type}
                setType={setType}
                link={link}
                setLink={setLink}
                onSend={handleSend}
                isPending={isPending}
            />
        </div>
    )
}

function getBadgeVariant(type: string): any {
    switch (type) {
        case "WARNING": return "destructive"
        case "ERROR": return "destructive"
        case "SUCCESS": return "default" // or a custom success variant if strictly typed
        default: return "secondary"
    }
}

function UserSearchDialog({
    open, onOpenChange, selectedUser, setSelectedUser,
    title, setTitle, message, setMessage, type, setType, link, setLink,
    onSend, isPending
}: any) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)

    useEffect(() => {
        if (!open) {
            setQuery("")
            setResults([])
        }
    }, [open])

    const handleSearch = async (val: string) => {
        setQuery(val)
        if (val.length < 2) return

        setSearching(true)
        try {
            const res = await searchUsers(val)
            setResults(res)
            setSearching(false)
        } catch (e) { setSearching(false) }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Compose Notification</DialogTitle>
                    <DialogDescription>Send a system message to a user</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Recipient User</Label>
                        {!selectedUser ? (
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by email or name..."
                                    className="pl-9"
                                    value={query}
                                    onChange={e => handleSearch(e.target.value)}
                                />
                                {query.length > 1 && results.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-popover border rounded-md shadow-md mt-1 z-50 max-h-48 overflow-y-auto">
                                        {results.map(user => (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                                                onClick={() => {
                                                    setSelectedUser(user)
                                                    setQuery("")
                                                    setResults([])
                                                }}
                                            >
                                                <Avatar className="w-6 h-6">
                                                    <AvatarImage src={user.image} />
                                                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-sm">
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {query.length > 1 && results.length === 0 && !searching && (
                                    <div className="absolute top-full left-0 w-full bg-popover border rounded-md shadow-md mt-1 z-50 p-2 text-sm text-center text-muted-foreground">
                                        No users found
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-2 border rounded-md bg-muted/20">
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                        <AvatarImage src={selectedUser.image} />
                                        <AvatarFallback>{selectedUser.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">
                                        <p className="font-medium">{selectedUser.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>Remove</Button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3 space-y-2">
                            <Label>Subject</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notification Title" />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INFO">Info</SelectItem>
                                    <SelectItem value="WARNING">Warning</SelectItem>
                                    <SelectItem value="SUCCESS">Success</SelectItem>
                                    <SelectItem value="PROMO">Promo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Link (Optional)</Label>
                        <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={onSend} disabled={isPending || !selectedUser}>
                        {isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        Send Notification
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
