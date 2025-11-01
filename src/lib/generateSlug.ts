import slugify from "slugify";
import { db } from "./db";

/**
 * Generates a unique slug recursively.
 * @param input - The string to generate the slug from (e.g., a post title).
 * @param model - The Prisma model to check for existing slugs (e.g., "post").
 * @param suffix - Optional suffix to append for uniqueness (used internally in recursion).
 * @returns A unique slug.
 */
export default async function generateSlug(
  input: string,
  model: "article" | "page",
  suffix: number = 0
): Promise<string> {
  const baseSlug = slugify(input, {
    lower: true,
    strict: true,
    trim: true,
  });

  const slug = suffix === 0 ? baseSlug : `${baseSlug}-${suffix}`;

  const existingRecord = await db[model].findUnique({
    where: { slug },
  });

  if (!existingRecord) {
    return slug;
  }

  return generateSlug(input, model, suffix + 1);
}
