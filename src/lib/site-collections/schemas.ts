/** Collection slugs used by headless frontends (e.g. sophiaplatanisioti.gr) */

export const SITE_SECTIONS_SLUG = "site-sections"
export const NAVIGATION_LINKS_SLUG = "navigation-links"

export type CollectionFieldDef = {
  name: string
  type: "text" | "richtext" | "number" | "image" | "boolean" | "date" | "select"
  label: string
  required?: boolean
  options?: string[]
}

export const SITE_SECTIONS_FIELDS: CollectionFieldDef[] = [
  { name: "slug", type: "text", label: "Slug", required: true },
  { name: "title", type: "text", label: "Title", required: true },
  { name: "html", type: "richtext", label: "HTML body", required: true },
  { name: "heroImage", type: "image", label: "Hero image" },
  { name: "seoTitle", type: "text", label: "SEO title" },
  { name: "seoDescription", type: "text", label: "SEO description" },
  { name: "published", type: "boolean", label: "Published", required: true },
]

export const NAVIGATION_LINKS_FIELDS: CollectionFieldDef[] = [
  { name: "label", type: "text", label: "Label", required: true },
  { name: "href", type: "text", label: "Link (path or URL)", required: true },
  {
    name: "placement",
    type: "select",
    label: "Placement",
    required: true,
    options: ["header", "mobile", "footer"],
  },
  { name: "order", type: "number", label: "Sort order", required: true },
  { name: "visible", type: "boolean", label: "Visible", required: true },
  { name: "openInNewTab", type: "boolean", label: "Open in new tab" },
]

export const SITE_SECTIONS_SEED = [
  { slug: "homepage", title: "Αρχική", published: true },
  { slug: "biography", title: "Βιογραφικό", published: true },
  { slug: "contact", title: "Επικοινωνία", published: true },
  { slug: "ypiresies", title: "Υπηρεσίες", published: true },
] as const

export const NAVIGATION_LINKS_SEED = [
  { label: "ΑΡΧΙΚΗ", href: "/", placement: "header", order: 0, visible: true },
  { label: "ΥΠΗΡΕΣΙΕΣ", href: "/ypiresies", placement: "header", order: 1, visible: true },
  { label: "ΕΠΙΚΟΙΝΩΝΙΑ", href: "/contact", placement: "header", order: 2, visible: true },
  { label: "ΒΙΟΓΡΑΦΙΚΟ", href: "/biography", placement: "header", order: 3, visible: true },
] as const
