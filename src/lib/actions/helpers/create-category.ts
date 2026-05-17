"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { mergeCategoryMetadata, type NavPlacement } from "@/lib/category-metadata";
import { triggerFrontendRevalidate } from "@/lib/frontend-revalidate";

export async function CreateCategory({
    siteId,
    data,
}: {
    siteId: string;
    data: {
        name: string;
        description?: string;
        slug: string;
        thumbnail?: string;
        published?: boolean;
        navPlacement?: NavPlacement;
        navOrder?: number;
    };
}) {
    const session = await getAuthSession();
    if (!session?.user.id) throw new Error("Not authorized");

    // Verify site access (Owner or Member)
    const site = await db.site.findFirst({
        where: {
            id: siteId,
            OR: [
                { userId: session.user.id },
                { members: { some: { id: session.user.id } } }
            ]
        },
    });
    if (!site) throw new Error("Site not found or not yours");

    // Check if slug already exists for this site
    const existingCategory = await db.category.findFirst({
        where: {
            siteId,
            slug: data.slug,
        },
    });

    if (existingCategory) {
        throw new Error("A category with this slug already exists");
    }

    // Create the category
    const metadata =
        data.navPlacement !== undefined || data.navOrder !== undefined
            ? mergeCategoryMetadata({}, { navPlacement: data.navPlacement, navOrder: data.navOrder })
            : undefined;

    const category = await db.category.create({
        data: {
            name: data.name,
            description: data.description || "",
            slug: data.slug,
            thumbnail: data.thumbnail,
            published: data.published ?? true,
            siteId,
            userId: session.user.id,
            ...(metadata ? { metadata } : {}),
        },
    });

    void triggerFrontendRevalidate(siteId);

    return category;
}
