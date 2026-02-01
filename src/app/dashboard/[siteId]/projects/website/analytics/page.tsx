import { AnalyticsContainer } from "@/components/AnalyticsContainer";

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { getActiveTeam } from "@/lib/actions/helpers/team";
import { X } from "lucide-react";

export const metadata = {
    title: "Analytics | PROTOTYPE — Blog Builder & Drag-Drop CMS",
}

export default async function Page({ params }: { params: { siteId: string } }) {
    const { siteId } = await params
    const site = await getActiveTeam(siteId, "analytics")

    if (!site) {
        return <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-muted-foreground">Site not found.</p>
        </div>
    }

    // Pass featureEnabled state (Check settings for CMS mode connection status)
    const settings = (site.settings as any) || {}
    const analyticsConnected = settings.analyticsConnected ?? true

    return <AnalyticsContainer siteId={site.id} analyticsConnected={analyticsConnected} />
}



export function EmptyCard() {
    return (
        <Empty className="from-muted/50 to-background h-full bg-linear-to-b from-30%">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <X />
                </EmptyMedia>
                <EmptyTitle>Analytics are disabled!</EmptyTitle>
                <EmptyDescription>
                    You&apos;re not allowed to access this page.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                Contact with Meindesk.gr to unlock it.
            </EmptyContent>
        </Empty>
    )
}