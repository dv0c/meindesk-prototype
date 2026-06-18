export interface ParsedUserAgent {
  device: "Desktop" | "Mobile" | "Tablet" | "Unknown"
  browser: string
  os: string
}

export function parseUserAgent(uaString?: string | null): ParsedUserAgent {
  if (!uaString) {
    return { device: "Unknown", browser: "Unknown", os: "Unknown" }
  }

  const ua = uaString.toLowerCase()

  let device: ParsedUserAgent["device"] = "Desktop"
  if (ua.includes("ipad") || (ua.includes("tablet") && !ua.includes("mobile"))) {
    device = "Tablet"
  } else if (
    ua.includes("mobile") ||
    ua.includes("iphone") ||
    ua.includes("android") && ua.includes("mobile")
  ) {
    device = "Mobile"
  }

  let browser = "Other"
  if (ua.includes("edg/")) browser = "Edge"
  else if (ua.includes("opr/") || ua.includes("opera")) browser = "Opera"
  else if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome"
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari"
  else if (ua.includes("firefox")) browser = "Firefox"

  let os = "Other"
  if (ua.includes("windows")) os = "Windows"
  else if (ua.includes("mac os") || ua.includes("macintosh")) os = "macOS"
  else if (ua.includes("android")) os = "Android"
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS"
  else if (ua.includes("linux")) os = "Linux"

  return { device, browser, os }
}
