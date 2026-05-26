import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import {
  requireAuth,
  requireSiteAccess,
  createErrorResponse,
} from "@/lib/security/route-auth"
import type { SiteSettingsJson } from "@/lib/site-frontend-settings"

/**
 * GET /api/team/:siteId/webhooks
 * Returns the current frontend webhook settings for the site.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAuth()
    const { siteId } = await params
    await requireSiteAccess(siteId, session.user.id)

    const site = await db.site.findUnique({
      where: { id: siteId },
      select: { settings: true },
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    const settings = (site.settings ?? {}) as SiteSettingsJson
    const frontend = settings.frontend ?? {}

    return NextResponse.json({
      revalidateUrl: frontend.revalidateUrl ?? "",
      revalidateSecret: frontend.revalidateSecret ? "••••••••" : "",
      hasSecret: !!frontend.revalidateSecret,
      configured: !!(frontend.revalidateUrl && frontend.revalidateSecret),
    })
  } catch (err) {
    return createErrorResponse(err)
  }
}

/**
 * PUT /api/team/:siteId/webhooks
 * Saves revalidateUrl and revalidateSecret to Site.settings.frontend.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAuth()
    const { siteId } = await params
    await requireSiteAccess(siteId, session.user.id)

    const body = await req.json()
    const { revalidateUrl, revalidateSecret } = body as {
      revalidateUrl?: string
      revalidateSecret?: string
    }

    if (revalidateUrl) {
      try {
        const parsed = new URL(revalidateUrl)
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return NextResponse.json(
            { error: "URL must use http or https protocol" },
            { status: 400 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        )
      }
    }

    const site = await db.site.findUnique({
      where: { id: siteId },
      select: { settings: true },
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    const existingSettings = (site.settings ?? {}) as SiteSettingsJson
    const existingFrontend = existingSettings.frontend ?? {}

    const updatedFrontend = {
      ...existingFrontend,
      revalidateUrl: revalidateUrl?.trim() || existingFrontend.revalidateUrl,
      revalidateSecret:
        revalidateSecret?.trim() || existingFrontend.revalidateSecret,
    }

    await db.site.update({
      where: { id: siteId },
      data: {
        settings: {
          ...existingSettings,
          frontend: updatedFrontend,
        } as any,
      },
    })

    return NextResponse.json({
      message: "Webhook settings saved",
      configured: !!(updatedFrontend.revalidateUrl && updatedFrontend.revalidateSecret),
    })
  } catch (err) {
    return createErrorResponse(err)
  }
}

/**
 * DELETE /api/team/:siteId/webhooks
 * Clears the frontend webhook settings.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await requireAuth()
    const { siteId } = await params
    await requireSiteAccess(siteId, session.user.id)

    const site = await db.site.findUnique({
      where: { id: siteId },
      select: { settings: true },
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    const existingSettings = (site.settings ?? {}) as SiteSettingsJson
    const { frontend: _, ...restSettings } = existingSettings

    await db.site.update({
      where: { id: siteId },
      data: {
        settings: restSettings as any,
      },
    })

    return NextResponse.json({ message: "Webhook settings removed" })
  } catch (err) {
    return createErrorResponse(err)
  }
}
