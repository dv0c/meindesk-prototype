import { db } from "@/lib/db";
import { NextResponse } from "next/server";

const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

export async function POST(
    req: Request,
    props: { params: Promise<{ siteId: string }> } // Use Promise for params
) {
    const params = await props.params;
    try {
        const { siteId } = params;

        if (!siteId || !isValidObjectId(siteId)) {
            return new NextResponse("Invalid or missing siteId", { status: 400 });
        }

        const body = await req.json();
        const { themeId } = body;

        if (!themeId || !isValidObjectId(themeId)) {
            return new NextResponse("Invalid or missing themeId", { status: 400 });
        }

        // Check if theme exists
        const theme = await db.theme.findUnique({
            where: { id: themeId },
        });

        if (!theme) {
            return new NextResponse("Theme not found", { status: 404 });
        }

        // Upsert to avoid duplicates or error
        const siteTheme = await db.siteTheme.create({
            data: {
                siteId,
                themeId,
            },
        });

        return NextResponse.json(siteTheme);
    } catch (error) {
        console.error("[THEME_INSTALL]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function GET(
    req: Request,
    props: { params: Promise<{ siteId: string }> }
) {
    const params = await props.params;
    try {
        const { siteId } = params;

        if (!siteId || !isValidObjectId(siteId)) {
            return new NextResponse("Invalid or missing siteId", { status: 400 });
        }

        const installed = await db.siteTheme.findMany({
            where: { siteId },
            select: { themeId: true },
        });

        return NextResponse.json(installed);
    } catch (error) {
        console.error("[THEME_GET_INSTALLED]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ siteId: string }> }
) {
    const params = await props.params;
    try {
        const { siteId } = params;
        const { searchParams } = new URL(req.url);
        const themeId = searchParams.get("themeId");

        if (!siteId || !isValidObjectId(siteId)) {
            return new NextResponse("Invalid or missing siteId", { status: 400 });
        }

        if (!themeId || !isValidObjectId(themeId)) {
            return new NextResponse("Invalid or missing themeId", { status: 400 });
        }

        await db.siteTheme.deleteMany({
            where: {
                siteId,
                themeId,
            },
        });

        return NextResponse.json({ message: "Theme uninstalled" }, { status: 200 });
    } catch (error) {
        console.error("[THEME_UNINSTALL]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
