// Seed script to add fake analytics data for testing
import { db } from "./src/lib/db.js";
import { subDays, subHours, subMinutes } from "date-fns";

const SITE_ID = "692fedf935643e45ec44576d";

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
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate a random date within the last N days
function randomDate(daysAgo) {
  const now = new Date();
  const start = subDays(now, daysAgo);
  const randomTime = start.getTime() + Math.random() * (now.getTime() - start.getTime());
  return new Date(randomTime);
}

async function seedAnalytics() {
  console.log("🌱 Seeding analytics data...");

  try {
    // Delete existing analytics for this site
    const deleted = await db.analyticsEvent.deleteMany({
      where: { siteId: SITE_ID },
    });
    console.log(`🗑️  Deleted ${deleted.count} existing analytics events`);

    // Generate events
    const events = [];
    const NUM_EVENTS = 500; // Generate 500 fake events

    for (let i = 0; i < NUM_EVENTS; i++) {
      const createdAt = randomDate(90); // Last 90 days
      const path = random(PATHS);
      const referrer = random(REFERRERS);
      const userAgent = random(USER_AGENTS);
      const region = random(REGIONS);
      const ipAddress = generateIP();

      events.push({
        siteId: SITE_ID,
        path,
        referrer,
        userAgent,
        region,
        device: null, // Will be derived from userAgent
        ipAddress,
        createdAt,
      });
    }

    // Insert in batches to avoid overwhelming the database
    const BATCH_SIZE = 100;
    for (let i = 0; i < events.length; i += BATCH_SIZE) {
      const batch = events.slice(i, i + BATCH_SIZE);
      await db.analyticsEvent.createMany({
        data: batch,
      });
      console.log(`✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(events.length / BATCH_SIZE)}`);
    }

    console.log(`✨ Successfully seeded ${events.length} analytics events!`);
    console.log(`📊 Site ID: ${SITE_ID}`);
    console.log(`📅 Date range: Last 90 days`);
    console.log(`\n🎉 You can now view the analytics at: /dashboard/${SITE_ID}/projects/website/analytics`);

  } catch (error) {
    console.error("❌ Error seeding analytics:", error);
    throw error;
  }
}

// Run the seed function
seedAnalytics()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
