"use server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { triggerNotification } from "@/lib/actions/notification-actions";
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
    const pages = JSON.parse(formData.get("pages")?.toString() || "[]");
    const siteType = formData.get("type")?.toString() || "blog";
    const mode = formData.get("mode")?.toString() || "builder"; // "builder" or "cms"
    const themeId = formData.get("theme")?.toString() || "core";

    const site = await db.site.create({
      data: {
        title,
        description,
        url,
        logo,
        subdomain,
        template_schema: null,
        userId: session.user.id,
        settings: {
          type: siteType,
          mode: mode, // Store mode in settings
          analyticsConnected: mode === "builder", // CMS mode requires manual connection
          themeId: themeId
        }
      },
    });

    // Create the Home page (Always required)
    const homePage = await db.page.create({
      data: {
        title: "Home",
        slug: "home",
        status: "PUBLISHED",
        siteId: site.id,
        locked: true
      },
    });

    // Update the site with the home page ID
    await db.site.update({
      where: { id: site.id },
      data: { home_Id: homePage.id },
    });

    // Prepare promises for other resources
    const promises: Promise<any>[] = [
      // Subscription
      db.subscription.create({
        data: {
          Site: { connect: { id: site.id } },
          userId: session.user.id,
          price: 20,
          billing_cycle: "monthly",
          plan: "Enterprise",
          status: "Active",
          next_billing_date: new Date(),
        },
      }),

      // Features
      db.features.create({
        data: {
          Site: { connect: { id: site.id } },
          pages: mode === "cms" ? false : true, // Disable pages for CMS mode
          analytics: true, // Always enabled as a feature, but might require setup
        },
      }),

      // Install default "Core" theme
      db.siteTheme.create({
        data: {
          siteId: site.id,
          themeId: "000000000000000000000001", // Default core theme ID
        },
      }),
    ];

    // Create selected pages
    if (pages.includes("article")) {
      promises.push(
        db.page.create({
          data: {
            title: "Article",
            slug: "article",
            status: "PUBLISHED",
            siteId: site.id,
            locked: true
          },
        })
      );
    }

    if (pages.includes("articles")) {
      promises.push(
        db.page.create({
          data: {
            title: "Articles",
            slug: "articles",
            status: "PUBLISHED",
            siteId: site.id,
            locked: true
          },
        })
      );
    }

    if (pages.includes("about")) {
      promises.push(
        db.page.create({
          data: {
            title: "About Us",
            slug: "about",
            status: "PUBLISHED",
            siteId: site.id,
          },
        })
      );
    }

    if (pages.includes("contact")) {
      promises.push(
        db.page.create({
          data: {
            title: "Contact",
            slug: "contact",
            status: "PUBLISHED",
            siteId: site.id,
          },
        })
      );
    }

    if (pages.includes("portfolio")) {
      promises.push(
        db.page.create({
          data: {
            title: "Portfolio",
            slug: "portfolio",
            status: "PUBLISHED",
            siteId: site.id,
          },
        })
      );
    }

    await Promise.all(promises);

    // Trigger Notification
    await triggerNotification({
      userId: session.user.id,
      title: "Site Created Successfully",
      message: `Your new site "${site.title}" has been deployed. Start editing now!`,
      type: "SUCCESS",
      siteId: site.id,
      link: `/dashboard/${site.id}`
    })

    return site;
  } catch (err: any) {
    console.error("Failed to create site:", err);
    throw new Error("Could not create site. Please try again.");
  }
}
