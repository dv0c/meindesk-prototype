
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unauthorizedUnlessAdminSession } from "@/lib/security/route-auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ themeId: string }> }
) {
    try {
        const { themeId } = await params;
        const session = await getServerSession(authOptions);
        const denied = unauthorizedUnlessAdminSession(session);
        if (denied) return denied;

        const theme = await db.theme.findUnique({
            where: {
                id: themeId,
            },
            include: {
                blocks: true,
            }
        });

        if (!theme) {
            return new NextResponse("Theme not found", { status: 404 });
        }

        return NextResponse.json(theme);
    } catch (error) {
        console.error("[THEME_Id_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ themeId: string }> }
) {
    try {
        const { themeId } = await params;
        const session = await getServerSession(authOptions);
        const denied = unauthorizedUnlessAdminSession(session);
        if (denied) return denied;

        const body = await req.json();
        const { name, description, price, isPremium, thumbnail, fonts } = body;

        const theme = await db.theme.update({
            where: {
                id: themeId,
            },
            data: {
                name,
                description,
                price,
                isPremium,
                thumbnail,
                fonts: fonts || undefined, // Save fonts if provided
            },
        });

        return NextResponse.json(theme);
    } catch (error) {
        console.error("[THEME_Id_PUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ themeId: string }> }
) {
    try {
        const { themeId } = await params;
        const session = await getServerSession(authOptions);
        const denied = unauthorizedUnlessAdminSession(session);
        if (denied) return denied;

        const theme = await db.theme.delete({
            where: {
                id: themeId,
            },
        });

        return NextResponse.json(theme);
    } catch (error) {
        console.error("[THEME_Id_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
