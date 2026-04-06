"use client"

import { usePathname } from "next/navigation"
import { DashboardFooter } from "@/components/nav/DashboardFooter"

export function ConditionalDashboardFooter() {
    const pathname = usePathname()
    const isArticleEditor =
        pathname?.includes("/projects/website/articles/") && pathname?.includes("/editor")
    if (isArticleEditor) return null
    return <DashboardFooter />
}
