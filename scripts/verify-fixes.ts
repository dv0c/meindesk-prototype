
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
    console.log("Verifying article categories...");

    // Fetch all articles
    const articles = await db.article.findMany({
        select: {
            id: true,
            categories: true,
            siteId: true,
            title: true,
        },
    });

    let invalidCount = 0;

    for (const article of articles) {
        for (const cat of article.categories) {
            // Check if it's a valid ObjectID (24 hex characters)
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(cat);

            if (!isValidObjectId) {
                console.error(`Status: FAILED - Found invalid category ID "${cat}" in article "${article.title}" (${article.id})`);
                invalidCount++;
            }
        }
    }

    if (invalidCount === 0) {
        console.log("Status: PASSED - All articles have valid category IDs.");
    } else {
        console.log(`Status: FAILED - Found ${invalidCount} invalid category references.`);
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
