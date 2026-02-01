"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

import { useTeam } from "@/hooks/useTeam"
import { useSession } from "next-auth/react"
import { OnlineMembers } from "@/components/dashboard/chat/OnlineMembers"

export function ProjectNavigation({ siteId }: { siteId: string }) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { team: site } = useTeam(siteId)
    const baseUrl = `/dashboard/${siteId}`

    // Default features if not loaded yet
    const features = site?.features || {
        articles: true,
        pages: true,
        categories: true,
        media: true,
        rss: true,
        analytics: true,
    }

    const isOwner = site?.userId === session?.user?.id
    const isCMS = (site?.settings as any)?.mode === 'cms'

    const navItems = [
        { name: "Overview", href: baseUrl, exact: true, show: true },
        { name: "Articles", href: `${baseUrl}/projects/website/articles`, show: features.articles },
        { name: "Pages", href: `${baseUrl}/projects/website/pages`, show: features.pages },
        { name: "Categories", href: `${baseUrl}/projects/website/categories`, show: features.categories },
        { name: "Media", href: `${baseUrl}/projects/website/media-gallery`, show: features.media },
        { name: "Collections", href: `${baseUrl}/collections`, show: true },
        { name: "RSS", href: `${baseUrl}/projects/website/rss/my-feed`, show: features.rss },
        { name: "Community", href: `${baseUrl}/community`, show: !isCMS },
        { name: "Analytics", href: `${baseUrl}/projects/website/analytics`, show: features.analytics },
        { name: "Logs", href: `${baseUrl}/logs`, show: isCMS },
        { name: "Settings", href: `${baseUrl}/projects/settings`, show: true },
    ].filter(item => item.show)

    return (
        <div className="border-b bg-background sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between gap-6">
                <div className="flex items-center gap-6 overflow-x-auto text-sm font-medium text-muted-foreground no-scrollbar h-full">
                    {navItems.map((item) => {
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href)

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative h-full flex items-center px-1 transition-colors",
                                    isActive ? "text-foreground" : "hover:text-foreground"
                                )}
                            >
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-tab"
                                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 30
                                        }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {session?.user && (
                    <OnlineMembers
                        siteId={siteId}
                        currentUserId={session.user.id}
                        showLabel={true}
                        showSeparator={true}
                    />
                )}
            </div>
        </div>
    )
}
