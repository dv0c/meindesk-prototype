"use client"

import {
    Home,
    LogOut,
    Monitor,
    Moon,
    PlusCircle,
    Sun,
    Settings,
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AccountSettingsDialog } from "@/components/AccountSettings/AccountSettingsDialog"

export function UserMenu() {
    const { setTheme, theme } = useTheme()
    const { data: session } = useSession()
    const router = useRouter()
    const user = session?.user
    const [showSettings, setShowSettings] = useState(false)

    return (
        <>
            <AccountSettingsDialog open={showSettings} onOpenChange={setShowSettings} />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer border border-border/50 hover:border-foreground/50 transition-colors">
                        <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                        <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-0" align="end">
                    <div className="p-4 pb-2">
                        <p className="font-medium leading-none mb-1">{user?.username}</p>
                        <p className="text-sm text-muted-foreground leading-none">{user?.email}</p>
                    </div>

                    <DropdownMenuSeparator />

                    <div className="p-2">
                        <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer">
                            Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowSettings(true)} className="cursor-pointer">
                            Account Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/dashboard/create-team")} className="cursor-pointer justify-between">
                            Create Team
                            <PlusCircle className="h-4 w-4 ml-2" />
                        </DropdownMenuItem>
                    </div>

                    <DropdownMenuSeparator />

                    <div className="p-2">
                        <DropdownMenuItem className="cursor-pointer justify-between">
                            Command Menu
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </DropdownMenuItem>
                        <div className="flex items-center justify-between px-2 py-1.5 text-sm">
                            <span>Theme</span>
                            <div className="flex items-center border rounded-full p-0.5 bg-muted/50">
                                <button
                                    onClick={() => setTheme("system")}
                                    className={`p-1.5 rounded-full hover:bg-background transition-colors ${theme === "system" ? "bg-background shadow-sm" : ""}`}
                                >
                                    <Monitor className="h-3 w-3" />
                                </button>
                                <button
                                    onClick={() => setTheme("light")}
                                    className={`p-1.5 rounded-full hover:bg-background transition-colors ${theme === "light" ? "bg-background shadow-sm" : ""}`}
                                >
                                    <Sun className="h-3 w-3" />
                                </button>
                                <button
                                    onClick={() => setTheme("dark")}
                                    className={`p-1.5 rounded-full hover:bg-background transition-colors ${theme === "dark" ? "bg-background shadow-sm" : ""}`}
                                >
                                    <Moon className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <DropdownMenuSeparator />

                    <div className="p-2">
                        <DropdownMenuItem onClick={() => router.push("/")} className="cursor-pointer justify-between">
                            Home Page
                            <Home className="h-4 w-4 ml-2" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="cursor-pointer justify-between">
                            Log Out
                            <LogOut className="h-4 w-4 ml-2" />
                        </DropdownMenuItem>
                    </div>

                    <div className="p-2 border-t bg-muted/30">
                        <Button className="w-full bg-foreground text-background hover:bg-foreground/90 h-8 text-sm" variant="default" onClick={() => router.push("/upgrade")}>
                            Upgrade to Pro
                        </Button>
                    </div>

                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
