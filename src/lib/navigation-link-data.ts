import { z } from "zod"

export const HEADER_POSITIONS = ["start", "end"] as const
export type HeaderPosition = (typeof HEADER_POSITIONS)[number]

export const NAV_LINK_PLACEMENTS = ["header", "mobile", "footer"] as const
export type NavLinkPlacement = (typeof NAV_LINK_PLACEMENTS)[number]

export const navigationLinkDataSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  placement: z.enum(NAV_LINK_PLACEMENTS).default("header"),
  order: z.number().int().default(0),
  headerPosition: z.enum(HEADER_POSITIONS).default("start"),
  visible: z.boolean().default(true),
  openInNewTab: z.boolean().default(false),
})

export type NavigationLinkData = z.infer<typeof navigationLinkDataSchema>

export function parseNavigationLinkData(data: unknown): NavigationLinkData {
  const parsed = navigationLinkDataSchema.safeParse(data ?? {})
  if (parsed.success) return parsed.data
  return navigationLinkDataSchema.parse({})
}

export function hrefToItemSlug(href: string): string {
  const base = href.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")
  return base || "nav-link"
}
