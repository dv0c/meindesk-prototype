"use server"

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema for Field Definition
const FieldSchema = z.object({
    name: z.string().min(1, "Field name is required").regex(/^[a-z0-9_]+$/, "Name must be lowercase alphanumeric with underscores"),
    type: z.enum(["text", "richtext", "number", "image", "boolean", "date", "select", "relation"]),
    label: z.string().min(1, "Label is required"),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(), // For select type
    relatedCollectionId: z.string().optional(), // For relations
    relationType: z.enum(["one-to-one", "one-to-many"]).optional(), // For relations
})

const CreateCollectionSchema = z.object({
    siteId: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    fields: z.array(FieldSchema).min(1, "At least one field is required"),
})

export async function createCollection(data: z.infer<typeof CreateCollectionSchema>) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    const validated = CreateCollectionSchema.safeParse(data)
    if (!validated.success) return { error: validated.error.message } // Simplification

    const { siteId, name, description, fields } = validated.data

    // Auto-generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")

    try {
        const collection = await db.collection.create({
            data: {
                siteId,
                name,
                slug,
                description,
                fields: fields as any, // Json type
            }
        })

        revalidatePath(`/dashboard/${siteId}/collections`)
        return { success: true, collection }
    } catch (error: any) {
        console.error("Create Collection Error:", error)
        return { error: error.message }
    }
}

export async function getCollections(siteId: string) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    try {
        const collections = await db.collection.findMany({
            where: { siteId },
            orderBy: { createdAt: "desc" }
        })
        return { collections }
    } catch (error) {
        return { error: "Failed to fetch collections" }
    }
}

export async function getCollection(id: string) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    try {
        const collection = await db.collection.findUnique({
            where: { id },
            include: {
                items: {
                    take: 5,
                    orderBy: {
                        updatedAt: 'desc'
                    }
                }
            }
        })
        return { collection }
    } catch (error) {
        return { error: "Failed to fetch collection" }
    }
}

export async function deleteCollection(id: string, siteId: string, relationAction?: 'CASCADE' | 'REMOVE_FIELD') {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    try {
        // Handle incoming collection references if action specified
        if (relationAction) {
            const references = await findCollectionReferences(id, siteId)

            if (references.length > 0) {
                if (relationAction === 'CASCADE') {
                    // Delete all collections that reference this one
                    for (const ref of references) {
                        await db.collection.delete({ where: { id: ref.collectionId } })
                    }
                } else if (relationAction === 'REMOVE_FIELD') {
                    // Remove the relation field from referencing collections
                    for (const ref of references) {
                        const refCollection = await db.collection.findUnique({ where: { id: ref.collectionId } })
                        if (refCollection) {
                            const fields = refCollection.fields as any[]
                            const updatedFields = fields.filter((f: any) => f.name !== ref.fieldName)

                            await db.collection.update({
                                where: { id: ref.collectionId },
                                data: { fields: updatedFields }
                            })

                            // Also need to clean up the field data from all items in that collection
                            const items = await db.collectionItem.findMany({
                                where: { collectionId: ref.collectionId }
                            })

                            for (const item of items) {
                                const data = item.data as any
                                if (data[ref.fieldName] !== undefined) {
                                    delete data[ref.fieldName]
                                    await db.collectionItem.update({
                                        where: { id: item.id },
                                        data: { data }
                                    })
                                }
                            }
                        }
                    }
                }
            }
        }

        await db.collection.delete({ where: { id } })
        revalidatePath(`/dashboard/${siteId}/collections`)
        return { success: true }
    } catch (error) {
        console.error("Delete collection error:", error)
        return { error: "Failed to delete collection" }
    }
}

// Check for collections that have relation fields pointing to this collection
export async function checkCollectionReferences(collectionId: string) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    try {
        const collection = await db.collection.findUnique({
            where: { id: collectionId }
        })

        if (!collection) return { error: "Collection not found" }

        const references = await findCollectionReferences(collectionId, collection.siteId)
        return { references }
    } catch (error) {
        console.error("Check collection references error:", error)
        return { error: "Failed to check references" }
    }
}

// Internal helper to find all collections with relation fields pointing to the given collection
async function findCollectionReferences(collectionId: string, siteId: string) {
    // Get all collections in this site
    const collections = await db.collection.findMany({
        where: { siteId },
        select: { id: true, name: true, fields: true }
    })

    const references: Array<{
        collectionId: string
        collectionName: string
        fieldName: string
        fieldLabel: string
        itemCount: number
    }> = []

    // Check each collection for relation fields pointing to our target
    for (const col of collections) {
        if (col.id === collectionId) continue // Skip self

        const fields = col.fields as any[]
        const relationFields = fields?.filter((f: any) =>
            f.type === 'relation' && f.relatedCollectionId === collectionId
        ) || []

        for (const field of relationFields) {
            // Count how many items in this collection use this relation
            const items = await db.collectionItem.findMany({
                where: { collectionId: col.id },
                select: { data: true }
            })

            const itemsWithRelation = items.filter((item: any) => {
                const data = item.data as any
                const value = data[field.name]
                return value !== null && value !== undefined &&
                    (Array.isArray(value) ? value.length > 0 : true)
            })

            references.push({
                collectionId: col.id,
                collectionName: col.name,
                fieldName: field.name,
                fieldLabel: field.label,
                itemCount: itemsWithRelation.length
            })
        }
    }

    return references
}

// Update a collection (e.g., name, fields)
export async function updateCollection(id: string, data: any) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    try {
        const collection = await db.collection.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                fields: data.fields
            }
        })

        revalidatePath(`/dashboard/${collection.siteId}/collections`)
        return { success: true, collection }
    } catch (error) {
        return { error: "Failed to update collection" }
    }
}

