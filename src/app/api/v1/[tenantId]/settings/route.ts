import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { sanitizeCSS } from "@/lib/security/sanitize-css";
import {
    sanitizeColor,
    sanitizeFontFamily,
    sanitizeText,
    validateColor,
    validateFontFamily,
    validateText
} from "@/lib/security/validate-inputs";

// Define settings type
type WebsiteSettings = {
    title?: string;
    description?: string;
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        fontFamily?: string;
    };
    globalCss?: string;
};

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
        const rawSettings: WebsiteSettings = await req.json();

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

        // Validate theme colors
        if (rawSettings.theme) {
            const { primaryColor, secondaryColor, backgroundColor, textColor, fontFamily } = rawSettings.theme;

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
        }

        // Return validation errors if any
        if (errors.length > 0) {
            return NextResponse.json(
                { error: "Validation failed", errors },
                { status: 400 }
            );
        }

        // Sanitize all inputs before saving
        const sanitizedSettings: WebsiteSettings = {
            title: rawSettings.title ? sanitizeText(rawSettings.title, 200) : undefined,
            description: rawSettings.description ? sanitizeText(rawSettings.description, 500) : undefined,
            theme: rawSettings.theme ? {
                primaryColor: rawSettings.theme.primaryColor ? sanitizeColor(rawSettings.theme.primaryColor) : undefined,
                secondaryColor: rawSettings.theme.secondaryColor ? sanitizeColor(rawSettings.theme.secondaryColor) : undefined,
                backgroundColor: rawSettings.theme.backgroundColor ? sanitizeColor(rawSettings.theme.backgroundColor) : undefined,
                textColor: rawSettings.theme.textColor ? sanitizeColor(rawSettings.theme.textColor) : undefined,
                fontFamily: rawSettings.theme.fontFamily ? sanitizeFontFamily(rawSettings.theme.fontFamily) : undefined,
            } : undefined,
            globalCss: rawSettings.globalCss ? sanitizeCSS(rawSettings.globalCss) : undefined,
        };

        // Update site settings
        const site = await db.site.update({
            where: { id: tenantId },
            data: { settings: sanitizedSettings },
        });

        // Invalidate the cache so tenant site sees the new settings immediately
        revalidateTag('site-details');

        return NextResponse.json(site.settings);
    } catch (error) {
        console.error("Error updating site settings:", error);
        return NextResponse.json(
            { error: "Failed to update settings" },
            { status: 500 }
        );
    }
}
