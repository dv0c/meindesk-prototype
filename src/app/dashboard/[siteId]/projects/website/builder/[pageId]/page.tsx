import { BuilderShell } from "@/builder-v2/components/BuilderShell";
import { getAuthSession } from "@/lib/auth";
import { canAccessBuilderV2 } from "@/lib/security/builder-v2-access";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Builder v2 | PROTOTYPE",
};

export default async function BuilderV2Page({
  params,
}: {
  params: Promise<{ siteId: string; pageId: string }>;
}) {
  const session = await getAuthSession();
  if (!canAccessBuilderV2(session)) {
    notFound();
  }

  const { siteId, pageId } = await params;

  return <BuilderShell siteId={siteId} pageId={pageId} />;
}
