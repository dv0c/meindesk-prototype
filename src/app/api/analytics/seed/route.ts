import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subDays } from "date-fns";

// Sample data pools
const PATHS = [
    "/",
    "/about",
    "/contact",
    "/blog",
    "/article/getting-started",
    "/article/web-development-tips",
    "/article/best-practices",
    "/services",
    "/pricing",
    "/portfolio",
];

const REFERRERS = [
    null, // Direct traffic
    null,
    null,
    "https://www.google.com/search?q=example",
    "https://www.google.com/search?q=web+design",
    "https://www.facebook.com/",
    "https://www.instagram.com/",
    "https://twitter.com/",
    "https://www.linkedin.com/",
    "https://news.ycombinator.com/",
];

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36", // Desktop Chrome
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36", // Desktop Safari
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0", // Desktop Firefox
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1", // iPhone
    "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 Mobile Safari/537.36", // Android
    "Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1", // iPad
];

const REGIONS = [
    "United States",
    "United Kingdom",
    "Canada",
    "Germany",
    "France",
    "Greece",
    "Spain",
    "Italy",
    "Australia",
    "Japan",
    "Brazil",
    "Netherlands",
];

// Generate random IP addresses
function generateIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Get random item from array
function random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Generate a random date within the last N days
function randomDate(daysAgo: number) {
    const now = new Date();
    const start = subDays(now, daysAgo);
    const randomTime = start.getTime() + Math.random() * (now.getTime() - start.getTime());
    return new Date(randomTime);
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { siteId, numEvents = 500 } = body;

        if (!siteId) {
            return NextResponse.json({ error: "siteId is required" }, { status: 400 });
        }

        // Delete existing analytics for this site
        const deleted = await db.analyticsEvent.deleteMany({
            where: { siteId },
        });

        // Generate events
        const events = [];
        for (let i = 0; i < numEvents; i++) {
            const createdAt = randomDate(90); // Last 90 days
            const path = random(PATHS);
            const referrer = random(REFERRERS);
            const userAgent = random(USER_AGENTS);
            const region = random(REGIONS);
            const ipAddress = generateIP();

            events.push({
                siteId,
                path,
                referrer,
                userAgent,
                region,
                device: null,
                ipAddress,
                createdAt,
            });
        }

        // Insert in batches
        const BATCH_SIZE = 100;
        let insertedCount = 0;

        for (let i = 0; i < events.length; i += BATCH_SIZE) {
            const batch = events.slice(i, i + BATCH_SIZE);
            await db.analyticsEvent.createMany({
                data: batch,
            });
            insertedCount += batch.length;
        }

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${insertedCount} analytics events`,
            deletedCount: deleted.count,
            insertedCount,
            siteId,
        });

    } catch (error: any) {
        console.error("Error seeding analytics:", error);
        return NextResponse.json(
            { error: "Failed to seed analytics", details: error.message },
            { status: 500 }
        );
    }
}
