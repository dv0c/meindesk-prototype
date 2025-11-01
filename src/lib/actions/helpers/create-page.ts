"use server";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import generateSlug from "@/lib/generateSlug";

export async function CreatePage({ siteId }: { siteId: string }) {
  const session = await getAuthSession();
  const slug = await generateSlug("Untitled", "page");

  if (!session?.user?.id) {
    return "Not authorized";
  }

  const page = await db.page.create({
    data: {
      title: "Untitled",
      slug,
      content: "",
      excerpt: "",
      template: "default",
      status: "DRAFT",
      order: 0,
      siteId,
      userId: session.user.id,
      parentId: null,
      meta: {},
    },
  });

  if (!page) {
    return "An error has occurred";
  }

  return {
    url: `/dashboard/${siteId}/projects/website/pages/${page.id}/editor`,
    page,
  };
}
