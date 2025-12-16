import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET - List all categories for a site
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string }> }
) {
    const { siteId } = await params;
    const session = await getAuthSession();

    if (!session?.user.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Verify site ownership
    const site = await db.site.findFirst({
        where: { id: siteId, userId: session.user.id },
    });

    if (!site) {
        return NextResponse.json(
            { error: "Site not found or not yours" },
            { status: 404 }
        );
    }

    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get("published") === "true";
    const search = searchParams.get("search");

    // Build query
    const where: any = { siteId };

    if (publishedOnly) {
        where.published = true;
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }

    const categories = await db.category.findMany({
        where,
        orderBy: { name: "asc" },
        select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            thumbnail: true,
            published: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return NextResponse.json(categories);
}

// POST - Create a new category
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string }> }
) {
    const { siteId } = await params;
    const session = await getAuthSession();

    if (!session?.user.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Verify site ownership
    const site = await db.site.findFirst({
        where: { id: siteId, userId: session.user.id },
    });

    if (!site) {
        return NextResponse.json(
            { error: "Site not found or not yours" },
            { status: 404 }
        );
    }

    try {
        const body = await req.json();
        const { name, description, slug, thumbnail, published } = body;

        if (!name || !slug) {
            return NextResponse.json(
                { error: "Name and slug are required" },
                { status: 400 }
            );
        }

        // Check if slug already exists
        const existingCategory = await db.category.findFirst({
            where: { siteId, slug },
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: "A category with this slug already exists" },
                { status: 409 }
            );
        }

        // Create category
        const category = await db.category.create({
            data: {
                name,
                description: description || "",
                slug,
                thumbnail,
                published: published ?? true,
                siteId,
                userId: session.user.id,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create category" },
            { status: 500 }
        );
    }
}
