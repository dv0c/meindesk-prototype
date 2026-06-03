const DEFAULT_CALLBACK = "/dashboard";

/**
 * Validates open-redirect-safe callback paths for login (dashboard routes only).
 */
export function sanitizeLoginCallbackUrl(raw: string | null | undefined): string {
  const trimmed = raw?.trim();
  if (!trimmed) return DEFAULT_CALLBACK;
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return DEFAULT_CALLBACK;
  if (!trimmed.startsWith("/dashboard")) return DEFAULT_CALLBACK;
  return trimmed;
}
