"use client"

import { SiteProvider } from "@/components/Contexts/site-id-context"
import LoadingOverlay from "@/components/loading-overlay"
import RouterRefresh from "@/components/RouterRefresh"
import React, { FC, useEffect, useState } from 'react'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { ProjectNavigation } from "@/components/nav/ProjectNavigation"

interface LayoutProps {
    children: React.ReactNode
}

const Layout: FC<LayoutProps> = ({ children }) => {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [inIframe, setInIframe] = useState(false)
    useEffect(() => {
        setInIframe(window.self !== window.top)
    }, [])
    // We need siteId for ProjectNavigation. We can get it from params since we are in [siteId]
    const params = useParams()
    const siteId = params.siteId as string

    const embedMode = searchParams.get("embed") === "1"
    const hideHeader =
        embedMode ||
        inIframe ||
        pathname.includes("projects/website/canva/") ||
        pathname.includes("projects/website/builder/") ||
        pathname.includes("projects/website/rss/builder") ||
        pathname.includes("projects/website/snippets/") ||
        pathname.includes("projects/website/craftjs-editor") ||
        pathname.includes("projects/website/rss/feed/") ||
        (pathname.includes("/articles/") && pathname.includes("/editor"))

    return (
        <SiteProvider>
            {!hideHeader && <ProjectNavigation siteId={siteId} />}

            <main className="bg-muted/5 flex flex-1 flex-col min-h-0">
                <RouterRefresh>
                    <LoadingOverlay />
                    {children}
                </RouterRefresh>
            </main>
        </SiteProvider>
    )
}

export default Layout
