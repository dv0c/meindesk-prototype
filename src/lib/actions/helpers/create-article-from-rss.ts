"use server";
import { db } from "@/lib/db";
import generateSlug from "@/lib/generateSlug";
import DOMPurify from "isomorphic-dompurify";

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
    const cleanHtml = DOMPurify.sanitize(sanitizedHtml, {
        ALLOWED_TAGS: [
            "p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6",
            "ul", "ol", "li", "a", "img", "blockquote", "code", "pre",
        ],
        ALLOWED_ATTR: ["href", "src", "alt", "target", "rel"],
    });

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
            categories: rssItem.categories || [],
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
