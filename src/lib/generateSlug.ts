import slugify from "slugify";
import { db } from "./db";

/**
 * Generates a unique slug scoped to a site.
 * @param input - String to generate slug from.
 * @param model - Prisma model: "page" or "article".
 * @param siteId - Optional site ID to scope uniqueness.
 * @returns A unique slug.
 */
export default async function generateSlug(
  input: string,
  model: "page" | "article",
  siteId?: string
): Promise<string> {
  const baseSlug = slugify(input, { lower: true, strict: true, trim: true });

  // Fetch all existing slugs for the site once
  const existingSlugs = siteId
    ? (
        await db[model].findMany({
          where: { siteId },
          select: { slug: true },
        })
      ).map((p: any) => p.slug)
    : [];

  // Generate a unique slug in memory
  let slug = baseSlug;
  let suffix = 1;
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  return slug;
}
