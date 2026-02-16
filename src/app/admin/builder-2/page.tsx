import { getAuthSession } from "@/lib/auth";
import { canAccessBuilderV2 } from "@/lib/security/builder-v2-access";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminBuilder2Page({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string; pageId?: string }>;
}) {
  const session = await getAuthSession();
  if (!canAccessBuilderV2(session)) {
    redirect("/admin");
  }

  const { siteId, pageId } = await searchParams;
  const canOpen = Boolean(siteId && pageId);
  const target = canOpen
    ? `/dashboard/${siteId}/projects/website/builder/${pageId}`
    : null;

  return (
    <div className="h-full flex-1 p-8">
      <div className="mx-auto max-w-2xl rounded-xl border bg-card p-6">
        <h1 className="text-2xl font-semibold">Builder v2 (private)</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This route is restricted. Old Canva builder remains default for all users.
        </p>

        <form method="get" className="mt-6 grid gap-3">
          <label className="text-sm font-medium">Site ID</label>
          <input
            name="siteId"
            defaultValue={siteId || ""}
            className="h-10 rounded-md border px-3 text-sm"
            placeholder="site id"
          />

          <label className="text-sm font-medium">Page ID</label>
          <input
            name="pageId"
            defaultValue={pageId || ""}
            className="h-10 rounded-md border px-3 text-sm"
            placeholder="page id"
          />

          <button className="mt-1 h-10 rounded-md bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800">
            Prepare URL
          </button>
        </form>

        {target ? (
          <div className="mt-4 rounded-md border bg-muted/30 p-3 text-sm">
            <div className="mb-2 font-medium">Open builder v2:</div>
            <Link href={target} className="break-all text-blue-600 underline">
              {target}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
