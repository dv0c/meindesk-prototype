
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
    console.log("Starting category repair...");

    // Fetch all articles
    const articles = await db.article.findMany({
        select: {
            id: true,
            categories: true,
            siteId: true,
            title: true, // For logging
        },
    });

    let fixedCount = 0;
    let skippedCount = 0;

    for (const article of articles) {
        const originalCategories = article.categories;
        const newCategories: string[] = [];
        let needsUpdate = false;

        for (const cat of originalCategories) {
            // Check if it's a valid ObjectID (24 hex characters)
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(cat);

            if (isValidObjectId) {
                newCategories.push(cat);
            } else {
                // It's a name, we need to find or create the category
                needsUpdate = true;
                console.log(`Found invalid category ID (name): "${cat}" in article "${article.title}"`);

                // Try to find existing category by name for this site
                // Note: Category model doesn't enforce unique names per site, so we take the first one
                let category = await db.category.findFirst({
                    where: {
                        siteId: article.siteId,
                        name: { equals: cat, mode: "insensitive" }, // Case-insensitive match
                    },
                });

                if (!category) {
                    console.log(`Creating new category "${cat}" for site ${article.siteId}`);
                    // Create new category
                    // We need a slug. Simple slug generation.
                    const slug = cat
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, "")
                        .replace(/[\s_-]+/g, "-")
                        .replace(/^-+|-+$/g, "");

                    try {
                        category = await db.category.create({
                            data: {
                                name: cat,
                                slug: slug || "uncategorized", // Fallback if slug becomes empty
                                description: `Auto-created from RSS import fix`,
                                siteId: article.siteId,
                                published: true,
                            },
                        });
                    } catch (e) {
                        console.error(`Failed to create category ${cat}:`, e);
                        continue; // Skip if creation fails
                    }
                } else {
                    console.log(`Mapped "${cat}" to existing category ID ${category.id}`);
                }

                if (category) {
                    newCategories.push(category.id);
                }
            }
        }

        if (needsUpdate) {
            // Deduplicate IDs
            const uniqueCategories = Array.from(new Set(newCategories));

            await db.article.update({
                where: { id: article.id },
                data: { categories: uniqueCategories },
            });
            fixedCount++;
            process.stdout.write("."); // Progress indicator
        } else {
            skippedCount++;
        }
    }

    console.log(`\nFinished! Fixed ${fixedCount} articles. Skipped ${skippedCount} items.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
