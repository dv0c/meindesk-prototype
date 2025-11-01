
import { ArticleTable } from "@/components/ArticlesTable";
import { CreateArticleButton } from "@/components/CreateArticleButton";
import PageWrapper from "@/components/PageWrapper";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { X } from "lucide-react";

export default async function Page({params}: {params: {siteId: string}}) {
    // if (site?.features?.articles === false) return <EmptyCard />
    if (!params.siteId) {
        return <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-muted-foreground">Site not found.</p>
        </div>
    }
    return <PageWrapper title="Articles" action={<CreateArticleButton siteId={params.siteId} />} >
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