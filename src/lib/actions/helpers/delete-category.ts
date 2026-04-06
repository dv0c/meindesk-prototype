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

    await db.$transaction(async (tx) => {
        const linked = await tx.article.findMany({
            where: {
                siteId,
                categories: { has: categoryId },
            },
            select: { id: true, categories: true },
        });

        for (const a of linked) {
            const next = a.categories.filter((c) => c !== categoryId);
            await tx.article.update({
                where: { id: a.id },
                data: { categories: next },
            });
        }

        await tx.category.delete({
            where: { id: categoryId },
        });
    });

    return { success: true, message: "Category deleted successfully" };
}
