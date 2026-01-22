
import { PrismaClient } from "../src/generated/client"
const db = new PrismaClient()

async function main() {
    console.log("Starting categories route verification...");

    // 1. Get a random site
    const site = await db.site.findFirst();
    if (!site) {
        console.error("No site found in DB.");
        return;
    }
    console.log(`Found site: ${site.id} (${site.subdomain})`);

    // 2. Fetch categories for this site
    console.log("Fetching categories...");
    const categories = await db.category.findMany({
        where: { siteId: site.id },
        orderBy: { createdAt: "desc" },
    })

    console.log(`Found ${categories.length} categories.`);

    if (categories.length > 0) {
        console.log("Category Sample:", JSON.stringify(categories[0], null, 2));
        console.log("SUCCESS: Categories fetched successfully.");
    } else {
        console.log("No categories found for this site. You might want to create one to test fully.");
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
