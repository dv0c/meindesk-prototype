const BOT_PATTERNS = [
  "googlebot",
  "bingbot",
  "slurp",
  "duckduckbot",
  "baiduspider",
  "yandexbot",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "whatsapp",
  "telegrambot",
  "applebot",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "petalbot",
  "uptimerobot",
  "pingdom",
  "headlesschrome",
  "phantomjs",
  "curl/",
  "wget/",
  "python-requests",
  "go-http-client",
  "bot",
  "spider",
  "crawler",
]

export function isBotUserAgent(userAgent?: string | null): boolean {
  if (!userAgent) return false
  const ua = userAgent.toLowerCase()
  return BOT_PATTERNS.some((pattern) => ua.includes(pattern))
}
