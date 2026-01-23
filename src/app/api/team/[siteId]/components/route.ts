
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth, requireSiteAccess, createErrorResponse } from "@/lib/security/route-auth"

// GET: List all saved components for a site
export async function GET(
    req: Request,
    { params }: { params: { siteId: string } }
) {
    try {
        const session = await requireAuth();
        const { siteId } = await params;

        if (!siteId) {
            return new NextResponse("Missing siteId", { status: 400 });
        }

        // Verify site access
        await requireSiteAccess(siteId, session.user.id);

        const components = await db.snippet.findMany({
            where: {
                siteId: siteId,
                category: "saved-component",
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(components)
    } catch (error) {
        return createErrorResponse(error);
    }
}

// POST: Save a new component
export async function POST(
    req: Request,
    { params }: { params: { siteId: string } }
) {
    try {
        const session = await requireAuth();
        const { siteId } = await params;
        const body = await req.json();
        const { name, content, description } = body;

        if (!content || !name) {
            return new NextResponse("Missing content or name", { status: 400 });
        }

        // Verify site access
        await requireSiteAccess(siteId, session.user.id);

        const component = await db.snippet.create({
            data: {
                siteId: siteId,
                name: name,
                description: description || "AI Generated Component",
                category: "saved-component",
                content: content, // This is the JSON tree
            },
        })

        return NextResponse.json(component)
    } catch (error) {
        return createErrorResponse(error);
    }
}
