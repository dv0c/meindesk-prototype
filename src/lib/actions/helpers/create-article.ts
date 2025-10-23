"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import generateSlug from "@/lib/generateSlug";

export async function CreateArticle({ siteId }: { siteId: string }) {
  const session = await getAuthSession();
  const slug = await generateSlug("Untitled", "article");

  if (!session?.user.id) {
    return "Not authorized";
  }

  const article = await db.article.create({
    data: {
      title: "Untitled",
      slug,
      authorId: session.user.id,
      siteId,
    },
  });

  if (!article) {
    return "An error has occured";
  }

  return {
    url: `/dashboard/${siteId}/projects/website/articles/${article.id}/editor`,
    article: article,
  };
}
