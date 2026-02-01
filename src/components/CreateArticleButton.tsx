"use client"

import { CreateArticle } from "@/lib/actions/helpers/create-article"
import { useTransition } from "react"
import { toast } from "sonner"
import { Button, ButtonProps } from "./ui/button"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface CreateArticleButtonProps extends ButtonProps {
    siteId: string
}

export function CreateArticleButton({ siteId, children, className, ...props }: CreateArticleButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    try {
                        await CreateArticle({ siteId }).then((res: any) => {
                            if (typeof res === "string") {
                                toast.error(res)
                                return
                            }
                            router.push(res.url)
                        })
                    } catch (error: any) {
                        toast.error(error.message || "Failed to create article")
                    }
                })
            }}
            className={className}
            {...props}
        >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children || (isPending ? "Creating..." : "Create Article")}
        </Button>
    )
}
