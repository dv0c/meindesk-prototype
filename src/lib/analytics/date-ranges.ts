import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subMonths,
  subYears,
  differenceInCalendarDays,
} from "date-fns"

export interface DateRangeResult {
  from: Date
  to: Date
  label: string
}

export interface ComparisonRangeResult {
  from: Date
  to: Date
}

export const DATE_PRESETS: { label: string; value: string }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7Days" },
  { label: "Last 14 Days", value: "last14Days" },
  { label: "Last 30 Days", value: "last30Days" },
  { label: "Last 60 Days", value: "last60Days" },
  { label: "Last 90 Days", value: "last90Days" },
  { label: "Last 6 Months", value: "last6Months" },
  { label: "Last 12 Months", value: "last12Months" },
  { label: "Month to Date", value: "mtd" },
  { label: "Quarter to Date", value: "qtd" },
  { label: "Year to Date", value: "ytd" },
]

/** Legacy preset aliases used by existing components */
const LEGACY_ALIASES: Record<string, string> = {
  lastWeek: "last7Days",
  lastMonth: "last30Days",
  last3Months: "last90Days",
}

export function resolveDateRange(
  preset?: string,
  customFrom?: string,
  customTo?: string,
  now: Date = new Date()
): DateRangeResult {
  if (customFrom && customTo) {
    return {
      from: startOfDay(new Date(customFrom)),
      to: endOfDay(new Date(customTo)),
      label: "Custom",
    }
  }

  const key = preset ? LEGACY_ALIASES[preset] ?? preset : "last30Days"
  const end = endOfDay(now)

  switch (key) {
    case "today":
      return { from: startOfDay(now), to: end, label: "Today" }
    case "yesterday": {
      const y = subDays(now, 1)
      return { from: startOfDay(y), to: endOfDay(y), label: "Yesterday" }
    }
    case "last7Days":
      return { from: startOfDay(subDays(now, 6)), to: end, label: "Last 7 Days" }
    case "last14Days":
      return { from: startOfDay(subDays(now, 13)), to: end, label: "Last 14 Days" }
    case "last30Days":
      return { from: startOfDay(subDays(now, 29)), to: end, label: "Last 30 Days" }
    case "last60Days":
      return { from: startOfDay(subDays(now, 59)), to: end, label: "Last 60 Days" }
    case "last90Days":
      return { from: startOfDay(subDays(now, 89)), to: end, label: "Last 90 Days" }
    case "last6Months":
      return { from: startOfDay(subMonths(now, 6)), to: end, label: "Last 6 Months" }
    case "last12Months":
      return { from: startOfDay(subMonths(now, 12)), to: end, label: "Last 12 Months" }
    case "mtd":
      return { from: startOfMonth(now), to: end, label: "Month to Date" }
    case "qtd":
      return { from: startOfQuarter(now), to: end, label: "Quarter to Date" }
    case "ytd":
      return { from: startOfYear(now), to: end, label: "Year to Date" }
    default:
      return { from: startOfDay(subDays(now, 29)), to: end, label: "Last 30 Days" }
  }
}

export function resolveComparisonRange(
  mode: string,
  current: DateRangeResult,
  customCompareFrom?: string,
  customCompareTo?: string
): ComparisonRangeResult | null {
  if (mode === "none" || !mode) return null

  if (customCompareFrom && customCompareTo) {
    return {
      from: startOfDay(new Date(customCompareFrom)),
      to: endOfDay(new Date(customCompareTo)),
    }
  }

  const days = differenceInCalendarDays(current.to, current.from) + 1

  switch (mode) {
    case "previous_period":
      return {
        from: subDays(current.from, days),
        to: subDays(current.from, 1),
      }
    case "previous_week":
      return {
        from: subDays(current.from, 7),
        to: subDays(current.to, 7),
      }
    case "previous_month":
      return {
        from: subMonths(current.from, 1),
        to: subMonths(current.to, 1),
      }
    case "previous_year":
      return {
        from: subYears(current.from, 1),
        to: subYears(current.to, 1),
      }
    default:
      return {
        from: subDays(current.from, days),
        to: subDays(current.from, 1),
      }
  }
}

export type ChartGranularity = "hour" | "day" | "week" | "month"

export function autoGranularity(from: Date, to: Date): ChartGranularity {
  const days = differenceInCalendarDays(to, from) + 1
  if (days <= 1) return "hour"
  if (days <= 90) return "day"
  if (days <= 365) return "week"
  return "month"
}

/** Use rollups when range is older than 2 days (excluding today-only views) */
export function shouldUseRollups(from: Date, to: Date, now: Date = new Date()): boolean {
  const todayStart = startOfDay(now)
  return from < todayStart && differenceInCalendarDays(to, from) >= 2
}
