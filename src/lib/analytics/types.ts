export type AnalyticsEventType =
  | "page_view"
  | "search"
  | "click"
  | "listing_open"
  | "contact_click"
  | "phone_click"
  | "website_click"
  | "share_click"
  | "favorite_click"
  | "login"
  | "register"
  | "form_submit"

export type TrafficSource =
  | "direct"
  | "organic"
  | "paid"
  | "social"
  | "referral"
  | "email"
  | "internal"

export type ComparisonMode =
  | "none"
  | "previous_period"
  | "previous_week"
  | "previous_month"
  | "previous_year"

export interface AnalyticsFilterState {
  preset?: string
  from?: string
  to?: string
  compareMode?: ComparisonMode
  compareFrom?: string
  compareTo?: string
  device?: string
  source?: string
  country?: string
  browser?: string
  os?: string
  contentType?: string
  userType?: "new" | "returning"
}

export interface ComparisonMetric {
  value: number
  previous: number
  absolute: number
  percent: number
  trend: "up" | "down" | "flat"
}

export interface AnalyticsQueryResult {
  viewsOverTime: { date: string; views: number; visitors: number; sessions: number }[]
  topPages: { page: string; views: number }[]
  trafficSources: { source: string; value: number; color: string }[]
  regions: { region: string; count: number }[]
  devices: { device: string; count: number; color: string }[]
  cardMetrics: {
    totalViews: ComparisonMetric
    uniqueVisitors: ComparisonMetric
    sessions: ComparisonMetric
    bounceRate: ComparisonMetric
    avgSessionDuration: { value: string; seconds: number; comparison: ComparisonMetric }
    pagesPerSession: ComparisonMetric
    newVisitors: ComparisonMetric
    returningVisitors: ComparisonMetric
  }
}

export interface IngestEventPayload {
  siteId: string
  path: string
  referrer?: string
  userAgent?: string
  articleSlug?: string
  ingestToken?: string
  eventType?: AnalyticsEventType
  visitorId?: string
  sessionId?: string
  contentType?: string
  contentId?: string
  metadata?: Record<string, unknown>
}

export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]
