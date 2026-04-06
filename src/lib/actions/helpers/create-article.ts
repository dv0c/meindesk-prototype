"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import generateSlug from "@/lib/generateSlug";
import { logActivity } from "@/lib/actions/activity-log";

export async function CreateArticle({ siteId }: { siteId: string }) {
  const session = await getAuthSession();
  const slug = await generateSlug("Untitled", "article", siteId);
  const userId = session?.user?.id;
  if (!userId) {
    return "Not authorized";
  }

  const article = await db.article.create({
    data: {
      title: "Untitled",
      slug,
      authorId: userId,
      authorIds: [userId],
      siteId,
    },
  });

  if (!article) {
    return "An error has occured";
  }

  // Log the activity
  await logActivity({
    siteId,
    action: "CREATE",
    entity: "article",
    entityId: article.id,
    entityName: article.title,
  });

  return {
    url: `/dashboard/${siteId}/projects/website/articles/${article.id}/editor`,
    article: article,
  };
}
