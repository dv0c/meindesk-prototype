import { NextRequest, NextResponse } from "next/server"
import { createErrorResponse, requireAuth, requireSiteAccess } from "@/lib/security/route-auth"
import { runAnalyticsQuery, parseFiltersFromSearchParams } from "@/lib/analytics/query-service"

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(",")
  const lines = rows.map((row) =>
    columns.map((col) => {
      const val = row[col]
      const str = val == null ? "" : String(val)
      return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
    }).join(",")
  )
  return [header, ...lines].join("\n")
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params
  const report = req.nextUrl.searchParams.get("report") ?? "overview"

  try {
    const session = await requireAuth()
    if (!session.user) throw new Error("Unauthorized")
    await requireSiteAccess(siteId, session.user.id)

    const filters = parseFiltersFromSearchParams(req.nextUrl.searchParams)

    if (report === "overview") {
      const { result } = await runAnalyticsQuery(siteId, filters)
      const csv = toCsv(result.topPages, ["page", "views"])
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="analytics-top-pages-${siteId}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: "Unknown report type" }, { status: 400 })
  } catch (err) {
    return createErrorResponse(err)
  }
}
