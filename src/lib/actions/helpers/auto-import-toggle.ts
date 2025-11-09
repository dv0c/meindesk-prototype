"use server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function ChangeAutoImport({
  autoImport,
  siteId,
  feed,
}: {
  autoImport: boolean;
  siteId: string;
  feed: any;
}) {
  const session = await getAuthSession();
  if (!session?.user.id) throw new Error("Not authorized");

  const change = await db.rss.update({
    where: {
      id: feed.id,
      siteId,
    },
    data: {
      autoImport,
    },
  });

  return {
    autoImport: change.autoImport
  };
}
