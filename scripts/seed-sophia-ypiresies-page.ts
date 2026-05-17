/**
 * Upsert the ypiresies Page with a SophiaPageAside Craft layout.
 *
 * Usage:
 *   npx tsx scripts/seed-sophia-ypiresies-page.ts <siteId> [legacy-export.json]
 */
import "./lib/bootstrap"
import { readFileSync } from "fs"
import { resolve } from "path"
import { SITE_SECTIONS_SLUG } from "../src/lib/site-collections/schemas"
import { disconnectScriptDb, getScriptDb } from "./lib/prisma-script"

const DEFAULT_IMAGE =
  "https://sophiaplatanisioti.gr/SIMA_1-02%20.webp"
const EYEBROW = "Τι προσφέρω"
const PAGE_TITLE = "Υπηρεσίες"

type LegacyExport = {
  siteSections: Array<{
    slug: string
    title: string
    html: string
    heroImage: string | null
  }>
}

type SectionContent = {
  title: string
  html: string
  heroImage: string | null
}

function firstParagraphText(html: string): string {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  if (!match) return ""
  return match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function resolveImageUrl(heroImage: string | null): string {
  const trimmed = heroImage?.trim()
  if (!trimmed) return DEFAULT_IMAGE
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed
  if (trimmed.startsWith("/")) return `https://sophiaplatanisioti.gr${trimmed}`
  return `https://sophiaplatanisioti.gr/${trimmed}`
}

function buildSophiaPageAsideLayout(props: {
  eyebrow: string
  title: string
  lead: string
  imageSrc: string
  imageAlt: string
  htmlContent: string
}) {
  const nodeId = "sophia-page-aside"
  return {
    ROOT: {
      type: { resolvedName: "Container" },
      isCanvas: true,
      props: {
        flexDirection: "column",
        width: "100%",
        padding: ["0", "0", "0", "0"],
        background: "transparent",
      },
      displayName: "App",
      custom: { displayName: "App" },
      hidden: false,
      nodes: [nodeId],
      linkedNodes: {},
    },
    [nodeId]: {
      type: { resolvedName: "SophiaPageAside" },
      isCanvas: false,
      props: {
        eyebrow: props.eyebrow,
        title: props.title,
        lead: props.lead,
        imageSrc: props.imageSrc,
        imageAlt: props.imageAlt,
        htmlContent: props.htmlContent,
      },
      displayName: "Sophia Page Aside",
      custom: { displayName: "Sophia Page Aside" },
      parent: "ROOT",
      hidden: false,
      nodes: [],
      linkedNodes: {},
    },
  }
}

type SiteSettings = {
  frontend?: {
    revalidateUrl?: string
    revalidateSecret?: string
  }
}

async function triggerRevalidate(siteId: string): Promise<void> {
  const db = getScriptDb()
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
    console.warn("Skipped frontend revalidate (no URL/secret configured)")
    return
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${secret}` },
    signal: controller.signal,
  }).catch((err) => {
    console.warn("[frontend-revalidate] failed:", err)
  })

  clearTimeout(timeout)
}

async function loadYpiresiesContent(
  siteId: string,
  exportPath: string,
): Promise<SectionContent> {
  const db = getScriptDb()

  const collection = await db.collection.findFirst({
    where: { siteId, slug: SITE_SECTIONS_SLUG },
  })

  if (collection) {
    const item = await db.collectionItem.findUnique({
      where: {
        collectionId_slug: {
          collectionId: collection.id,
          slug: "ypiresies",
        },
      },
    })

    if (item?.data && typeof item.data === "object") {
      const data = item.data as Record<string, unknown>
      const html = typeof data.html === "string" ? data.html : ""
      if (html.trim()) {
        return {
          title: typeof data.title === "string" ? data.title : PAGE_TITLE,
          html,
          heroImage:
            typeof data.heroImage === "string" ? data.heroImage : null,
        }
      }
    }
  }

  const raw = readFileSync(exportPath, "utf8")
  const data = JSON.parse(raw) as LegacyExport
  const section = data.siteSections.find((s) => s.slug === "ypiresies")
  if (!section?.html?.trim()) {
    throw new Error("ypiresies content not found in site-sections or legacy-export.json")
  }

  return {
    title: section.title || PAGE_TITLE,
    html: section.html,
    heroImage: section.heroImage,
  }
}

async function main() {
  const siteId = process.argv[2]
  const exportPath =
    process.argv[3] ??
    resolve(__dirname, "../../sophiaplatanisioti.gr/legacy-export.json")

  if (!siteId) {
    console.error(
      "Usage: npx tsx scripts/seed-sophia-ypiresies-page.ts <siteId> [legacy-export.json]",
    )
    process.exit(1)
  }

  const db = getScriptDb()
  const site = await db.site.findUnique({ where: { id: siteId } })
  if (!site) {
    throw new Error(`Site not found: ${siteId}`)
  }

  const content = await loadYpiresiesContent(siteId, exportPath)
  const imageSrc = resolveImageUrl(content.heroImage)
  const excerpt = firstParagraphText(content.html)
  const layout = buildSophiaPageAsideLayout({
    eyebrow: EYEBROW,
    title: content.title || PAGE_TITLE,
    lead: "",
    imageSrc,
    imageAlt: content.title || PAGE_TITLE,
    htmlContent: content.html,
  })

  const meta = {
    design: {
      background: "#f5f0e8",
      primary: "#8b5e4a",
      neutral: "#ffffff",
      headingFont: "Cormorant Garamond",
      baseFont: "Josefin Sans",
    },
    seo: {
      title: "Υπηρεσίες | Σοφία Πλατανησιώτη - Σύμβουλος Ψυχικής Υγείας",
      description:
        "Είμαι στη διάθεσή σας για ένα δωρεάν ατομικό διαδικτυακό ραντεβού, να γνωριστούμε και να απαντήσω σε πιθανές απορίες σας",
    },
  }

  const existing = await db.page.findFirst({
    where: { siteId, slug: "ypiresies" },
  })

  const pageData = {
    title: PAGE_TITLE,
    slug: "ypiresies",
    status: "PUBLISHED" as const,
    locked: false,
    excerpt,
    layout: [layout] as object[],
    meta,
    siteId,
    userId: site.userId ?? undefined,
  }

  if (existing) {
    await db.page.update({
      where: { id: existing.id },
      data: pageData,
    })
    console.log(`Updated page ypiresies (${existing.id})`)
  } else {
    const created = await db.page.create({ data: pageData })
    console.log(`Created page ypiresies (${created.id})`)
  }

  await triggerRevalidate(siteId)
  console.log("Triggered frontend revalidate")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => disconnectScriptDb())
