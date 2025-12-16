"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DeleteCategory({
    siteId,
    categoryId,
}: {
    siteId: string;
    categoryId: string;
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

    // Check if any articles are using this category
    const articlesUsingCategory = await db.article.findFirst({
        where: {
            siteId,
            categories: {
                has: categoryId,
            },
        },
    });

    if (articlesUsingCategory) {
        throw new Error(
            "Cannot delete category that is being used by articles. Please remove the category from all articles first."
        );
    }

    // Delete the category
    await db.category.delete({
        where: { id: categoryId },
    });

    return { success: true, message: "Category deleted successfully" };
}
