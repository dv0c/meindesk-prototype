import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const themes = await db.theme.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                blocks: true, // Optional: might not need blocks for listing
            }
        });

        return NextResponse.json(themes);
    } catch (error) {
        console.error("[THEMES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
