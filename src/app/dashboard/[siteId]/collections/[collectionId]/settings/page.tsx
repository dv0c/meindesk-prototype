"use client"

import { ScrambleTextOnHover } from "@/app/(home)/components/scramble-text"
import { CollectionWizard } from "@/components/collection-wizard"
import { deleteCollection, getCollection, getCollections, updateCollection } from "@/lib/actions/collection-actions"
import { Loader2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function EditCollectionPage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [initialData, setInitialData] = useState<any>(null)
    const [existingCollections, setExistingCollections] = useState<any[]>([])

    useEffect(() => {
        const load = async () => {
            const res = await getCollection(params.collectionId as string)
            const colsRes = await getCollections(params.siteId as string)

            if (res.collection) {
                setInitialData({
                    name: res.collection.name,
                    description: res.collection.description,
                    fields: res.collection.fields
                })
            }
            if (colsRes.collections) {
                setExistingCollections(colsRes.collections.filter((c: any) => c.id !== params.collectionId))
            }
            setLoading(false)
        }
        load()
    }, [params.collectionId, params.siteId])

    const handleSave = async (data: any) => {
        const res = await updateCollection(params.collectionId as string, {
            name: data.step1.name,
            description: data.step1.description,
            fields: data.step2
        })

        if (res.success) {
            toast.success("Schema Updated")
            router.push(`/dashboard/${params.siteId}/collections/${params.collectionId}`)
        } else {
            toast.error("Update Failed")
        }
    }

    const handleDelete = async () => {
        if (confirm("DELETE ENTIRE COLLECTION? ALL DATA WILL BE LOST.")) {
            await deleteCollection(params.collectionId as string, params.siteId as string)
            router.push(`/dashboard/${params.siteId}/collections`)
        }
    }


    if (loading) return (
        <div className="fixed inset-0 bg-background flex items-center justify-center font-mono text-foreground">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-foreground/50" />
                <ScrambleTextOnHover text="LOADING SCHEMA..." />
            </div>
        </div>
    )

    return (
        <CollectionWizard
            mode="edit"
            initialData={initialData}
            existingCollections={existingCollections}
            onComplete={handleSave}
            onDelete={handleDelete}
            backCheckPath={`/dashboard/${params.siteId}/collections/${params.collectionId}`}
        />
    )
}
