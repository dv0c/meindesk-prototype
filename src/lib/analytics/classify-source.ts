import type { TrafficSource } from "./types"

export function classifyTrafficSource(
  referrer?: string | null,
  path?: string,
  metadata?: Record<string, unknown> | null
): TrafficSource {
  const utmMedium = String(metadata?.utm_medium ?? "").toLowerCase()
  const utmSource = String(metadata?.utm_source ?? "").toLowerCase()

  if (utmMedium === "email") return "email"
  if (utmMedium === "cpc" || utmMedium === "ppc" || utmMedium === "paid") return "paid"
  if (utmMedium === "social" || ["facebook", "twitter", "instagram", "linkedin", "tiktok"].some((s) => utmSource.includes(s))) {
    return "social"
  }

  if (!referrer) return "direct"

  const ref = referrer.toLowerCase()

  // Internal referrer check skipped on server — path-only heuristic
  if (path && ref.includes(path.replace(/^\//, ""))) {
    return "internal"
  }

  if (
    ref.includes("google.") ||
    ref.includes("bing.") ||
    ref.includes("yahoo.") ||
    ref.includes("duckduckgo.") ||
    ref.includes("yandex.")
  ) {
    return "organic"
  }

  if (
    ref.includes("facebook.") ||
    ref.includes("instagram.") ||
    ref.includes("twitter.") ||
    ref.includes("x.com") ||
    ref.includes("linkedin.") ||
    ref.includes("t.co")
  ) {
    return "social"
  }

  if (ref.includes("mail.") || ref.includes("outlook.") || ref.includes("gmail.")) {
    return "email"
  }

  return "referral"
}

/** Human-readable label for dashboard charts */
export function sourceLabel(source: TrafficSource): string {
  const labels: Record<TrafficSource, string> = {
    direct: "Direct",
    organic: "Organic Search",
    paid: "Paid Search",
    social: "Social",
    referral: "Referral",
    email: "Email",
    internal: "Internal",
  }
  return labels[source] ?? source
}
