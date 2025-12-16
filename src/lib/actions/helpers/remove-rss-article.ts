"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function RemoveRssArticle({
    siteId,
    articleId,
}: {
    siteId: string;
    articleId: string;
}) {
    const session = await getAuthSession();
    if (!session?.user.id) throw new Error("Not authorized");

    // Verify site ownership and article belongs to this site
    const article = await db.article.findFirst({
        where: {
            id: articleId,
            siteId,
            site: {
                userId: session.user.id,
            },
        },
    });

    if (!article) throw new Error("Article not found or not yours");

    // Delete the article
    await db.article.delete({
        where: { id: articleId },
    });

    return {
        message: "Article removed successfully!",
        success: true,
    };
}
