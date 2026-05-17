"use server"

import { db } from "@/lib/db"
import { getAuthSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import {
  getPublicSiteUrlForVerification,
  hasAnalyticsTrackerInHtml,
  parseSiteSettings,
} from "@/lib/site-frontend-settings"

export async function verifyAnalyticsInstallation(siteId: string) {
  const session = await getAuthSession()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const site = await db.site.findUnique({
      where: { id: siteId },
      include: { features: true },
    })

    if (!site) return { error: "Site not found" }
    if (!site.features) return { error: "Features not found" }

    const verifyUrl = getPublicSiteUrlForVerification(site)
    console.log("Verifying analytics for:", verifyUrl, "(site.url:", site.url, ")")

    const response = await fetch(verifyUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Meindesk-Bot/1.0",
      },
    })

    if (!response.ok) {
      return {
        error: `Failed to access ${verifyUrl}: ${response.status} ${response.statusText}`,
      }
    }

    const html = await response.text()

    if (hasAnalyticsTrackerInHtml(html)) {
      const currentSettings = parseSiteSettings(site.settings)

      await db.site.update({
        where: { id: siteId },
        data: {
          settings: {
            ...currentSettings,
            analyticsConnected: true,
          },
        },
      })

      revalidatePath(`/dashboard/${siteId}/projects/website/analytics`)
      return { success: true, verifiedUrl: verifyUrl }
    }

    return {
      error: `Tracking script not found on ${verifyUrl}. Add tracker.js to the <head> of your public site (not the Meindesk preview URL).`,
    }
  } catch (error: unknown) {
    console.error("Verification failed:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return { error: `Verification failed: ${message}` }
  }
}
