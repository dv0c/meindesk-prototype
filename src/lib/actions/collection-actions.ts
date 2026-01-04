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

export async function deleteCollection(id: string, siteId: string) {
    const session = await getAuthSession()
    if (!session) return { error: "Unauthorized" }

    try {
        await db.collection.delete({ where: { id } })
        revalidatePath(`/dashboard/${siteId}/collections`)
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete collection" }
    }
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
