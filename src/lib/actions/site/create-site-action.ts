"use server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import InitialTemplateTheme from "@/lib/initialTemplateTheme.json";
export async function createSite(formData: FormData) {
  // Get current logged-in user
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new Error("You must be logged in to create a site");
  }

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const url = formData.get("url")?.toString().trim();
  const logo = formData.get("logo")?.toString().trim() || null;
  const subdomain = formData.get("subdomain")?.toString().trim() || null;

  if (!title) {
    throw new Error("Title is required");
  }

  if (!url || !subdomain) {
    throw new Error("Url is required");
  }

  try {
    const site = await db.site.create({
      data: {
        title,
        description,
        url,
        logo,
        subdomain,
        template_schema: InitialTemplateTheme,
        userId: session.user.id, // link site to logged-in user
      },
    });

    await Promise.all([
      db.subscription.create({
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
      }),

      db.features.create({
        data: {
          Site: {
            connect: {
              id: site.id,
            },
          },
        },
      }),

      db.page.create({
        data: {
          title: "Home",
          slug: "home",
          siteId: site.id,
          locked: true
        },
      }),

      db.page.create({
        data: {
          title: "article",
          slug: "article",
          siteId: site.id,
          locked: true
        },
      }),
    ]);

    return site;
  } catch (err: any) {
    console.error("Failed to create site:", err);
    throw new Error("Could not create site. Please try again.");
  }
}
