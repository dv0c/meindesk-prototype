"use server";
import { db } from "@/lib/db";
import generateSlug from "@/lib/generateSlug";
import * as cheerio from "cheerio";

// Simple HTML sanitizer using cheerio (avoids jsdom ESM issues in production)
function sanitizeHtml(html: string): string {
    const $ = cheerio.load(html);

    // Remove script, style, and other dangerous elements
    $("script, style, iframe, object, embed, form, input, textarea, button, noscript").remove();

    // Remove event handlers and dangerous attributes from all elements
    $("*").each((_, el) => {
        const attribs = (el as cheerio.Element).attribs || {};
        for (const attr of Object.keys(attribs)) {
            if (attr.startsWith("on") || attr === "style" && attribs[attr].includes("javascript:")) {
                $(el).removeAttr(attr);
            }
        }
        // Remove javascript: hrefs
        if (attribs.href && attribs.href.toLowerCase().startsWith("javascript:")) {
            $(el).removeAttr("href");
        }
        if (attribs.src && attribs.src.toLowerCase().startsWith("javascript:")) {
            $(el).removeAttr("src");
        }
    });

    return $.html();
}

interface RssItemData {
    id: string;
    title: string | null;
    link: string;
    description: string | null;
    content: string | null;
    thumbnail: string | null;
    site_name: string | null;
    categories: string[];
}

interface CreateArticleOptions {
    siteId: string;
    authorId: string;
    rssId: string;
    rssItem: RssItemData;
    existingSlugs?: string[];
}

/**
 * Creates an article from an RSS item with proper validation and sanitization.
 * This is a shared helper to avoid code duplication between manual import and auto-import.
 */
export async function createArticleFromRss({
    siteId,
    authorId,
    rssId,
    rssItem,
    existingSlugs,
}: CreateArticleOptions) {
    // Validate that link is a valid URL
    try {
        new URL(rssItem.link);
    } catch {
        throw new Error(`Invalid URL for RSS item: ${rssItem.link}`);
    }

    const title = rssItem.title?.trim() || "Untitled Article";

    // Generate unique slug using the enhanced generateSlug utility
    const slug = await generateSlug(title, "article", siteId, existingSlugs);

    // Sanitize HTML content to prevent XSS
    const sanitizedHtml = rssItem.content || rssItem.description || "";
    const cleanHtml = sanitizeHtml(sanitizedHtml);

    // Build attribution content for Lexical editor
    const siteName = rssItem.site_name || "Unknown Source";
    const attributionContent = {
        root: {
            children: [
                {
                    children: [
                        {
                            detail: 0,
                            format: 8,
                            mode: "normal",
                            style: "font-size: 13px;",
                            text: "Source provided by ",
                            type: "text",
                            version: 1,
                        },
                        {
                            children: [
                                {
                                    detail: 0,
                                    format: 8,
                                    mode: "normal",
                                    style: "font-size: 13px;",
                                    text: siteName,
                                    type: "text",
                                    version: 1,
                                },
                            ],
                            direction: null,
                            format: "",
                            indent: 0,
                            type: "link",
                            version: 1,
                            textFormat: 8,
                            textStyle: "font-size: 13px;",
                            rel: "noreferrer",
                            target: null,
                            title: null,
                            url: rssItem.link,
                        },
                    ],
                    direction: null,
                    format: "",
                    indent: 0,
                    type: "paragraph",
                    version: 1,
                    textFormat: 8,
                    textStyle: "font-size: 13px;",
                },
            ],
            direction: null,
            format: "",
            indent: 0,
            type: "root",
            version: 1,
            textFormat: 8,
            textStyle: "font-size: 13px;",
        },
    };

    // --- RSS Category Resolution Logic ---
    // Map category names to IDs, creating new categories if needed
    const resolvedCategoryIds: string[] = [];

    if (rssItem.categories && rssItem.categories.length > 0) {
        for (const catName of rssItem.categories) {
            if (!catName || typeof catName !== 'string') continue;

            const trimmedName = catName.trim();
            if (!trimmedName) continue;

            // Try to find existing category
            let category = await db.category.findFirst({
                where: {
                    siteId,
                    name: { equals: trimmedName, mode: "insensitive" },
                },
            });

            if (!category) {
                // Create new category
                const catSlug = trimmedName
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/[\s_-]+/g, "-")
                    .replace(/^-+|-+$/g, "") || "uncategorized";

                try {
                    category = await db.category.create({
                        data: {
                            name: trimmedName,
                            slug: catSlug,
                            description: "Auto-created from RSS import",
                            siteId,
                            published: true,
                        },
                    });
                } catch (err) {
                    // In case of race condition or creation error, just skip adding this category
                    console.error(`Failed to create category ${trimmedName}:`, err);
                    continue;
                }
            }

            if (category) {
                resolvedCategoryIds.push(category.id);
            }
        }
    }
    // Remove duplicates
    const uniqueCategoryIds = Array.from(new Set(resolvedCategoryIds));


    // Create the article
    const article = await db.article.create({
        data: {
            siteId,
            title,
            slug,
            excerpt: rssItem.description?.slice(0, 250) || null,
            html: cleanHtml,
            cover: rssItem.thumbnail || null,
            status: "DRAFT",
            content: attributionContent,
            sourceType: "RSS",
            categories: uniqueCategoryIds,
            sourceId: rssItem.id,
            authorId,
            metadata: {
                link: rssItem.link,
                rssId,
                importedAt: new Date().toISOString(),
            },
        },
    });

    return article;
}
