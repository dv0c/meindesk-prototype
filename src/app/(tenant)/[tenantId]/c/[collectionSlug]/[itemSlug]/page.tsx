// app/(tenant)/[tenantId]/c/[collectionSlug]/[itemSlug]/page.tsx
// Dynamic collection item detail page

import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { getCachedSiteDetails } from "@/lib/actions/helpers/cached-tenant"
import ClientPreview from "../../../ClientPreview"
import type { Metadata } from "next"

/**
 * Fetches the collection item and its associated template page
 */
async function getCollectionItemData(tenantId: string, collectionSlug: string, itemSlug: string) {
    // Get tenant
    const tenant = await getCachedSiteDetails(tenantId)
    if (!tenant) return null

    // Find the collection by slug
    const collection = await db.collection.findFirst({
        where: {
            siteId: tenantId,
            slug: collectionSlug
        },
        select: {
            id: true,
            name: true,
            slug: true,
            fields: true
        }
    })

    if (!collection) return null

    // Find the item by slug
    const item = await db.collectionItem.findFirst({
        where: {
            collectionId: collection.id,
            slug: itemSlug,
            status: "PUBLISHED"
        }
    })

    if (!item) return null

    // Find the template page for this collection (if one exists)
    // Look for a page with slug matching collection slug or with meta.collectionId
    let templatePage = await db.page.findFirst({
        where: {
            siteId: tenantId,
            OR: [
                { slug: `${collectionSlug}-template` },
                { slug: `${collectionSlug}-detail` },
            ]
        },
        select: { id: true }
    })

    // Fallback: use default template or homepage structure
    if (!templatePage) {
        // Check if there's a page that has collection item component configured
        templatePage = await db.page.findFirst({
            where: {
                siteId: tenantId,
                slug: collectionSlug
            },
            select: { id: true }
        })
    }

    // If no template found, we'll create a basic page structure
    let pageData = null
    if (templatePage) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        const response = await fetch(`${baseUrl}/api/v1/${tenant.id}/pages/${templatePage.id}`, {
            cache: "no-store",
        })
        if (response.ok) {
            pageData = await response.json()
        }
    }

    // Create a default page structure if no template
    if (!pageData) {
        pageData = {
            id: `collection-item-${item.id}`,
            title: getItemTitle(item, collection.fields as any[]),
            slug: itemSlug,
            content: null,
            meta: {}
        }
    }

    return { tenant, collection, item, page: pageData }
}

/**
 * Extract title from item data based on collection fields
 */
function getItemTitle(item: any, fields: any[]): string {
    const textFields = fields?.filter(f => f.type === 'text') || []
    const titleField = textFields.find(f =>
        f.name.toLowerCase().includes('title') ||
        f.name.toLowerCase().includes('name')
    )

    if (titleField && item.data?.[titleField.name]) {
        return String(item.data[titleField.name])
    }

    return item.slug || 'Item'
}

/**
 * Get description from item data
 */
function getItemDescription(item: any, fields: any[]): string {
    const textFields = fields?.filter(f => f.type === 'text' || f.type === 'richtext') || []
    const descField = textFields.find(f =>
        f.name.toLowerCase().includes('description') ||
        f.name.toLowerCase().includes('excerpt') ||
        f.name.toLowerCase().includes('summary')
    )

    if (descField && item.data?.[descField.name]) {
        // Strip HTML if rich text
        return String(item.data[descField.name]).replace(/<[^>]*>/g, '').substring(0, 160)
    }

    return ''
}

/**
 * Get image from item data
 */
function getItemImage(item: any, fields: any[]): string | null {
    const imageField = fields?.find(f => f.type === 'image')
    if (imageField && item.data?.[imageField.name]) {
        return item.data[imageField.name]
    }
    return null
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ tenantId: string; collectionSlug: string; itemSlug: string }>
}): Promise<Metadata> {
    const { tenantId, collectionSlug, itemSlug } = await params
    const data = await getCollectionItemData(tenantId, collectionSlug, itemSlug)

    if (!data) return {}

    const { item, collection, tenant } = data
    const fields = collection.fields as any[]

    const title = getItemTitle(item, fields)
    const description = getItemDescription(item, fields)
    const image = getItemImage(item, fields)

    return {
        title: `${title} | ${tenant.title || 'Site'}`,
        description,
        openGraph: {
            title,
            description,
            images: image ? [{ url: image }] : [],
            type: 'article',
        },
    }
}

export default async function CollectionItemPage({
    params,
}: {
    params: Promise<{ tenantId: string; collectionSlug: string; itemSlug: string }>
}) {
    const { tenantId, collectionSlug, itemSlug } = await params
    const data = await getCollectionItemData(tenantId, collectionSlug, itemSlug)

    if (!data) notFound()

    // Pass the item data as part of the page context
    // The page will contain CollectionItem components that read from URL
    const pageWithItemContext = {
        ...data.page,
        meta: {
            ...data.page.meta,
            collectionContext: {
                collectionId: data.collection.id,
                collectionSlug: data.collection.slug,
                itemId: data.item.id,
                itemSlug: data.item.slug,
                itemData: data.item.data
            }
        }
    }

    return <ClientPreview tenantId={data.tenant.id} page={pageWithItemContext} />
}
