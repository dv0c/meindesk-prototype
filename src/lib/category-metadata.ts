import { z } from "zod"

export const NAV_PLACEMENTS = ["header", "hidden", "none"] as const
export type NavPlacement = (typeof NAV_PLACEMENTS)[number]

export const categoryMetadataSchema = z.object({
  navPlacement: z.enum(NAV_PLACEMENTS).optional(),
  navOrder: z.number().int().optional(),
})

export type CategoryMetadata = z.infer<typeof categoryMetadataSchema>

export function parseCategoryMetadata(metadata: unknown): CategoryMetadata {
  const result = categoryMetadataSchema.safeParse(metadata ?? {})
  return result.success ? result.data : {}
}

export function mergeCategoryMetadata(
  existing: unknown,
  patch: { navPlacement?: NavPlacement; navOrder?: number },
): CategoryMetadata {
  const current = parseCategoryMetadata(existing)
  return {
    ...current,
    ...(patch.navPlacement !== undefined ? { navPlacement: patch.navPlacement } : {}),
    ...(patch.navOrder !== undefined ? { navOrder: patch.navOrder } : {}),
  }
}

/** Map legacy admin.meindesk position to v1 metadata */
export function legacyPositionToNavPlacement(
  position?: string | null,
): NavPlacement {
  if (position === "HEADER") return "header"
  if (position === "HIDDEN") return "hidden"
  return "none"
}
