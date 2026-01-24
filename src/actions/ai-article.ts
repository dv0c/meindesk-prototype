
"use server";

import { generateArticle } from "@/lib/ai/article-generator";
import { db } from "@/lib/db";
import { markdownToLexical } from "@/lib/lexical-utils";
import { requireAuth } from "@/lib/security/route-auth";

export async function generateArticleAction(tourUrl: string, topic: string) {
    try {
        const session = await requireAuth(); // Ensure user is authenticated
        const articleData = await generateArticle(tourUrl, topic);

        // Convert Markdown to Lexical State
        const content = markdownToLexical(articleData.markdownContent);

        return {
            success: true,
            data: {
                ...articleData,
                content
            }
        };
    } catch (error: any) {
        console.error("Error generating article:", error);
        return {
            success: false,
            error: error.message || "Failed to generate article"
        };
    }
}

export async function getSitesAndAuthors() {
    try {
        const session = await requireAuth();

        // Fetch sites the user has access to (or all if admin - assuming admin for now based on context)
        // For this prototype, we'll fetch all sites and users
        const sites = await db.site.findMany({
            select: { id: true, title: true, subdomain: true }
        });

        const authors = await db.user.findMany({
            select: { id: true, name: true, image: true, email: true }
        });

        return {
            success: true,
            sites,
            authors
        };

    } catch (error: any) {
        console.error("Error fetching sites and authors:", error);
        return {
            success: false,
            error: error.message
        }
    }
}

export async function createArticleDraft(siteId: string, authorId: string, articleData: any) {
    try {
        await requireAuth();

        const { title, content, metaTitle, metaDescription, markdown } = articleData;

        let finalContent = content;
        if (markdown) {
            // Recalculate Lexical state from the (potentially edited) markdown
            finalContent = markdownToLexical(markdown);
        }

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        const newArticle = await db.article.create({
            data: {
                siteId,
                authorId,
                title,
                slug: `${slug}-${Date.now()}`, // Ensure unique slug
                content: finalContent, // This is already Lexical state
                excerpt: metaDescription || "", // Automatically use meta description as excerpt
                status: "DRAFT",
                metadata: {
                    seo: {
                        metaTitle,
                        metaDescription
                    },
                    aiGenerated: true
                }
            }
        });

        return {
            success: true,
            articleId: newArticle.id
        };

    } catch (error: any) {
        console.error("Error creating draft:", error);
        return {
            success: false,
            error: error.message
        }
    }
}
