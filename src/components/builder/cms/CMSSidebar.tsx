"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FileText, FolderOpen, ImageIcon, LayoutTemplate, X } from "lucide-react"

export type CMSView = "articles" | "categories" | "collections" | "media"

interface CMSSidebarProps {
    activeView: CMSView
    setActiveView: (view: CMSView) => void
    onClose: () => void
}

export function CMSSidebar({ activeView, setActiveView, onClose }: CMSSidebarProps) {
    const navItems = [
        {
            id: "articles" as const,
            label: "Articles",
            icon: FileText
        },
        {
            id: "categories" as const,
            label: "Categories",
            icon: FolderOpen
        },
        {
            id: "collections" as const,
            label: "Collections",
            icon: LayoutTemplate
        },
        {
            id: "media" as const,
            label: "Media Gallery",
            icon: ImageIcon
        }
    ]

    return (
        <div className="w-64 border-r bg-muted/10 h-full flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 border-b shrink-0">
                <span className="font-semibold text-sm">CMS Manager</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <Button
                        key={item.id}
                        variant={activeView === item.id ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start",
                            activeView === item.id && "bg-muted font-medium"
                        )}
                        onClick={() => setActiveView(item.id)}
                    >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                    </Button>
                ))}
            </div>
        </div>
    )
}
