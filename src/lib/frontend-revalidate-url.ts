/**
 * Build the URL for frontend cache revalidation (query-param auth).
 * Strips any existing `secret` param from the base URL, then appends the configured secret.
 */
export function buildRevalidateRequestUrl(baseUrl: string, secret: string): string {
  const url = new URL(baseUrl.trim())
  url.searchParams.delete("secret")
  url.searchParams.set("secret", secret.trim())
  return url.toString()
}

/**
 * Remove `secret` from a revalidation URL before persisting (secret is stored separately).
 */
export function stripSecretFromRevalidateUrl(baseUrl: string): string {
  const url = new URL(baseUrl.trim())
  url.searchParams.delete("secret")
  const query = url.searchParams.toString()
  return query ? `${url.origin}${url.pathname}?${query}` : `${url.origin}${url.pathname}`
}
