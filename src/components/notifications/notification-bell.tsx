"use client"

import { useState, useEffect } from "react"
import { getUserNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "@/lib/actions/notification-actions"
import { toast } from "sonner"
import { Bell, Check, MoreVertical, Settings, Trash2 } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const fetchNotifications = async () => {
        setLoading(true)
        const res = await getUserNotifications()
        if (res.notifications) {
            setNotifications(res.notifications)
            setUnreadCount(res.notifications.filter((n: any) => !n.read).length)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen])

    const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation()
        await markNotificationRead(id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead()
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation()
        setNotifications(prev => prev.filter(n => n.id !== id))
        const res = await deleteNotification(id)
        if (!res.success) {
            toast.error("Failed to delete notification")
            fetchNotifications()
        }
    }

    const handleSettings = () => {
        toast.info("Notification settings coming soon")
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 shadow-xl rounded-xl border-border/50 overflow-hidden" align="end">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10 border-b">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">Notifications</h4>
                        {unreadCount > 0 && (
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleSettings}>
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="h-[450px] bg-background">
                    {loading && notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-10 text-center space-y-2">
                            <Bell className="w-10 h-10 text-muted-foreground/30" />
                            <p className="text-muted-foreground">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex gap-3 p-4 border-b border-border/40 hover:bg-background/80 transition-all cursor-pointer group bg-background relative",
                                        !notification.read && "bg-blue-50/50 dark:bg-blue-900/10"
                                    )}
                                    onClick={() => !notification.read && handleMarkRead(notification.id)}
                                >
                                    {/* Unread Indicator */}
                                    {!notification.read && (
                                        <div className="absolute left-2 top-6 h-2 w-2 rounded-full bg-blue-500" />
                                    )}

                                    {/* Avatar */}
                                    <div className="pl-2">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={notification.sender?.image} />
                                            <AvatarFallback>{notification.sender?.name?.[0] || "S"}</AvatarFallback>
                                        </Avatar>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="text-sm leading-snug">
                                            <span className="font-semibold text-foreground">
                                                {notification.sender?.name || "System"}
                                            </span>
                                            {" "}
                                            <span className="text-foreground/80">
                                                {notification.sender ? "" : notification.title + " - "}
                                                {notification.message}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{notification.site ? "Project" : "System"}</span>
                                            <span>•</span>
                                            <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-1">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => handleMarkRead(notification.id, e)}>
                                                    <Check className="w-4 h-4 mr-2" /> Mark as read
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={(e) => handleDelete(notification.id, e)}>
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                {unreadCount > 0 && (
                    <div className="p-2 border-t bg-background/95 backdrop-blur-sm text-center">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-primary" onClick={handleMarkAllRead}>
                            Mark all as read
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}
