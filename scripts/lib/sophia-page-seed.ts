import { readFileSync } from "fs"
import { buildRevalidateRequestUrl } from "../../src/lib/frontend-revalidate-url"
import { SITE_SECTIONS_SLUG } from "../../src/lib/site-collections/schemas"
import { getScriptDb } from "./prisma-script"

export type LegacyExport = {
  siteSections: Array<{
    slug: string
    title: string
    html: string
    heroImage: string | null
  }>
}

export type SectionContent = {
  title: string
  html: string
  heroImage: string | null
}

export const SOPHIA_DESIGN_META = {
  background: "#f5f0e8",
  primary: "#8b5e4a",
  neutral: "#ffffff",
  headingFont: "Cormorant Garamond",
  baseFont: "Josefin Sans",
}

export function firstParagraphText(html: string): string {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  if (!match) return ""
  return match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

export function resolveImageUrl(
  heroImage: string | null,
  fallback: string,
): string {
  const trimmed = heroImage?.trim()
  if (!trimmed) return fallback
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed
  if (trimmed.startsWith("/")) return `https://sophiaplatanisioti.gr${trimmed}`
  return `https://sophiaplatanisioti.gr/${trimmed}`
}

function craftRoot(nodeId: string) {
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
  }
}

export function buildSophiaPageAsideLayout(props: {
  eyebrow: string
  title: string
  lead: string
  imageSrc: string
  imageAlt: string
  htmlContent: string
  showConsultationCta?: boolean
  proseClassName?: string
}) {
  const nodeId = "sophia-page-aside"
  return {
    ...craftRoot(nodeId),
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
        showConsultationCta: props.showConsultationCta ?? false,
        proseClassName: props.proseClassName ?? "",
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

export function buildSophiaHomepageLayout(props: {
  eyebrow: string
  title: string
  lead: string
  thumbnail: string
  htmlContent: string
}) {
  const nodeId = "sophia-homepage"
  return {
    ...craftRoot(nodeId),
    [nodeId]: {
      type: { resolvedName: "SophiaHomepage" },
      isCanvas: false,
      props: {
        eyebrow: props.eyebrow,
        title: props.title,
        lead: props.lead,
        thumbnail: props.thumbnail,
        htmlContent: props.htmlContent,
      },
      displayName: "Sophia Homepage",
      custom: { displayName: "Sophia Homepage" },
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

export async function triggerRevalidate(siteId: string): Promise<void> {
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

  await fetch(buildRevalidateRequestUrl(url, secret), {
    method: "GET",
    signal: controller.signal,
  }).catch((err) => {
    console.warn("[frontend-revalidate] failed:", err)
  })

  clearTimeout(timeout)
}

export async function loadSiteSection(
  siteId: string,
  sectionSlug: string,
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
          slug: sectionSlug,
        },
      },
    })

    if (item?.data && typeof item.data === "object") {
      const data = item.data as Record<string, unknown>
      const html = typeof data.html === "string" ? data.html : ""
      if (html.trim()) {
        return {
          title: typeof data.title === "string" ? data.title : sectionSlug,
          html,
          heroImage:
            typeof data.heroImage === "string" ? data.heroImage : null,
        }
      }
    }
  }

  const raw = readFileSync(exportPath, "utf8")
  const data = JSON.parse(raw) as LegacyExport
  const section = data.siteSections.find((s) => s.slug === sectionSlug)
  if (!section?.html?.trim()) {
    throw new Error(
      `${sectionSlug} content not found in site-sections or legacy-export.json`,
    )
  }

  return {
    title: section.title || sectionSlug,
    html: section.html,
    heroImage: section.heroImage,
  }
}

export async function upsertSophiaPage(
  siteId: string,
  userId: string | null | undefined,
  config: {
    slug: string
    title: string
    excerpt: string
    layout: object
    seo: { title: string; description: string }
  },
): Promise<void> {
  const db = getScriptDb()
  const meta = {
    design: SOPHIA_DESIGN_META,
    seo: config.seo,
  }

  const existing = await db.page.findFirst({
    where: { siteId, slug: config.slug },
  })

  const pageData = {
    title: config.title,
    slug: config.slug,
    status: "PUBLISHED" as const,
    locked: false,
    excerpt: config.excerpt,
    layout: [config.layout] as object[],
    meta,
    siteId,
    userId: userId ?? undefined,
  }

  if (existing) {
    await db.page.update({
      where: { id: existing.id },
      data: pageData,
    })
    console.log(`Updated page ${config.slug} (${existing.id})`)
  } else {
    const created = await db.page.create({ data: pageData })
    console.log(`Created page ${config.slug} (${created.id})`)
  }
}
