
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/security/route-auth";

export const runtime = "nodejs";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ siteId: string }> }
) {
    try {
        const session = await getAuthSession();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { siteId } = await params;

        // Verify site access
        const site = await db.site.findUnique({
            where: { id: siteId },
            select: {
                userId: true,
                members: {
                    select: {
                        id: true
                    }
                }
            }
        });

        if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

        const isOwner = site.userId === session.user.id;
        const isMember = site.members.some(m => m.id === session.user.id);

        if (!isOwner && !isMember) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        // Fetch members
        // We want the members list properly. The relation 'members' on Site returns User[].
        const siteWithMembers = await db.site.findUnique({
            where: { id: siteId },
            select: {
                user: { // Owner
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        email: true,
                    }
                },
                members: { // Members
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        email: true,
                    }
                }
            }
        });

        // Combine owner and members into a list
        const allMembers = [
            ...(siteWithMembers?.user ? [siteWithMembers.user] : []),
            ...(siteWithMembers?.members || [])
        ];

        // Deduplicate just in case
        const uniqueMembers = Array.from(new Map(allMembers.map(m => [m.id, m])).values());

        return NextResponse.json(uniqueMembers);

    } catch (error) {
        return createErrorResponse(error);
    }
}
