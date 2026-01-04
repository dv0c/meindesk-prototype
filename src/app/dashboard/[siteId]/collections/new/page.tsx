"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createCollection, getCollections } from "@/lib/actions/collection-actions"
import { CollectionWizard } from "@/components/collection-wizard"
import { toast } from "sonner"
import { AnimatedNoise } from "@/app/(home)/components/animated-noise"
import { Loader2 } from "lucide-react"

export default function CreateCollectionPage() {
    const params = useParams()
    const router = useRouter()
    const [existingCollections, setExistingCollections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getCollections(params.siteId as string).then(res => {
            if (res.collections) {
                setExistingCollections(res.collections)
            }
            setLoading(false)
        })
    }, [params.siteId])

    const handleCreate = async (data: any) => {
        const res = await createCollection({
            siteId: params.siteId as string,
            name: data.step1.name,
            description: data.step1.description,
            fields: data.step2
        })

        if (res.success) {
            toast.success("SYSTEM UPDATE: COLLECTION CREATED")
            router.push(`/dashboard/${params.siteId}/collections`)
        } else {
            toast.error(res.error || "CRITICAL FAILURE")
        }
    }

    if (loading) return (
        <div className="fixed inset-0 bg-background flex items-center justify-center font-mono text-foreground">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-foreground/50" />
                <span className="text-xs uppercase tracking-widest">Loading System...</span>
            </div>
        </div>
    )

    return (
        <CollectionWizard
            onComplete={handleCreate}
            existingCollections={existingCollections}
            mode="create"
        />
    )
}

