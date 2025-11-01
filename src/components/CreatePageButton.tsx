'use client'

import { CreatePage } from "@/lib/actions/helpers/create-page"
import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

export function CreatePageButton({ siteId }: { siteId: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    try {
                        const res: any = await CreatePage({ siteId })
                        router.push(res.url)
                    } catch (error: any) {
                        toast.error(error.message || "Failed to create page")
                    }
                })
            }}
        >
            {isPending ? "Creating..." : "Create Page"}
        </Button>
    )
}
