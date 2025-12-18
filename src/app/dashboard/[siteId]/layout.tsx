"use client"

import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler"
import { AppSidebar, ToggleSidebar } from "@/components/app-sidebar"
import { SiteProvider } from "@/components/Contexts/site-id-context"
import LoadingOverlay from "@/components/loading-overlay"
import RouterRefresh from "@/components/RouterRefresh"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import React, { FC } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"

interface LayoutProps {
    children: React.ReactNode
}

const Layout: FC<LayoutProps> = ({ children }) => {
    const pathname = usePathname()
    const hideHeader = pathname.includes("projects/website/canva/") || pathname.includes("projects/website/snippets/") || pathname.includes("/articles/") && pathname.includes("/editor")

    return (
        <SiteProvider>
            <SidebarProvider>
                {!hideHeader && <AppSidebar />}
                <SidebarInset>
                    <div className={cn(hideHeader ? "" : "rounded-2xl relative h-full shadow m-2 border")}>
                        {!hideHeader && (
                            <header className="flex dark:bg-neutral-900 mb-5 rounded-t-2xl h-16 shrink-0 items-center gap-2">
                                <div className="flex items-center gap-2 px-4">
                                    <ToggleSidebar />
                                    <Separator
                                        orientation="vertical"
                                        className="mr-2 data-[orientation=vertical]:h-4"
                                    />
                                    <Breadcrumb>
                                        <BreadcrumbList className="w-full">
                                            <BreadcrumbItem className="hidden md:block">
                                                <BreadcrumbLink href="#">
                                                    Your Project
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator className="hidden md:block" />
                                            <BreadcrumbItem>
                                                <BreadcrumbPage>Website</BreadcrumbPage>
                                            </BreadcrumbItem>
                                            <BreadcrumbItem className="flex-1">
                                                <ThemeTogglerButton />
                                            </BreadcrumbItem>
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                </div>
                            </header>
                        )}
                        <div className="">
                            <RouterRefresh>
                                <LoadingOverlay />
                                {children}
                            </RouterRefresh>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </SiteProvider>
    )
}

export default Layout
