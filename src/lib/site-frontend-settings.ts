export type SiteFrontendSettings = {
  publicUrl?: string
  revalidateUrl?: string
  revalidateSecret?: string
}

export type SiteSettingsJson = {
  frontend?: SiteFrontendSettings
  analyticsConnected?: boolean
}

export function parseSiteSettings(settings: unknown): SiteSettingsJson {
  if (!settings || typeof settings !== "object") return {}
  return settings as SiteSettingsJson
}

/** URL to fetch when verifying headless analytics (production site, not Meindesk preview). */
export function getPublicSiteUrlForVerification(site: {
  url: string
  settings: unknown
}): string {
  const settings = parseSiteSettings(site.settings)
  const fromPublic = settings.frontend?.publicUrl?.trim()
  if (fromPublic) {
    return fromPublic.replace(/\/$/, "")
  }
  const revalidate = settings.frontend?.revalidateUrl?.trim()
  if (revalidate) {
    try {
      return new URL(revalidate).origin
    } catch {
      /* fall through */
    }
  }
  return site.url.replace(/\/$/, "")
}

export function hasAnalyticsTrackerInHtml(html: string): boolean {
  return (
    html.includes("tracker.js") ||
    html.includes("meindesk-analytics.js") ||
    html.includes("meindesk-analytics-tracker") ||
    html.includes("__MEINDESK_ANALYTICS__") ||
    html.includes("data-site-id")
  )
}
