"use server"

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CreateItemSchema = z.object({
    collectionId: z.string(),
    data: z.record(z.any()), // Dynamic data validation will happen on client or via custom validator against schema
    status: z.enum(["PUBLISHED", "DRAFT", "ARCHIVED"]).default("DRAFT"),
    slug: z.string().optional(), // Can be auto-generated
})

export async function createItem(payload: z.infer<typeof CreateItemSchema>) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    const { collectionId, data, status, slug: providedSlug } = payload

    // We should ideally fetch the collection to validate `data` against `collection.fields` here.
    // For now, we trust the client-side validation for MVP speed, or do basic checks.

    // Generate slug from a "title" or "name" field if present, else random
    let slug = providedSlug
    if (!slug) {
        // Try to find a good candidate for the slug
        let candidate = data.title || data.name || data.slug
        if (!candidate) {
            // Find first string field that isn't a long text or url
            const possibleKeys = Object.keys(data).filter(k =>
                typeof data[k] === 'string' &&
                !k.toLowerCase().includes('id') &&
                !k.toLowerCase().includes('url') &&
                !k.toLowerCase().includes('image') &&
                data[k].length < 50
            )
            if (possibleKeys.length > 0) {
                candidate = data[possibleKeys[0]]
            }
        }

        candidate = candidate || `item-${Date.now()}`
        slug = String(candidate).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    }

    // Ensure slug uniqueness (basic implementation)
    // In production, we'd check DB and append -1, -2 etc.
    const existing = await db.collectionItem.findUnique({
        where: {
            collectionId_slug: {
                collectionId,
                slug: slug as string
            }
        }
    })

    if (existing) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`
    }

    try {
        const item = await db.collectionItem.create({
            data: {
                collectionId,
                data,
                slug: slug as string,
                status: status as any
            }
        })

        // Revalidate the collection items list
        // We need the siteId to revalidate the path properly, but we only have collectionId here.
        // We can fetch the collection to get the siteId, or just return success and let client router refresh.
        const collection = await db.collection.findUnique({ where: { id: collectionId } })
        if (collection) {
            revalidatePath(`/dashboard/${collection.siteId}/collections/${collectionId}`)
        }

        return { success: true, item }
    } catch (error: any) {
        console.error("Create Item Error:", error)
        return { error: error.message }
    }
}

export async function updateItem(id: string, data: any, status?: string) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    try {
        const item = await db.collectionItem.update({
            where: { id },
            data: {
                data,
                status: status as any
            },
            include: { collection: true }
        })

        revalidatePath(`/dashboard/${item.collection.siteId}/collections/${item.collectionId}`)
        return { success: true, item }
    } catch (error: any) {
        return { error: "Failed to update item" }
    }
}

export async function deleteItem(id: string) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    try {
        // Fetch first to get siteId for revalidation
        const item = await db.collectionItem.findUnique({
            where: { id },
            include: { collection: true }
        })

        if (!item) return { error: "Item not found" }

        await db.collectionItem.delete({ where: { id } })

        revalidatePath(`/dashboard/${item.collection.siteId}/collections/${item.collectionId}`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete item" }
    }
}

export async function getItems(collectionId: string) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    try {
        const items = await db.collectionItem.findMany({
            where: { collectionId },
            orderBy: { createdAt: "desc" }
        })
        return { items }
    } catch (error) {
        return { error: "Failed to load items" }
    }
}

export async function getItem(id: string) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    try {
        const item = await db.collectionItem.findUnique({
            where: { id },
            include: { collection: true }
        })
        return { item }
    } catch (error) {
        return { error: "Failed to fetch item" }
    }
}

export async function getResolvedNames(ids: string[]) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    if (ids.length === 0) return { names: {} }

    try {
        const items = await db.collectionItem.findMany({
            where: { id: { in: ids } },
            select: { id: true, data: true, slug: true }
        })

        const names: Record<string, string> = {}
        items.forEach((item: any) => {
            // Heuristic for name: title > name > slug
            let display = item.data.title || item.data.name

            if (!display) {
                const possibleKeys = Object.keys(item.data).filter(k =>
                    typeof item.data[k] === 'string' &&
                    !k.toLowerCase().includes('id') &&
                    !k.toLowerCase().includes('url') &&
                    !k.toLowerCase().includes('image') &&
                    item.data[k].length < 50
                )
                if (possibleKeys.length > 0) {
                    display = item.data[possibleKeys[0]]
                }
            }

            names[item.id] = display || item.slug
        })

        return { names }
    } catch (error) {
        return { error: "Failed to resolve names" }
    }
}
