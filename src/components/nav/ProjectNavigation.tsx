"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function ProjectNavigation({ siteId }: { siteId: string }) {
    const pathname = usePathname()
    const baseUrl = `/dashboard/${siteId}`

    const navItems = [
        { name: "Overview", href: baseUrl, exact: true },
        { name: "Articles", href: `${baseUrl}/projects/website/articles` },
        { name: "Pages", href: `${baseUrl}/projects/website/pages` },
        { name: "Categories", href: `${baseUrl}/projects/website/categories` },
        { name: "Media", href: `${baseUrl}/projects/website/media-gallery` },
        { name: "Collections", href: `${baseUrl}/collections` },
        { name: "RSS", href: `${baseUrl}/projects/website/rss/my-feed` },
        { name: "Community", href: `${baseUrl}/community` },
        { name: "Features", href: `${baseUrl}/projects/website/features` },
        { name: "Analytics", href: `${baseUrl}/projects/website/analytics` },
        { name: "Settings", href: `${baseUrl}/projects/settings` },
    ]

    return (
        <div className="border-b bg-background sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-6 h-12 flex items-center gap-6 overflow-x-auto text-sm font-medium text-muted-foreground no-scrollbar">
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
        </div>
    )
}
