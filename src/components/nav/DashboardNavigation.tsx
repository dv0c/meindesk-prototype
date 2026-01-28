"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function DashboardNavigation() {
    const pathname = usePathname()

    // Helper to check active state
    // For root dashboard, exact match usually
    const isActive = (path: string) => pathname === path

    return (
        <div className="border-b bg-background">
            <div className="max-w-7xl mx-auto px-6 h-12 flex items-center gap-6 overflow-x-auto text-sm font-medium text-muted-foreground">
                <Link href="/dashboard" className={cn("h-full flex items-center border-b-2 px-1 transition-colors", isActive("/dashboard") ? "border-foreground text-foreground" : "border-transparent hover:text-foreground")}>
                    Overview
                </Link>
                <Link href="/dashboard/teams" className={cn("h-full flex items-center border-b-2 px-1 transition-colors", isActive("/dashboard/teams") ? "border-foreground text-foreground" : "border-transparent hover:text-foreground")}>
                    Teams
                </Link>
                <Link href="#" className="h-full flex items-center border-b-2 border-transparent px-1 transition-colors hover:text-foreground">
                    Activity
                </Link>
                <Link href="/community" className="h-full flex items-center border-b-2 border-transparent px-1 transition-colors hover:text-foreground">
                    Community
                </Link>
                <Link href="#" className="h-full flex items-center border-b-2 border-transparent px-1 transition-colors hover:text-foreground">
                    Domains
                </Link>
                <Link href="#" className="h-full flex items-center border-b-2 border-transparent px-1 transition-colors hover:text-foreground">
                    Usage
                </Link>
                {/* <Link href="#" className="h-full flex items-center border-b-2 border-transparent px-1 transition-colors hover:text-foreground">
                    Settings
                </Link> */}
            </div>
        </div>
    )
}
