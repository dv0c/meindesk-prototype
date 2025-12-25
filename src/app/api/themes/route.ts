import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/themes - List all available themes
export async function GET() {
    try {
        const themes = await db.theme.findMany({
            include: {
                blocks: {
                    select: {
                        id: true,
                        componentName: true,
                        componentDefinition: true,
                    }
                },
                _count: {
                    select: { installedIn: true }
                }
            },
            orderBy: [
                { isPremium: "asc" },
                { name: "asc" }
            ]
        });

        return NextResponse.json(themes);
    } catch (error) {
        console.error("[THEMES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
