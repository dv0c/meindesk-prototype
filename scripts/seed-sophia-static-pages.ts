/**
 * Upsert Sophia static pages (home, biography, contact, ypiresies) with Craft layouts.
 *
 * Usage:
 *   npx tsx scripts/seed-sophia-static-pages.ts <siteId> [legacy-export.json]
 */
import "./lib/bootstrap"
import { resolve } from "path"
import {
  buildSophiaHomepageLayout,
  buildSophiaPageAsideLayout,
  firstParagraphText,
  loadSiteSection,
  resolveImageUrl,
  triggerRevalidate,
  upsertSophiaPage,
} from "./lib/sophia-page-seed"
import { disconnectScriptDb, getScriptDb } from "./lib/prisma-script"

const OG_DESCRIPTION =
  "Είμαι στη διάθεσή σας για ένα δωρεάν ατομικό διαδικτυακό ραντεβού, να γνωριστούμε και να απαντήσω σε πιθανές απορίες σας"

const PAGE_DEFAULTS = {
  home: {
    sectionSlug: "homepage",
    eyebrow: "Καλώς ήρθατε",
    title: "Σοφία Πλατανησιώτη",
    lead: "Σύμβουλος Ψυχικής Υγείας — υποστήριξη με σεβασμό, κατανόηση και επαγγελματική φροντίδα.",
    imageFallback: "https://sophiaplatanisioti.gr/sophia-1.webp",
    seoTitle: "Σοφία Πλατανησιώτη - Σύμβουλος Ψυχικής Υγείας",
  },
  biography: {
    sectionSlug: "biography",
    eyebrow: "Σχετικά",
    title: "Βιογραφικό",
    lead: "",
    imageFallback: "https://sophiaplatanisioti.gr/studies.webp",
    seoTitle: "Βιογραφικό | Σοφία Πλατανησιώτη - Σύμβουλος Ψυχικής Υγείας",
    showConsultationCta: true,
    proseClassName: "ypyresies",
  },
  contact: {
    sectionSlug: "contact",
    eyebrow: "Επικοινωνήστε μαζί μου",
    title: "Επικοινωνία",
    lead: "",
    imageFallback: "https://sophiaplatanisioti.gr/image00007.webp",
    seoTitle: "Επικοινωνία | Σοφία Πλατανησιώτη - Σύμβουλος Ψυχικής Υγείας",
    showConsultationCta: true,
    proseClassName: "",
  },
  ypiresies: {
    sectionSlug: "ypiresies",
    eyebrow: "Τι προσφέρω",
    title: "Υπηρεσίες",
    lead: "",
    imageFallback: "https://sophiaplatanisioti.gr/SIMA_1-02%20.webp",
    seoTitle: "Υπηρεσίες | Σοφία Πλατανησιώτη - Σύμβουλος Ψυχικής Υγείας",
    showConsultationCta: false,
    proseClassName: "ypyresies",
  },
} as const

async function main() {
  const siteId = process.argv[2]
  const exportPath =
    process.argv[3] ??
    resolve(__dirname, "../../sophiaplatanisioti.gr/legacy-export.json")

  if (!siteId) {
    console.error(
      "Usage: npx tsx scripts/seed-sophia-static-pages.ts <siteId> [legacy-export.json]",
    )
    process.exit(1)
  }

  const db = getScriptDb()
  const site = await db.site.findUnique({ where: { id: siteId } })
  if (!site) {
    throw new Error(`Site not found: ${siteId}`)
  }

  const homeContent = await loadSiteSection(
    siteId,
    PAGE_DEFAULTS.home.sectionSlug,
    exportPath,
  )
  const homeThumbnail = resolveImageUrl(
    homeContent.heroImage,
    PAGE_DEFAULTS.home.imageFallback,
  )
  await upsertSophiaPage(siteId, site.userId, {
    slug: "home",
    title: "Home",
    excerpt: firstParagraphText(homeContent.html),
    layout: buildSophiaHomepageLayout({
      eyebrow: PAGE_DEFAULTS.home.eyebrow,
      title: PAGE_DEFAULTS.home.title,
      lead: PAGE_DEFAULTS.home.lead,
      thumbnail: homeThumbnail,
      htmlContent: homeContent.html,
    }),
    seo: {
      title: PAGE_DEFAULTS.home.seoTitle,
      description: OG_DESCRIPTION,
    },
  })

  for (const key of ["biography", "contact", "ypiresies"] as const) {
    const defaults = PAGE_DEFAULTS[key]
    const content = await loadSiteSection(siteId, defaults.sectionSlug, exportPath)
    const imageSrc = resolveImageUrl(content.heroImage, defaults.imageFallback)

    await upsertSophiaPage(siteId, site.userId, {
      slug: key,
      title: defaults.title,
      excerpt: firstParagraphText(content.html),
      layout: buildSophiaPageAsideLayout({
        eyebrow: defaults.eyebrow,
        title: content.title || defaults.title,
        lead: defaults.lead,
        imageSrc,
        imageAlt: content.title || defaults.title,
        htmlContent: content.html,
        showConsultationCta: defaults.showConsultationCta,
        proseClassName: defaults.proseClassName,
      }),
      seo: {
        title: defaults.seoTitle,
        description: OG_DESCRIPTION,
      },
    })
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
