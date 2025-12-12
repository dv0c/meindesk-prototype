import slugify from "slugify";
import { db } from "./db";

/**
 * Generates a unique slug scoped to a site.
 * @param input - String to generate slug from.
 * @param model - Prisma model: "page" or "article".
 * @param siteId - Optional site ID to scope uniqueness.
 * @param existingSlugs - Optional pre-fetched array of existing slugs (performance optimization).
 * @returns A unique slug.
 */
export default async function generateSlug(
  input: string,
  model: "page" | "article",
  siteId?: string,
  existingSlugs?: string[]
): Promise<string> {
  const baseSlug = slugify(input, { lower: true, strict: true, trim: true });

  // Use provided slugs or fetch from DB
  let slugList: string[];
  if (existingSlugs !== undefined) {
    slugList = existingSlugs;
  } else if (siteId) {
    if (model === "article") {
      slugList = (
        await db.article.findMany({
          where: { siteId },
          select: { slug: true },
        })
      ).map((p) => p.slug);
    } else {
      slugList = (
        await db.page.findMany({
          where: { siteId },
          select: { slug: true },
        })
      ).map((p) => p.slug);
    }
  } else {
    slugList = [];
  }

  // Generate a unique slug in memory
  let slug = baseSlug;
  let suffix = 1;
  while (slugList.includes(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  return slug;
}
