import { db } from "@/lib/db"

type SiteSettings = {
  frontend?: {
    revalidateUrl?: string
    revalidateSecret?: string
  }
}

/**
 * Notify an external Next.js frontend to revalidate after CMS publish.
 * Configure in Site.settings.frontend or via FRONTEND_REVALIDATE_URL + FRONTEND_REVALIDATE_SECRET env.
 */
export async function triggerFrontendRevalidate(siteId: string): Promise<void> {
  try {
    const site = await db.site.findUnique({
      where: { id: siteId },
      select: { settings: true },
    })

    const settings = (site?.settings ?? {}) as SiteSettings
    const url =
      settings.frontend?.revalidateUrl?.trim() ||
      process.env.FRONTEND_REVALIDATE_URL?.trim()
    const secret =
      settings.frontend?.revalidateSecret?.trim() ||
      process.env.FRONTEND_REVALIDATE_SECRET?.trim()

    if (!url || !secret) {
      return
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      signal: controller.signal,
    }).catch((err) => {
      console.warn("[frontend-revalidate] failed:", err)
    })

    clearTimeout(timeout)
  } catch (err) {
    console.warn("[frontend-revalidate] error:", err)
  }
}
