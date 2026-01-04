
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { useTeam } from "@/hooks/useTeam"

interface UseCollectionDataProps {
    collectionId?: string
    itemId?: string
    useSlugFromUrl?: boolean
}

interface CollectionDataResult {
    data: Record<string, any>
    fields: any[]
    loading: boolean
    error: string | null
    slug: string
    id: string
}

export function useCollectionData({
    collectionId,
    itemId,
    useSlugFromUrl,
}: UseCollectionDataProps): CollectionDataResult {
    const [itemData, setItemData] = useState<any>(null)
    const [fields, setFields] = useState<any[]>([])
    const [loading, setLoading] = useState(false) // Start false, set true if collectionId exists
    const [error, setError] = useState<string | null>(null)

    const { team, loading: teamLoading } = useTeam(undefined, 'tenant')
    const params = useParams()
    const slugFromUrl = params?.slug as string

    useEffect(() => {
        if (!team?.id || !collectionId) {
            setLoading(false)
            return
        }

        const controller = new AbortController()
        const loadItem = async () => {
            try {
                setLoading(true)
                setError(null)

                // 1. Fetch collection fields/meta
                const { data: collectionData } = await axios.get(
                    `/api/v1/${team.id}/collections/${collectionId}/items?limit=1`,
                    { signal: controller.signal }
                )
                setFields(collectionData.collection?.fields || [])

                // 2. Fetch Item Data
                let targetSlug = ''
                if (useSlugFromUrl && slugFromUrl) {
                    targetSlug = slugFromUrl
                }

                if (itemId) {
                    // Fetch by ID
                    const { data } = await axios.get(
                        `/api/v1/${team.id}/collections/${collectionId}/items?limit=100`,
                        { signal: controller.signal }
                    )
                    const foundItem = data.items?.find((i: any) => i.id === itemId)
                    if (foundItem) setItemData(foundItem)
                    else setError("Item not found")

                } else if (targetSlug) {
                    // Fetch by Slug
                    const { data } = await axios.get(
                        `/api/v1/${team.id}/collections/${collectionId}/items?limit=100`,
                        { signal: controller.signal }
                    )
                    const foundItem = data.items?.find((i: any) => i.slug === targetSlug)
                    if (foundItem) setItemData(foundItem)
                    else setError("Item not found")
                } else {
                    // Fallback: use first item
                    if (collectionData.items?.length > 0) {
                        setItemData(collectionData.items[0])
                    }
                }

            } catch (err: any) {
                if (axios.isCancel(err)) return
                console.error("Failed to load collection data:", err)
                setError("Failed to load data")
            } finally {
                setLoading(false)
            }
        }

        loadItem()
        return () => controller.abort()
    }, [team?.id, collectionId, itemId, useSlugFromUrl, slugFromUrl])

    return {
        data: itemData?.data || {},
        slug: itemData?.slug || '',
        id: itemData?.id || '',
        fields,
        loading: loading || teamLoading,
        error
    }
}
