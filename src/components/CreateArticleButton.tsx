'use client'

import { CreateArticle } from "@/lib/actions/helpers/create-article"
import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

export function CreateArticleButton({ siteId }: { siteId: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    try {
                        await CreateArticle({ siteId }).then((res: any) => {
                            
                            router.push(res.url)
                        })
                    } catch (error: any) {
                        toast.error(error.message || "Failed to create article")
                    }
                })
            }}
        >
            {isPending ? "Creating..." : "Create Article"}
        </Button>
    )
}
