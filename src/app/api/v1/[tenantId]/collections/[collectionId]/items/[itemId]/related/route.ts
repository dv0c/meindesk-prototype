import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

/**
 * GET - Find items that reference a specific item through a relation field
 * 
 * Example: Find all books where author = "author-123"
 * GET /api/v1/[tenantId]/collections/[collectionId]/items/[itemId]/related
 * ?relatedCollection=books&relationField=author
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { tenantId: string; collectionId: string; itemId: string } }
) {
    const { tenantId, collectionId, itemId } = await params
    const { searchParams } = new URL(req.url)

    const relatedCollectionId = searchParams.get("relatedCollection")
    const relationFieldName = searchParams.get("relationField")
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    if (!relatedCollectionId || !relationFieldName) {
        return NextResponse.json(
            { error: "Missing relatedCollection or relationField parameter" },
            { status: 400 }
        )
    }

    try {
        // Verify the source collection and item exist
        const sourceItem = await db.collectionItem.findFirst({
            where: {
                id: itemId,
                collectionId: collectionId,
                collection: { siteId: tenantId }
            },
            select: { id: true, slug: true, data: true }
        })

        if (!sourceItem) {
            return NextResponse.json(
                { error: "Source item not found" },
                { status: 404 }
            )
        }

        // Get the related collection
        const relatedCollection = await db.collection.findFirst({
            where: {
                id: relatedCollectionId,
                siteId: tenantId
            },
            select: {
                id: true,
                name: true,
                slug: true,
                fields: true
            }
        })

        if (!relatedCollection) {
            return NextResponse.json(
                { error: "Related collection not found" },
                { status: 404 }
            )
        }

        // Verify the relation field exists
        const fields = relatedCollection.fields as any[]
        const relationField = fields?.find(f => f.name === relationFieldName && f.type === 'relation')

        if (!relationField) {
            return NextResponse.json(
                { error: `Relation field '${relationFieldName}' not found in collection` },
                { status: 400 }
            )
        }

        // Find all items in related collection where the relation field matches this item
        const relatedItems = await db.collectionItem.findMany({
            where: {
                collectionId: relatedCollectionId,
                status: "PUBLISHED"
            },
            take: limit * 2 // Fetch extra since we filter in memory
        })

        // Filter items that reference this item
        const matchingItems = relatedItems.filter((item: any) => {
            const relationValue = item.data?.[relationFieldName]
            if (!relationValue) return false

            // Handle both single and multi-select relations
            if (Array.isArray(relationValue)) {
                return relationValue.includes(itemId)
            }
            return relationValue === itemId
        }).slice(0, limit)

        return NextResponse.json({
            sourceItem: {
                id: sourceItem.id,
                slug: sourceItem.slug
            },
            relatedCollection: {
                id: relatedCollection.id,
                name: relatedCollection.name,
                slug: relatedCollection.slug,
                fields: relatedCollection.fields
            },
            items: matchingItems,
            total: matchingItems.length
        })
    } catch (error) {
        console.error("Error fetching related items:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
