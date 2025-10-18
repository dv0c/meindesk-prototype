import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const user = await getAuthSession()
  if (!user)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    })

  const [site, subscription] = await Promise.all([
    db.site.findFirst({
      where: {
        userId: user.user.id,
      },
    }),
    db.subscription.findFirst({
      where: {
        userId: user.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ])

  return new Response(JSON.stringify({ site, subscription }), {
    headers: { "Content-Type": "application/json" },
  })
}
