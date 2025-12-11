
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const themes = await db.theme.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                blocks: true,
            }
        });

        return NextResponse.json(themes);
    } catch (error) {
        console.error("[THEMES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, description, price, isPremium, thumbnail } = body;

        const theme = await db.theme.create({
            data: {
                name,
                description,
                price,
                isPremium,
                thumbnail,
            },
        });

        return NextResponse.json(theme);
    } catch (error) {
        console.error("[THEMES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
