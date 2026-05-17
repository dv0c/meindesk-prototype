import { config } from "dotenv"
import { resolve } from "path"
import { sanitizeRichHtml } from "../../src/lib/security/sanitize-html"

config({ path: resolve(__dirname, "../../../sophiaplatanisioti.gr/.env") })

const LEGACY_API_URL = (
  process.env.LEGACY_MEINDESK_API_URL ?? "https://admin.meindesk.gr/api"
).replace(/\/$/, "")
const LEGACY_API_KEY = process.env.LEGACY_MEINDESK_API_KEY

export type LegacyArticleDetail = {
  title: string
  slug: string
  description: string
  html: string
  thumbnail: string | null
  published: boolean
  Category?: { name: string } | null
}

export function requireLegacyApiKey(): string {
  if (!LEGACY_API_KEY) {
    throw new Error(
      "Set LEGACY_MEINDESK_API_KEY (and optionally LEGACY_MEINDESK_API_URL) in env or sophiaplatanisioti.gr/.env",
    )
  }
  return LEGACY_API_KEY
}

export async function fetchLegacyArticleBySlug(
  slug: string,
): Promise<LegacyArticleDetail | null> {
  const apiKey = requireLegacyApiKey()
  const url = new URL(`${LEGACY_API_URL}/articles/${encodeURIComponent(slug)}`)
  url.searchParams.set("api", apiKey)

  const res = await fetch(url.toString())
  if (!res.ok) {
    console.warn(`  legacy fetch failed ${slug}: ${res.status}`)
    return null
  }
  return (await res.json()) as LegacyArticleDetail
}

/** Strip document wrappers and empty noise left from legacy editors. */
export function cleanLegacyArticleHtml(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return ""

  let out = html.trim()
  if (!out) return ""

  // Full-document exports from TipTap / copy-paste
  const bodyMatch = out.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  if (bodyMatch) {
    out = bodyMatch[1]
  } else {
    out = out
      .replace(/<\/?html[^>]*>/gi, "")
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
      .replace(/<\/?body[^>]*>/gi, "")
  }

  out = out
    .replace(/\u00a0/g, " ")
    .replace(/<p>\s*<\/p>/gi, "")
    .replace(/<p><br\s*\/?><\/p>/gi, "")
    .trim()

  return sanitizeRichHtml(out)
}

export function normalizeCategoryName(name: string | null | undefined): string {
  return (name ?? "").trim().toLowerCase()
}
