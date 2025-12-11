
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ComponentDefinition } from "@/lib/types";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ themeId: string }> }
) {
    try {
        const { themeId } = await params;
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { blocks } = body; // Array of ComponentDefinition

        if (!Array.isArray(blocks)) {
            return new NextResponse("Invalid blocks data", { status: 400 });
        }

        // Transaction to update blocks: Delete old ones, insert new ones
        // Or we could try upsert, but replacement is cleaner for "sync" behavior

        await db.$transaction(async (tx) => {
            // 1. Remove existing blocks for this theme
            await tx.themeBlock.deleteMany({
                where: { themeId: themeId }
            });

            // 2. Create new blocks
            if (blocks.length > 0) {
                await tx.themeBlock.createMany({
                    data: blocks.map((block: ComponentDefinition) => ({
                        themeId: themeId,
                        componentName: block.name,
                        componentDefinition: block as any, // casting to specific json type if needed or just any
                    }))
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[THEME_BLOCKS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
