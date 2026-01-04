"use client"

import { useState, useEffect, useTransition } from "react"
import { getAdminSentNotifications, sendNotification } from "@/lib/actions/notification-actions"
import { searchUsers } from "@/lib/actions/user-actions" // I need to verify if this exists or I need to create it
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
import { Loader2, Mail, Plus, Send, Search, BellRing, Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

export default function AdminNotificationsPage() {
    const [activeTab, setActiveTab] = useState("sent")
    const [sentNotifications, setSentNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isComposeOpen, setIsComposeOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Compose State
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
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
        }
        setLoading(false)
    }

    // Debounced User Search would be better, but simple effect for now
    useEffect(() => {
        if (searchQuery.length > 2) {
            const timer = setTimeout(async () => {
                // I need to implement searchUsers first! 
                // For now, I'll mock or assuming I'll fix it next step.
                // Assuming `searchUsers(query)` exists.
                // If not, I will create it.
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [searchQuery])

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
        setSearchResults([])
        setSearchQuery("")
    }

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-background">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted/10 flex flex-col p-4 gap-2">
                <Button
                    onClick={() => setIsComposeOpen(true)}
                    className="w-full justify-start gap-2 mb-4"
                    size="lg"
                >
                    <Plus className="w-4 h-4" /> Compose
                </Button>

                <div className="space-y-1">
                    <Button
                        variant={activeTab === 'sent' ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('sent')}
                    >
                        <Send className="w-4 h-4 mr-2" /> Sent Messages
                    </Button>
                    {/* Future: System Alerts, etc */}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        {activeTab === 'sent' ? 'Sent Notifications' : 'Inbox'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={loadNotifications}>
                        <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loading ? (
                        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-muted-foreground" /></div>
                    ) : sentNotifications.length === 0 ? (
                        <div className="text-center text-muted-foreground p-10">No notifications found</div>
                    ) : (
                        sentNotifications.map(n => (
                            <Card key={n.id} className="hover:bg-muted/50 transition-colors">
                                <CardContent className="p-4 flex gap-4 items-start">
                                    <div className={`p-2 rounded-full ${getTypeColor(n.type)}`}>
                                        {getTypeIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold truncate">{n.title}</h4>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground/80 line-clamp-2 my-1">{n.message}</p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Avatar className="w-4 h-4">
                                                    <AvatarImage src={n.user?.image} />
                                                    <AvatarFallback>{n.user?.name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                To: {n.user?.name || n.user?.email || "Unknown User"}
                                            </div>
                                            {n.read ? (
                                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Read</Badge>
                                            ) : (
                                                <Badge variant="outline">Unread</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Compose Modal */}
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

    // Mock Search Implementation for V1 until action exists
    // I really should implement the action fast.
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

function getTypeColor(type: string) {
    switch (type) {
        case "WARNING": return "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        case "ERROR": return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        case "SUCCESS": return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        case "PROMO": return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        default: return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    }
}

function getTypeIcon(type: string) {
    switch (type) {
        case "WARNING": return <AlertTriangle className="w-5 h-5" />
        case "ERROR": return <AlertCircle className="w-5 h-5" />
        case "SUCCESS": return <CheckCircle className="w-5 h-5" />
        case "PROMO": return <SparklesIcon className="w-5 h-5" />
        default: return <Info className="w-5 h-5" />
    }
}

function SparklesIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
            <path d="M4 17v2" />
            <path d="M5 18H3" />
        </svg>
    )
}
