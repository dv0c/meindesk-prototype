import { NextRequest, NextResponse } from "next/server"
import { createErrorResponse, requireAuth, requireSiteAccess } from "@/lib/security/route-auth"
import { parseFiltersFromSearchParams, fetchEventsForRange, resolveDateRange } from "@/lib/analytics"

const FUNNELS: Record<string, { steps: string[]; label: string }> = {
  "search-to-contact": {
    label: "Search → View → Contact",
    steps: ["search", "page_view", "contact_click"],
  },
  "landing-to-share": {
    label: "Landing → Read → Share",
    steps: ["page_view", "page_view", "share_click"],
  },
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params
  const funnelId = req.nextUrl.searchParams.get("id") ?? "search-to-contact"

  try {
    const session = await requireAuth()
    if (!session.user) throw new Error("Unauthorized")
    await requireSiteAccess(siteId, session.user.id)

    const funnel = FUNNELS[funnelId]
    if (!funnel) {
      return NextResponse.json({ error: "Unknown funnel" }, { status: 400 })
    }

    const filters = parseFiltersFromSearchParams(req.nextUrl.searchParams)
    const range = resolveDateRange(filters.preset, filters.from, filters.to)
    const events = await fetchEventsForRange(siteId, range.from, range.to)

    const byVisitor: Record<string, string[]> = {}
    for (const e of events.filter((ev) => !ev.isBot)) {
      const vid = e.visitorId || e.ipAddress || "unknown"
      if (!byVisitor[vid]) byVisitor[vid] = []
      byVisitor[vid].push(e.eventType || "page_view")
    }

    const stepCounts = funnel.steps.map(() => 0)
    for (const sequence of Object.values(byVisitor)) {
      let stepIdx = 0
      for (const evt of sequence) {
        if (evt === funnel.steps[stepIdx]) {
          stepCounts[stepIdx]++
          stepIdx++
          if (stepIdx >= funnel.steps.length) break
        }
      }
    }

    const steps = funnel.steps.map((name, i) => {
      const count = stepCounts[i]
      const prev = i > 0 ? stepCounts[i - 1] : count
      const dropOff = prev ? Math.round(((prev - count) / prev) * 100) : 0
      return { name, count, dropOffPercent: i === 0 ? 0 : dropOff }
    })

    return NextResponse.json({ id: funnelId, label: funnel.label, steps })
  } catch (err) {
    return createErrorResponse(err)
  }
}
