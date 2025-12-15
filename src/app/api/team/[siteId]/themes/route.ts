import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ siteId: string }> }
) {
    try {
        const { siteId } = await params;
        const session = await getServerSession(authOptions);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch installed themes for this site with their font configurations
        const installedThemes = await db.siteTheme.findMany({
            where: { siteId: siteId },
            include: {
                theme: {
                    select: {
                        id: true,
                        name: true,
                        fonts: true, // Include the fonts JSON field
                    }
                },
            },
        });

        // Return just the themes with their fonts
        const themes = installedThemes.map(st => ({
            id: st.theme.id,
            name: st.theme.name,
            fonts: st.theme.fonts || [],
        }));

        return NextResponse.json(themes);
    } catch (error) {
        console.error("[TEAM_THEMES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
