"use server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function createSite(formData: FormData) {
  // Get current logged-in user
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a site");
  }

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const url = formData.get("url")?.toString().trim() || null;
  const logo = formData.get("logo")?.toString().trim() || null;

  if (!title) {
    throw new Error("Title is required");
  }

  try {
    const site = await db.site.create({
      data: {
        title,
        description,
        url,
        logo,
        userId: session.user.id, // link site to logged-in user
      },
    });

    await db.subscription.create({
      data: {
        Site: {
          connect: {
            id: site.id,
          },
        },
        userId: session.user.id,
        price: 20,
        billing_cycle: "monthly",
        plan: "Enterprise",
        status: "Active",
        next_billing_date: new Date(),
      },
    });

    return site;
  } catch (err: any) {
    console.error("Failed to create site:", err);
    throw new Error("Could not create site. Please try again.");
  }
}
