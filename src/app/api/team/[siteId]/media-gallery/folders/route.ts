import { getAuthSession } from "@/lib/auth"
import {
  assertSiteFolderPath,
  buildFolderTree,
  createFolder,
  deleteEmptyFolder,
  renameFolder,
} from "@/lib/media-folders"
import { createErrorResponse, requireSiteAccess } from "@/lib/security/route-auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    if (!siteId || !/^[0-9a-fA-F]{24}$/.test(siteId)) {
      return NextResponse.json({ error: "Invalid Site ID provided." }, { status: 400 })
    }

    await requireSiteAccess(siteId, session.user.id)
    const folders = await buildFolderTree(siteId)
    return NextResponse.json({ folders, root: siteId })
  } catch (error) {
    return createErrorResponse(error)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await requireSiteAccess(siteId, session.user.id)
    const body = await req.json().catch(() => ({}))
    const path = typeof body.path === "string" ? body.path : ""
    if (!path) {
      return NextResponse.json({ error: "path is required" }, { status: 400 })
    }

    const created = await createFolder(siteId, path)
    return NextResponse.json({ path: created }, { status: 201 })
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Failed to create folder"
    if (
      message.includes("Folder names") ||
      message.includes("Folder path") ||
      message.includes("Invalid") ||
      message.includes("Cannot create")
    ) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    return createErrorResponse(error)
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await requireSiteAccess(siteId, session.user.id)
    const body = await req.json().catch(() => ({}))
    const from = typeof body.from === "string" ? body.from : ""
    const to = typeof body.to === "string" ? body.to : ""
    if (!from || !to) {
      return NextResponse.json({ error: "from and to are required" }, { status: 400 })
    }

    const renamed = await renameFolder(siteId, from, to)
    return NextResponse.json({ path: renamed })
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Failed to rename folder"
    if (
      message.includes("Folder") ||
      message.includes("Invalid") ||
      message.includes("Cannot")
    ) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    return createErrorResponse(error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> },
) {
  const { siteId } = await params
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await requireSiteAccess(siteId, session.user.id)
    const path = new URL(req.url).searchParams.get("path")
    if (!path) {
      return NextResponse.json({ error: "path is required" }, { status: 400 })
    }

    assertSiteFolderPath(siteId, path)
    await deleteEmptyFolder(siteId, path)
    return NextResponse.json({ message: "Folder deleted" })
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Failed to delete folder"
    if (message.includes("not empty") || message.includes("Cannot delete") || message.includes("Invalid") || message.includes("Folder")) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    return createErrorResponse(error)
  }
}
