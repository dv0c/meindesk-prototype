"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Rss } from "@prisma/client";

export async function SaveFeed({
  data,
  siteId,
}: {
  data: Omit<Rss, "id" | "createdAt" | "updatedAt">;
  siteId: string;
}) {
  const session = await getAuthSession();

  if (!session?.user.id) {
    return "Not authorized";
  }

  const feed = await db.rss.create({
    data: { ...data },
  });

  if (!feed) {
    return "An error has occured";
  }

  return {
    url: `/dashboard/${siteId}/projects/website/rss/feed/${feed.url}/`,
    rss: feed,
  };
}
