import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
export async function GET(request: Request) {
  const user = await getAuthSession();

  if (!user) return null;

  const site = await db.site.findFirst({
    where: {
      userId: user.user.id,
    },
  });

  return new Response(JSON.stringify(site))
}
