import { NextRequest, NextResponse } from "next/server"
import { createErrorResponse, requireAuth, requireSiteAccess } from "@/lib/security/route-auth"
import { parseFiltersFromSearchParams, runAnalyticsQuery } from "@/lib/analytics/query-service"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params

  try {
    const session = await requireAuth()
    if (!session.user) throw new Error("Unauthorized")
    await requireSiteAccess(siteId, session.user.id)

    const filters = parseFiltersFromSearchParams(req.nextUrl.searchParams)
    const { range, comparison, result } = await runAnalyticsQuery(siteId, filters)

    const res = NextResponse.json({
      ...result,
      meta: {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        label: range.label,
        compareFrom: comparison?.from.toISOString(),
        compareTo: comparison?.to.toISOString(),
      },
    })
    res.headers.set("Cache-Control", "private, max-age=60")
    return res
  } catch (err) {
    return createErrorResponse(err)
  }
}
