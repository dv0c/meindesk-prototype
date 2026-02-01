import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireSiteAccess } from "@/lib/security/route-auth";
import { logActivity } from "@/lib/actions/activity-log";

// GET - Get a specific category
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string; categoryId: string }> }
) {
    const { siteId, categoryId } = await params;
    const session = await getAuthSession();

    if (!session?.user.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

    const category = await db.category.findFirst({
        where: {
            id: categoryId,
            siteId,
        },
    });

    if (!category) {
        return NextResponse.json(
            { error: "Category not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(category);
}

// PATCH - Update a category
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string; categoryId: string }> }
) {
    const { siteId, categoryId } = await params;
    const session = await getAuthSession();

    if (!session?.user.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

    const category = await db.category.findFirst({
        where: {
            id: categoryId,
            siteId,
        },
    });

    if (!category) {
        return NextResponse.json(
            { error: "Category not found" },
            { status: 404 }
        );
    }

    try {
        const body = await req.json();
        const { name, description, slug, thumbnail, published } = body;

        // If slug is being updated, check for duplicates
        if (slug && slug !== category.slug) {
            const existingCategory = await db.category.findFirst({
                where: {
                    siteId,
                    slug,
                    id: { not: categoryId },
                },
            });

            if (existingCategory) {
                return NextResponse.json(
                    { error: "A category with this slug already exists" },
                    { status: 409 }
                );
            }
        }

        // Update category
        const updatedCategory = await db.category.update({
            where: { id: categoryId },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(slug && { slug }),
                ...(thumbnail !== undefined && { thumbnail }),
                ...(published !== undefined && { published }),
            },
        });

        // Log the activity
        await logActivity({
            siteId,
            action: "UPDATE",
            entity: "category",
            entityId: updatedCategory.id,
            entityName: updatedCategory.name,
        });

        return NextResponse.json(updatedCategory);
    } catch (error: any) {
        console.error("Error updating category:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update category" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a category
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string; categoryId: string }> }
) {
    const { siteId, categoryId } = await params;
    const session = await getAuthSession();

    if (!session?.user.id) {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Verify site access
    await requireSiteAccess(siteId, session.user.id);

    const category = await db.category.findFirst({
        where: {
            id: categoryId,
            siteId,
        },
    });

    if (!category) {
        return NextResponse.json(
            { error: "Category not found" },
            { status: 404 }
        );
    }

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
        return NextResponse.json(
            {
                error:
                    "Cannot delete category that is being used by articles. Please remove the category from all articles first.",
            },
            { status: 409 }
        );
    }

    try {
        await db.category.delete({
            where: { id: categoryId },
        });

        // Log the activity
        await logActivity({
            siteId,
            action: "DELETE",
            entity: "category",
            entityId: categoryId,
            entityName: category.name,
        });

        return NextResponse.json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error: any) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete category" },
            { status: 500 }
        );
    }
}
