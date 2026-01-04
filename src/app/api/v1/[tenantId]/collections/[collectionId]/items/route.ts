import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

// -------------------------------------------------------
// GET – Fetch all items from a collection (public API for tenant sites)
// -------------------------------------------------------
export async function GET(
    req: NextRequest,
    { params }: { params: { tenantId: string; collectionId: string } }
) {
    const { tenantId, collectionId } = await params
    const { searchParams } = new URL(req.url)

    // Query parameters
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : 50
    const status = searchParams.get("status") || "PUBLISHED"
    const orderBy = searchParams.get("orderBy") || "createdAt"
    const orderDir = searchParams.get("orderDir") || "desc"

    try {
        // First verify the collection belongs to this tenant
        const collection = await db.collection.findFirst({
            where: {
                id: collectionId,
                siteId: tenantId
            },
            select: {
                id: true,
                name: true,
                slug: true,
                fields: true
            }
        })

        if (!collection) {
            return NextResponse.json(
                { error: "Collection not found" },
                { status: 404 }
            )
        }

        // Fetch items
        const items = await db.collectionItem.findMany({
            where: {
                collectionId,
                status: status as any
            },
            orderBy: { [orderBy]: orderDir },
            take: limit
        })

        // Resolve relation fields if needed
        const fields = collection.fields as any[]
        const relationFields = fields?.filter((f: any) => f.type === 'relation') || []

        let resolvedItems = items

        if (relationFields.length > 0) {
            // Collect all relation IDs
            const idsToResolve: string[] = []
            items.forEach((item: any) => {
                relationFields.forEach((field: any) => {
                    const val = item.data[field.name]
                    if (val) {
                        if (Array.isArray(val)) {
                            idsToResolve.push(...val)
                        } else {
                            idsToResolve.push(val)
                        }
                    }
                })
            })

            // Fetch related items
            if (idsToResolve.length > 0) {
                const uniqueIds = Array.from(new Set(idsToResolve))
                const relatedItems = await db.collectionItem.findMany({
                    where: { id: { in: uniqueIds } },
                    select: { id: true, data: true, slug: true }
                })

                const relatedMap: Record<string, any> = {}
                relatedItems.forEach((item: any) => {
                    relatedMap[item.id] = {
                        id: item.id,
                        slug: item.slug,
                        ...item.data
                    }
                })

                // Enhance items with resolved relations
                resolvedItems = items.map((item: any) => {
                    const enhancedData = { ...item.data }
                    relationFields.forEach((field: any) => {
                        const val = item.data[field.name]
                        if (val) {
                            if (Array.isArray(val)) {
                                enhancedData[`${field.name}_resolved`] = val.map(id => relatedMap[id]).filter(Boolean)
                            } else {
                                enhancedData[`${field.name}_resolved`] = relatedMap[val] || null
                            }
                        }
                    })
                    return { ...item, data: enhancedData }
                })
            }
        }

        return NextResponse.json({
            collection: {
                id: collection.id,
                name: collection.name,
                slug: collection.slug,
                fields: collection.fields
            },
            items: resolvedItems,
            total: resolvedItems.length
        })
    } catch (error) {
        console.error("Error fetching collection items:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
