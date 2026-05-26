"use client"

import { Separator } from "@/components/ui/separator"
import { SettingsSidebar } from "@/components/Settings/SettingsSidebar"

const getSidebarNavItems = (siteId: string, mode: string) => {
    const items = [
        {
            title: "General",
            href: `/dashboard/${siteId}/projects/settings`,
            show: true,
        },
        {
            title: "Domains",
            href: `/dashboard/${siteId}/projects/settings/domains`,
            show: mode !== 'cms',
        },
        {
            title: "Connections", // API / Developers
            href: `/dashboard/${siteId}/projects/settings/api`,
            show: mode === 'cms',
        },
        {
            title: "Features",
            href: `/dashboard/${siteId}/projects/settings/features`,
            show: true,
        },
        {
            title: "Webhooks",
            href: `/dashboard/${siteId}/projects/settings/webhooks`,
            show: mode === 'cms',
        },
        {
            title: "Team",
            href: `/dashboard/${siteId}/projects/settings/team`,
            show: true,
        },
    ]

    return items.filter(item => item.show)
}

interface SettingsLayoutProps {
    children: React.ReactNode
    siteId: string
    mode?: string
}

export function SettingsLayout({ children, siteId, mode = 'builder' }: SettingsLayoutProps) {
    const sidebarNavItems = getSidebarNavItems(siteId, mode)

    return (
        <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-10">
            <div className="mb-8 space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Project Settings</h1>
                <p className="text-muted-foreground">
                    Manage your project settings and preferences.
                </p>
            </div>

            <Separator className="my-8" />

            <div className="flex flex-col lg:flex-row gap-12">
                <aside className="lg:w-64 flex-shrink-0">
                    <SettingsSidebar items={sidebarNavItems} />
                </aside>
                <div className="flex-1 max-w-3xl space-y-8">{children}</div>
            </div>
        </div>
    )
}
