"use client"

import ArticleEditor from "@/components/builder/cms/ArticleEditor"
import { useRouter } from "next/navigation"
import { use } from "react"

export default function EditorPage({
    params,
}: {
    params: Promise<{ id: string; siteId: string }>
}) {
    const { id: articleId, siteId } = use(params)
    const router = useRouter()

    return (
        <div className="flex flex-col flex-1 min-h-0 h-full">
            <ArticleEditor
                variant="page"
                articleId={articleId}
                siteId={siteId}
                onClose={() => router.push(`/dashboard/${siteId}/projects/website/articles`)}
                onUpdate={() => router.refresh()}
            />
        </div>
    )
}
