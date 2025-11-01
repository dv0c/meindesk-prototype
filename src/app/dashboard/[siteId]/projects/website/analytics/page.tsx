import { AnalyticsCards } from "@/components/AnalyticsCards";
import { AnalyticsCharts } from "@/components/AnalyticsChart";

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

export default async function Page({ params }: { params: { siteId: string } }) {
    const site = await getActiveTeam(params.siteId, "analytics")
    if (site?.features?.analytics === false) return <EmptyCard />
    if (!site) {
        return <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-muted-foreground">Site not found.</p>
        </div>
    }
    return <div className="flex flex-1 flex-col gap-4 p-5">
        <AnalyticsCards siteId={site.id} />
        <AnalyticsCharts siteId={site.id} />
    </div>
}



export function EmptyCard() {
    return (
        <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
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