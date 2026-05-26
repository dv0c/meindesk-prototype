import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import {
  requireAuth,
  requireSiteAccess,
  createErrorResponse,
} from "@/lib/security/route-auth"
import type { SiteSettingsJson } from "@/lib/site-frontend-settings"

/**
 * POST /api/team/:siteId/webhooks/test
 * Fires a test revalidation request and returns success/failure.
 */
export async function POST(
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
    const url = settings.frontend?.revalidateUrl?.trim()
    const secret = settings.frontend?.revalidateSecret?.trim()

    if (!url || !secret) {
      return NextResponse.json(
        {
          success: false,
          error: "Webhook not configured. Save a URL and secret first.",
        },
        { status: 400 }
      )
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${secret}` },
        signal: controller.signal,
      })

      clearTimeout(timeout)

      const body = await response.json().catch(() => null)

      if (response.ok) {
        return NextResponse.json({
          success: true,
          status: response.status,
          body,
        })
      }

      return NextResponse.json({
        success: false,
        status: response.status,
        error: body?.message || body?.error || `HTTP ${response.status}`,
      })
    } catch (fetchErr: any) {
      clearTimeout(timeout)

      if (fetchErr.name === "AbortError") {
        return NextResponse.json({
          success: false,
          error: "Request timed out after 10 seconds",
        })
      }

      return NextResponse.json({
        success: false,
        error: fetchErr.message || "Failed to reach the webhook URL",
      })
    }
  } catch (err) {
    return createErrorResponse(err)
  }
}
