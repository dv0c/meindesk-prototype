import { createHash } from "crypto"

export function hashIp(ip: string, salt?: string): string {
  const s = salt ?? process.env.ANALYTICS_IP_SALT ?? "meindesk-analytics"
  return createHash("sha256").update(`${s}:${ip}`).digest("hex").slice(0, 32)
}

export function anonymizeIpForDisplay(ip?: string | null): string {
  if (!ip || ip === "unknown") return "—"
  const parts = ip.split(".")
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`
  return ip.slice(0, 8) + "…"
}

export function shouldAnonymizeIp(settings?: Record<string, unknown> | null): boolean {
  const analytics = settings?.analytics as Record<string, unknown> | undefined
  return analytics?.anonymizeIp === true
}
