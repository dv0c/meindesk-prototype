import type { NextRequest } from "next/server";

/**
 * Validates scheduled-job or internal server calls using CRON_SECRET.
 */
export function verifyInternalCronRequest(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return req.headers.get("x-cron-secret") === secret;
}
