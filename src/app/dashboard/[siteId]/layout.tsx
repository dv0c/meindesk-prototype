
import { ThemeTogglerButton } from "@/components/animate-ui/components/buttons/theme-toggler"
import { AppSidebar, ToggleSidebar } from "@/components/app-sidebar"
import { SiteProvider } from "@/components/Contexts/site-id-context"
import LoadingOverlay from "@/components/loading-overlay"
import RouterRefresh from "@/components/RouterRefresh"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider
} from "@/components/ui/sidebar"
import React, { FC } from 'react'

interface layoutProps {
    children: React.ReactNode
}

const layout: FC<layoutProps> = ({ children }) => {
    // const site = await getSite()
    // if (!site) redirect('/setup')
    return <SiteProvider>
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="rounded-2xl relative h-full shadow m-2 border">
                    <header className="flex dark:bg-neutral-900 mb-5 rounded-t-2xl h-16 shrink-0 items-center gap-2">
                        <div className="flex items-center gap-2 px-4">
                            {/* <SidebarTrigger className="-ml-1" /> */}
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
}

export default layout