
// import { db } from "../src/lib/db"
import { PrismaClient } from "../src/generated/client"
const db = new PrismaClient()

async function main() {
    console.log("Starting verification...");

    // 1. Get a random site
    const site = await db.site.findFirst();
    if (!site) {
        console.error("No site found in DB.");
        return;
    }
    console.log(`Found site: ${site.id} (${site.subdomain})`);

    // 2. Fetch articles for this site (Simulating the route logic)
    console.log("Fetching articles...");
    const articles = await db.article.findMany({
        where: { siteId: site.id },
        select: {
            id: true,
            title: true,
            categories: true, // This returns string[]
        },
        take: 5
    });

    console.log(`Found ${articles.length} articles.`);

    if (articles.length === 0) {
        // Create a dummy article and category if needed? 
        // For now just report.
        console.log("No articles to test with.");
        return;
    }

    // 3. Perform the mapping logic I added
    const allCategoryIds = Array.from(new Set(articles.flatMap((a) => a.categories)))
    console.log(`Found ${allCategoryIds.length} unique category IDs:`, allCategoryIds);

    const categoriesList = await db.category.findMany({
        where: {
            id: { in: allCategoryIds as string[] },
        },
        select: {
            id: true,
            name: true,
            slug: true,
        },
    })

    const categoryMap = new Map(categoriesList.map((c) => [c.id, c]))

    const enrichedArticles = articles.map((article) => {
        // @ts-ignore
        const fullCategories = article.categories
            // @ts-ignore
            .map((catId) => categoryMap.get(catId))
            .filter(Boolean)

        return {
            ...article,
            categories: fullCategories,
        }
    })

    // 4. Output results
    console.log("Enriched Articles Sample:");
    console.log(JSON.stringify(enrichedArticles[0], null, 2));

    // Check if categories are actually objects
    const firstArt = enrichedArticles[0];
    if (firstArt && firstArt.categories.length > 0) {
        const firstCat = firstArt.categories[0];
        if (typeof firstCat === 'object' && 'name' in firstCat) {
            console.log("SUCCESS: Categories are objects!");
        } else {
            console.error("FAILURE: Categories are seemingly not objects.", firstCat);
        }
    } else {
        console.log("Article has no categories to verify.");
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
