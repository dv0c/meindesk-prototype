import { db } from "@/lib/db";
import { headers } from "next/headers";

export default async function TenantPage({ params }: { params: { slug: string } }) {
  const tenantId = (await headers()).get("x-tenant");
  if (!tenantId || tenantId === "prototype") {
    return <div>Invalid tenant context</div>;
  }

  const page = await db.page.findFirst({
    where: {
      siteId: tenantId,
      slug: params.slug,
      status: "PUBLISHED",
    },
  });

  if (!page) return <div>404 - Page not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <article dangerouslySetInnerHTML={{ __html: page.content || "" }} />
    </div>
  );
}
