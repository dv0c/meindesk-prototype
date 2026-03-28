import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize untrusted HTML (CMS, RSS, AI-generated) before dangerouslySetInnerHTML.
 */
export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html || typeof html !== "string") return "";
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
