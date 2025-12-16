"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function UpdateCategory({
    siteId,
    categoryId,
    data,
}: {
    siteId: string;
    categoryId: string;
    data: {
        name?: string;
        description?: string;
        slug?: string;
        thumbnail?: string;
        published?: boolean;
    };
}) {
    const session = await getAuthSession();
    if (!session?.user.id) throw new Error("Not authorized");

    // Verify category ownership
    const category = await db.category.findFirst({
        where: {
            id: categoryId,
            siteId,
            site: {
                userId: session.user.id,
            },
        },
    });

    if (!category) throw new Error("Category not found or not yours");

    // If slug is being updated, check for duplicates
    if (data.slug && data.slug !== category.slug) {
        const existingCategory = await db.category.findFirst({
            where: {
                siteId,
                slug: data.slug,
                id: { not: categoryId },
            },
        });

        if (existingCategory) {
            throw new Error("A category with this slug already exists");
        }
    }

    // Update the category
    const updatedCategory = await db.category.update({
        where: { id: categoryId },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.slug && { slug: data.slug }),
            ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
            ...(data.published !== undefined && { published: data.published }),
        },
    });

    return updatedCategory;
}
