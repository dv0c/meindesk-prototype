import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sanitizeCSS } from "@/lib/security/sanitize-css";
import type { WebsiteSettings } from "@/lib/types";
import {
    sanitizeColor,
    sanitizeFontFamily,
    sanitizeText,
    sanitizeKeywords,
    sanitizeTwitterHandle,
    validateColor,
    validateFontFamily,
    validateText,
    validateURL,
    validateKeywords,
    validateRobots,
    validateTwitterHandle,
    validateThemeMode,
    validateOgType
} from "@/lib/security/validate-inputs";


export async function GET(
    req: Request,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        const { tenantId } = await params;

        // Fetch site with settings
        const site = await db.site.findUnique({
            where: { id: tenantId },
            select: { settings: true },
        });

        if (!site) {
            return NextResponse.json({ error: "Site not found" }, { status: 404 });
        }

        // Return settings or default empty object
        return NextResponse.json(site.settings || {});
    } catch (error) {
        console.error("Error fetching site settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    try {
        const { tenantId } = await params;
        const rawSettings: Partial<WebsiteSettings> = await req.json();

        // Validation errors array
        const errors: string[] = [];

        // Validate and sanitize title
        if (rawSettings.title) {
            const titleValidation = validateText(rawSettings.title, 200);
            if (!titleValidation.valid) {
                errors.push(`Title: ${titleValidation.error}`);
            }
        }

        // Validate and sanitize description
        if (rawSettings.description) {
            const descValidation = validateText(rawSettings.description, 500);
            if (!descValidation.valid) {
                errors.push(`Description: ${descValidation.error}`);
            }
        }

        // Validate theme colors and mode
        if (rawSettings.theme) {
            const { primaryColor, secondaryColor, backgroundColor, textColor, fontFamily, mode } = rawSettings.theme;

            if (primaryColor) {
                const colorValidation = validateColor(primaryColor);
                if (!colorValidation.valid) {
                    errors.push(`Primary Color: ${colorValidation.error}`);
                }
            }

            if (secondaryColor) {
                const colorValidation = validateColor(secondaryColor);
                if (!colorValidation.valid) {
                    errors.push(`Secondary Color: ${colorValidation.error}`);
                }
            }

            if (backgroundColor) {
                const colorValidation = validateColor(backgroundColor);
                if (!colorValidation.valid) {
                    errors.push(`Background Color: ${colorValidation.error}`);
                }
            }

            if (textColor) {
                const colorValidation = validateColor(textColor);
                if (!colorValidation.valid) {
                    errors.push(`Text Color: ${colorValidation.error}`);
                }
            }

            if (fontFamily) {
                const fontValidation = validateFontFamily(fontFamily);
                if (!fontValidation.valid) {
                    errors.push(`Font Family: ${fontValidation.error}`);
                }
            }

            if (mode) {
                const modeValidation = validateThemeMode(mode);
                if (!modeValidation.valid) {
                    errors.push(`Theme Mode: ${modeValidation.error}`);
                }
            }
        }

        // Validate favicon URL
        if (rawSettings.favicon) {
            const urlValidation = validateURL(rawSettings.favicon);
            if (!urlValidation.valid) {
                errors.push(`Favicon: ${urlValidation.error}`);
            }
        }

        // Validate SEO settings
        if (rawSettings.seo) {
            const {
                metaTitle,
                metaDescription,
                keywords,
                author,
                robots,
                canonical,
                ogTitle,
                ogDescription,
                ogImage,
                ogType,
                twitterSite,
                twitterCreator
            } = rawSettings.seo;

            if (metaTitle) {
                const titleValidation = validateText(metaTitle, 200);
                if (!titleValidation.valid) {
                    errors.push(`SEO Meta Title: ${titleValidation.error}`);
                }
            }

            if (metaDescription) {
                const descValidation = validateText(metaDescription, 500);
                if (!descValidation.valid) {
                    errors.push(`SEO Meta Description: ${descValidation.error}`);
                }
            }

            if (keywords) {
                const keywordsValidation = validateKeywords(keywords);
                if (!keywordsValidation.valid) {
                    errors.push(`SEO Keywords: ${keywordsValidation.error}`);
                }
            }

            if (author) {
                const authorValidation = validateText(author, 100);
                if (!authorValidation.valid) {
                    errors.push(`SEO Author: ${authorValidation.error}`);
                }
            }

            if (robots) {
                const robotsValidation = validateRobots(robots);
                if (!robotsValidation.valid) {
                    errors.push(`SEO Robots: ${robotsValidation.error}`);
                }
            }

            if (canonical) {
                const urlValidation = validateURL(canonical);
                if (!urlValidation.valid) {
                    errors.push(`SEO Canonical URL: ${urlValidation.error}`);
                }
            }

            if (ogTitle) {
                const titleValidation = validateText(ogTitle, 200);
                if (!titleValidation.valid) {
                    errors.push(`Open Graph Title: ${titleValidation.error}`);
                }
            }

            if (ogDescription) {
                const descValidation = validateText(ogDescription, 500);
                if (!descValidation.valid) {
                    errors.push(`Open Graph Description: ${descValidation.error}`);
                }
            }

            if (ogImage) {
                const urlValidation = validateURL(ogImage);
                if (!urlValidation.valid) {
                    errors.push(`Open Graph Image: ${urlValidation.error}`);
                }
            }

            if (ogType) {
                const typeValidation = validateOgType(ogType);
                if (!typeValidation.valid) {
                    errors.push(`Open Graph Type: ${typeValidation.error}`);
                }
            }

            if (twitterSite) {
                const handleValidation = validateTwitterHandle(twitterSite);
                if (!handleValidation.valid) {
                    errors.push(`Twitter Site: ${handleValidation.error}`);
                }
            }

            if (twitterCreator) {
                const handleValidation = validateTwitterHandle(twitterCreator);
                if (!handleValidation.valid) {
                    errors.push(`Twitter Creator: ${handleValidation.error}`);
                }
            }
        }

        // Return validation errors if any
        if (errors.length > 0) {
            return NextResponse.json(
                { error: "Validation failed", errors },
                { status: 400 }
            );
        }

        // Sanitize all inputs before saving (as JSON-compatible partial update)
        const sanitizedSettings: any = {};

        if (rawSettings.title !== undefined) {
            sanitizedSettings.title = rawSettings.title ? sanitizeText(rawSettings.title, 200) : '';
        }

        if (rawSettings.description !== undefined) {
            sanitizedSettings.description = rawSettings.description ? sanitizeText(rawSettings.description, 500) : '';
        }

        if (rawSettings.favicon !== undefined) {
            sanitizedSettings.favicon = rawSettings.favicon;
        }

        if (rawSettings.theme) {
            sanitizedSettings.theme = {
                mode: rawSettings.theme.mode,
                primaryColor: rawSettings.theme.primaryColor ? sanitizeColor(rawSettings.theme.primaryColor) : '#000000',
                secondaryColor: rawSettings.theme.secondaryColor ? sanitizeColor(rawSettings.theme.secondaryColor) : '#ffffff',
                backgroundColor: rawSettings.theme.backgroundColor ? sanitizeColor(rawSettings.theme.backgroundColor) : '#ffffff',
                textColor: rawSettings.theme.textColor ? sanitizeColor(rawSettings.theme.textColor) : '#000000',
                fontFamily: rawSettings.theme.fontFamily ? sanitizeFontFamily(rawSettings.theme.fontFamily) : 'Inter',
            };
        }

        if (rawSettings.globalCss !== undefined) {
            sanitizedSettings.globalCss = rawSettings.globalCss ? sanitizeCSS(rawSettings.globalCss) : undefined;
        }

        if (rawSettings.seo !== undefined) {
            sanitizedSettings.seo = rawSettings.seo ? {
                metaTitle: rawSettings.seo.metaTitle ? sanitizeText(rawSettings.seo.metaTitle, 200) : undefined,
                metaDescription: rawSettings.seo.metaDescription ? sanitizeText(rawSettings.seo.metaDescription, 500) : undefined,
                keywords: rawSettings.seo.keywords ? sanitizeKeywords(rawSettings.seo.keywords) : undefined,
                author: rawSettings.seo.author ? sanitizeText(rawSettings.seo.author, 100) : undefined,
                robots: rawSettings.seo.robots,
                canonical: rawSettings.seo.canonical,
                ogTitle: rawSettings.seo.ogTitle ? sanitizeText(rawSettings.seo.ogTitle, 200) : undefined,
                ogDescription: rawSettings.seo.ogDescription ? sanitizeText(rawSettings.seo.ogDescription, 500) : undefined,
                ogImage: rawSettings.seo.ogImage,
                ogType: rawSettings.seo.ogType,
                twitterCard: rawSettings.seo.twitterCard,
                twitterSite: rawSettings.seo.twitterSite ? sanitizeTwitterHandle(rawSettings.seo.twitterSite) : undefined,
                twitterCreator: rawSettings.seo.twitterCreator ? sanitizeTwitterHandle(rawSettings.seo.twitterCreator) : undefined,
            } : undefined;
        }

        // Update site settings
        const site = await db.site.update({
            where: { id: tenantId },
            data: { settings: sanitizedSettings as any },
        });

        // Invalidate the cache so tenant site sees the new settings immediately
        revalidatePath('/', 'layout');

        return NextResponse.json(site.settings);
    } catch (error) {
        console.error("Error updating site settings:", error);
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
