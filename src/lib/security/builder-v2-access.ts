import type { Session } from "next-auth";

export function canAccessBuilderV2(session: Session | null): boolean {
  if (!session?.user) return false;
  if (session.user.role !== "ADMIN") return false;

  const ownerEmail = process.env.BUILDER_V2_OWNER_EMAIL?.trim().toLowerCase();
  if (ownerEmail) {
    return (session.user.email || "").toLowerCase() === ownerEmail;
  }

  const ownerId = process.env.BUILDER_V2_OWNER_ID?.trim();
  if (ownerId) {
    return session.user.id === ownerId;
  }

  return Boolean((session.user as any).developerMode);
}
