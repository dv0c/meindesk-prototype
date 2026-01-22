"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerDescription,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { BadgeCheck, User, Shield, Bell, CreditCard, PaintBucket, Laptop } from "lucide-react"
import { cn } from "@/lib/utils"
import { AppearanceTab } from "./AppearanceTab"
import { ProfileTab } from "./ProfileTab"
import { AccountTab } from "./AccountTab"
import { NotificationsTab } from "./NotificationsTab"
import { DeveloperTab } from "./DeveloperTab"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"

interface AccountSettingsDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
}

export function AccountSettingsDialog({ children, open, onOpenChange }: AccountSettingsDialogProps) {
    const [activeTab, setActiveTab] = useState("profile")
    const { data: session } = useSession()
    const isMobile = useIsMobile()
    const user = session?.user

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "account", label: "Account", icon: BadgeCheck },
        { id: "appearance", label: "Appearance", icon: PaintBucket },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "developer", label: "Developer", icon: Laptop },
    ]

    const ActiveTabContent = () => {
        switch (activeTab) {
            case "profile": return <ProfileTab />
            case "account": return <AccountTab />
            case "appearance": return <AppearanceTab />
            case "notifications": return <NotificationsTab />
            case "developer": return <DeveloperTab />
            default: return null
        }
    }

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerTrigger asChild>{children}</DrawerTrigger>
                <DrawerContent className="max-h-[90vh]">
                    <div className="mx-auto w-full max-w-lg flex flex-col h-full max-h-[90vh]">
                        <DrawerHeader className="text-left">
                            <DrawerTitle>Account Settings</DrawerTitle>
                            <DrawerDescription>
                                Manage your account settings and preferences.
                            </DrawerDescription>
                        </DrawerHeader>

                        {/* Mobile Tabs - Horizontal Scroll */}
                        <div className="px-4 pb-2 border-b overflow-x-auto flex gap-2 no-scrollbar">
                            {tabs.map((tab) => (
                                <Button
                                    key={tab.id}
                                    variant={activeTab === tab.id ? "default" : "outline"}
                                    size="sm"
                                    className="rounded-full flex-shrink-0"
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <tab.icon className="mr-2 h-3.5 w-3.5" />
                                    {tab.label}
                                </Button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <ActiveTabContent />
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-4xl! p-0 overflow-hidden gap-0 h-[600px] flex">
                {/* Sidebar */}
                <div className="w-64 bg-muted/30 border-r py-6 px-4 flex flex-col gap-6 shrink-0">
                    <div className="flex items-center gap-3 px-2">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.image || ""} />
                            <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden min-w-0">
                            <p className="font-medium truncate text-sm">{user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium text-muted-foreground px-2 mb-2 uppercase tracking-wider">Settings</p>
                        {tabs.map((tab) => (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? "secondary" : "ghost"}
                                className={cn(
                                    "justify-start gap-3 h-9 font-normal",
                                    activeTab === tab.id && "bg-muted font-medium"
                                )}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0 bg-background">
                    <DialogHeader className="px-8 py-6 border-b shrink-0">
                        <DialogTitle className="text-xl">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-8">
                        <ActiveTabContent />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
