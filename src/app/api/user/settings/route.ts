
import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { developerMode } = body

        if (typeof developerMode !== "boolean") {
            return new NextResponse("Invalid data", { status: 400 })
        }

        const user = await db.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                developerMode,
            },
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error("[USER_SETTINGS_UPDATE]", error)
        return new NextResponse("Internal config Error", { status: 500 })
    }
}
