
import { ArticleTable } from "@/components/ArticlesTable";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { X } from "lucide-react";

export const metadata = {
    title: "Articles | PROTOTYPE — Blog Builder & Drag-Drop CMS",
}

export default async function Page({ params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = await params;
    if (!siteId) {
        return <div className="flex flex-1 items-center justify-center p-4">
            <p className="text-muted-foreground">Site not found.</p>
        </div>
    }
    return <ArticleTable siteId={siteId} />
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