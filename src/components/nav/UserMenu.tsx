import {
    CreditCard,
    LogOut,
    Settings,
    User,
    Moon,
    Sun,
    Monitor,
    VenetianMask
} from "lucide-react"

import { useState } from "react"
import { AccountSettingsDialog } from "@/components/AccountSettings/AccountSettingsDialog"
import { stopImpersonating } from "@/lib/actions/admin-actions"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function UserMenu() {
    const { setTheme } = useTheme()
    const { data: session } = useSession()
    const router = useRouter()
    const user = session?.user

    const [showSettings, setShowSettings] = useState(false)

    return (
        <>
            <AccountSettingsDialog open={showSettings} onOpenChange={setShowSettings} />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer">
                        <Avatar className="h-8 w-8 border">
                            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                            <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user?.email || "user@example.com"}
                            </p>
                            {/* @ts-ignore */}
                            {user?.isImpersonating && (
                                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mt-1">
                                    Impersonating
                                </p>
                            )}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {/* @ts-ignore */}
                        {user?.isImpersonating && (
                            <DropdownMenuItem
                                onClick={() => stopImpersonating()}
                                className="text-orange-500 focus:text-orange-500 font-medium"
                            >
                                <VenetianMask className="mr-2 h-4 w-4" />
                                <span>Stop Impersonating</span>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => router.push("/profile")}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/billing")}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Billing</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowSettings(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Monitor className="mr-2 h-4 w-4" />
                                <span>Theme</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setTheme("light")}>
                                        <Sun className="mr-2 h-4 w-4" />
                                        <span>Light</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                                        <Moon className="mr-2 h-4 w-4" />
                                        <span>Dark</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("system")}>
                                        <Monitor className="mr-2 h-4 w-4" />
                                        <span>System</span>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
