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

export async function deleteItem(id: string, relationAction?: 'CASCADE' | 'SET_NULL') {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    try {
        // Fetch first to get siteId for revalidation
        const item = await db.collectionItem.findUnique({
            where: { id },
            include: { collection: true }
        })

        if (!item) return { error: "Item not found" }

        // Handle incoming references if action specified
        if (relationAction) {
            const references = await findIncomingReferences(id, item.collection.siteId)

            if (references.length > 0) {
                if (relationAction === 'CASCADE') {
                    // Delete all items that reference this one
                    for (const ref of references) {
                        await db.collectionItem.delete({ where: { id: ref.itemId } })
                    }
                } else if (relationAction === 'SET_NULL') {
                    // Set the relation field to null in all referencing items
                    for (const ref of references) {
                        const refItem = await db.collectionItem.findUnique({ where: { id: ref.itemId } })
                        if (refItem) {
                            const updatedData = { ...refItem.data as any }
                            const fieldValue = updatedData[ref.fieldName]

                            if (Array.isArray(fieldValue)) {
                                // Remove this ID from the array
                                updatedData[ref.fieldName] = fieldValue.filter((v: string) => v !== id)
                            } else {
                                // Set to null
                                updatedData[ref.fieldName] = null
                            }

                            await db.collectionItem.update({
                                where: { id: ref.itemId },
                                data: { data: updatedData }
                            })
                        }
                    }
                }
            }
        }

        await db.collectionItem.delete({ where: { id } })

        revalidatePath(`/dashboard/${item.collection.siteId}/collections/${item.collectionId}`)
        return { success: true }
    } catch (error) {
        console.error("Delete item error:", error)
        return { error: "Failed to delete item" }
    }
}

// Check for items that reference this item through relation fields
export async function checkIncomingReferences(itemId: string) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    try {
        const item = await db.collectionItem.findUnique({
            where: { id: itemId },
            include: { collection: true }
        })

        if (!item) return { error: "Item not found" }

        const references = await findIncomingReferences(itemId, item.collection.siteId)
        return { references }
    } catch (error) {
        console.error("Check references error:", error)
        return { error: "Failed to check references" }
    }
}

// Internal helper to find all items that reference the given itemId
async function findIncomingReferences(itemId: string, siteId: string) {
    // Get all collections in this site
    const collections = await db.collection.findMany({
        where: { siteId },
        select: { id: true, name: true, fields: true }
    })

    const references: Array<{
        itemId: string
        itemName: string
        collectionId: string
        collectionName: string
        fieldName: string
        fieldLabel: string
    }> = []

    // For each collection, check if it has relation fields
    for (const col of collections) {
        const fields = col.fields as any[]
        const relationFields = fields?.filter((f: any) => f.type === 'relation') || []

        if (relationFields.length === 0) continue

        // Get all items in this collection
        const items = await db.collectionItem.findMany({
            where: { collectionId: col.id },
            select: { id: true, data: true, slug: true }
        })

        // Check each item's relation fields
        for (const item of items) {
            const data = item.data as any
            for (const field of relationFields) {
                const value = data[field.name]
                if (!value) continue

                // Check if this field references our target item
                const hasReference = Array.isArray(value)
                    ? value.includes(itemId)
                    : value === itemId

                if (hasReference) {
                    // Get a display name for the referencing item
                    const itemName = data.title || data.name || item.slug

                    references.push({
                        itemId: item.id,
                        itemName,
                        collectionId: col.id,
                        collectionName: col.name,
                        fieldName: field.name,
                        fieldLabel: field.label
                    })
                }
            }
        }
    }

    return references
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
