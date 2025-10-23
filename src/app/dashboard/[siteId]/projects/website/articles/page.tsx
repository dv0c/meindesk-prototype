import { AnalyticsCards } from "@/components/AnalyticsCards";
import { AnalyticsCharts } from "@/components/AnalyticsChart";
import { getSite } from "@/lib/actions/helpers/site";

import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { X } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { CreateArticleButton } from "@/components/CreateArticleButton";
import { ArticleTable } from "@/components/ArticlesTable";

export default async function Page() {
    const site = await getSite()
    // if (site?.features?.articles === false) return <EmptyCard />
    if (!site) {
        return <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-muted-foreground">Site not found.</p>
        </div>
    }
    return <PageWrapper title="Articles" action={<CreateArticleButton siteId={site.id} />} >
        <ArticleTable />
    </PageWrapper>
}



export function EmptyCard() {
    return (
        <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <X />
                </EmptyMedia>
                <EmptyTitle>Articles are disabled!</EmptyTitle>
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