"use client"

import * as React from "react"
import { Send, Loader2, Paperclip, X, File as FileIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getMessages, sendMessage } from "@/lib/actions/chat-actions"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Message {
    id: string
    content: string
    createdAt: Date
    user: {
        id: string
        name: string
        image: string | null
    }
    attachments?: Array<{ type: "image" | "file", url: string, name?: string }>
}

interface ChatInterfaceProps {
    siteId: string
    currentUserId: string
    channelId?: string
    channelName?: string
}

export function ChatInterface({ siteId, currentUserId, channelId, channelName }: ChatInterfaceProps) {
    const [messages, setMessages] = React.useState<Message[]>([])
    const [newMessage, setNewMessage] = React.useState("")
    const [sending, setSending] = React.useState(false)
    const [attachments, setAttachments] = React.useState<Array<{ file: File, preview: string, type: "image" | "file" }>>([])
    const [uploading, setUploading] = React.useState(false)

    const scrollRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Polling for messages (every 3 seconds)
    React.useEffect(() => {
        if (sending) return

        const fetchMessages = async () => {
            const msgs = await getMessages(siteId, channelId)
            setMessages(msgs as any)
        }

        fetchMessages()
        const interval = setInterval(fetchMessages, 3000)
        return () => clearInterval(interval)
    }, [siteId, channelId, sending])

    // Auto-scroll to bottom only on new messages
    const prevMsgLen = React.useRef(0)

    React.useEffect(() => {
        if (messages.length > prevMsgLen.current) {
            scrollRef.current?.scrollIntoView({ behavior: "smooth" })
        }
        prevMsgLen.current = messages.length
    }, [messages])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const type = file.type.startsWith("image/") ? "image" : "file"
            // Simple preview for images
            const preview = type === "image" ? URL.createObjectURL(file) : ""
            setAttachments(prev => [...prev, { file, preview, type }])
        }
    }

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    const uploadFile = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch(`/api/team/${siteId}/upload`, {
            method: "POST",
            body: formData
        })

        if (!res.ok) throw new Error("Upload failed")
        const data = await res.json()
        return data.secure_url // Cloudinary URL
    }

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if ((!newMessage.trim() && attachments.length === 0) || sending || uploading) return

        setSending(true)

        let uploadedAttachments: any[] = []

        try {
            // 1. Upload files first if any
            if (attachments.length > 0) {
                setUploading(true)
                const uploadPromises = attachments.map(async (att) => {
                    const url = await uploadFile(att.file)
                    return { type: att.type, url, name: att.file.name }
                })
                uploadedAttachments = await Promise.all(uploadPromises)
                setUploading(false)
            }

            const content = newMessage
            setNewMessage("")
            setAttachments([])

            // Optimistic UI Update (Simplified - complex with attachments)
            const optimisticMsg: Message = {
                id: `temp-${Date.now()}`,
                content: content,
                createdAt: new Date(),
                user: {
                    id: currentUserId,
                    name: "You",
                    image: null
                },
                attachments: uploadedAttachments
            }

            setMessages(prev => [...prev, optimisticMsg])
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 10)

            const result = await sendMessage(siteId, content, channelId, undefined, uploadedAttachments)

            if (result.error) {
                toast.error(result.error)
                setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
                setNewMessage(content) // Restore text
            } else if (result.message) {
                // Replace optimistic message with real one
                setMessages(prev => prev.map(m =>
                    m.id === optimisticMsg.id ? result.message as any : m
                ))
            }
        } catch (error) {
            console.error("Failed to send", error)
            toast.error("Failed to send message")
            setUploading(false)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="px-4 py-3 border-b flex items-center justify-between bg-card/50 backdrop-blur-sm">
                <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <span className="text-muted-foreground text-lg leading-none">#</span>
                        {channelName || "General"}
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Channel</p>
                </div>
            </div>

            <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-6 flex flex-col pb-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center space-y-3 py-20 opacity-50">
                            <div className="bg-muted rounded-full p-4">
                                <span className="text-xl">💬</span>
                            </div>
                            <p className="text-sm font-medium">Welcome to #{channelName || "chat"}!</p>
                            <p className="text-xs">This is the start of the conversation.</p>
                        </div>
                    )}

                    {messages.map((msg, index) => {
                        const isMe = msg.user.id === currentUserId
                        const isSequential = index > 0 && messages[index - 1].user.id === msg.user.id
                        const showAvatar = !isMe && !isSequential
                        const isOptimistic = msg.id.startsWith("temp-")

                        return (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex w-full mt-2 space-x-3 max-w-3xl group",
                                    isMe ? "ml-auto justify-end" : ""
                                )}
                            >
                                {!isMe && (
                                    <div className="flex-shrink-0 w-8">
                                        {showAvatar ? (
                                            <Avatar className="h-8 w-8 hover:ring-2 ring-background transition-all">
                                                <AvatarImage src={msg.user.image || ""} />
                                                <AvatarFallback>{msg.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                        ) : <div className="w-8" />}
                                    </div>
                                )}

                                <div className={cn(
                                    "flex flex-col",
                                    isMe ? "items-end" : "items-start"
                                )}>
                                    {!isMe && !isSequential && (
                                        <div className="flex items-baseline gap-2 mb-1 ml-1">
                                            <span className="text-xs font-semibold text-foreground">{msg.user.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{format(new Date(msg.createdAt), "h:mm a")}</span>
                                        </div>
                                    )}

                                    <div className={cn(
                                        "relative px-4 py-2 text-sm shadow-sm max-w-full md:max-w-lg break-words",
                                        isMe
                                            ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                                            : "bg-muted/50 border text-foreground rounded-2xl rounded-tl-sm",
                                        isOptimistic && "opacity-70"
                                    )}>
                                        {msg.content}
                                        {/* Attachments Display */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                {msg.attachments.map((att, i) => (
                                                    <div key={i} className="rounded-lg overflow-hidden border bg-background/50">
                                                        {att.type === "image" ? (
                                                            <div className="relative aspect-video w-full min-w-[200px]">
                                                                <img src={att.url} alt="attachment" className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 gap-2 hover:underline text-xs">
                                                                <FileIcon className="h-4 w-4" />
                                                                {att.name || "Attachment"}
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {isMe && (
                                        <span className="text-[10px] text-muted-foreground mt-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {format(new Date(msg.createdAt), "h:mm a")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Attachments Preview Area */}
            {attachments.length > 0 && (
                <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t bg-muted/20">
                    {attachments.map((att, i) => (
                        <div key={i} className="relative group flex-shrink-0">
                            <div className="h-16 w-16 rounded-lg border bg-background flex items-center justify-center overflow-hidden">
                                {att.type === "image" ? (
                                    <img src={att.preview} className="h-full w-full object-cover" />
                                ) : (
                                    <FileIcon className="h-6 w-6 text-muted-foreground" />
                                )}
                            </div>
                            <button
                                onClick={() => removeAttachment(i)}
                                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="p-4 bg-muted/10 border-t">
                <form onSubmit={handleSend} className="flex gap-2 relative items-end">
                    <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 rounded-xl shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    <Input
                        placeholder={`Message #${channelName || "channel"}...`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-background border-input focus-visible:ring-1 focus-visible:ring-offset-0 min-h-[44px] py-3 rounded-xl resize-none shadow-sm"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={(!newMessage.trim() && attachments.length === 0) || sending || uploading}
                        className={cn("h-11 w-11 rounded-xl shrink-0 transition-all", (newMessage.trim() || attachments.length > 0) ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-muted text-muted-foreground")}
                    >
                        {sending || uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </form>
            </div>
        </div>
    )
}
