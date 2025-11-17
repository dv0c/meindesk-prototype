import { db } from "@/lib/db";
import { headers } from "next/headers";

interface TenantPageProps {
  params: { slug?: string[] };
}

export default async function TenantPage({ params }: TenantPageProps) {
  // ✅ Use next/headers to read request headers
  const reqHeaders = headers();
  const tenantId = (await reqHeaders).get("x-tenant-id");

  if (!tenantId) return <h1>Tenant not found</h1>;

  const tenant = await db.site.findUnique({
    where: { id: tenantId },
    include: { features: true },
  });

  if (!tenant) return <h1>Tenant not found</h1>;

  const path = params?.slug || [];

  return (
    <div>
      <h1>{tenant.title}</h1>
      <p>Subdomain: {tenant.subdomain}</p>
      <p>Path: {path.join("/") || "home"}</p>
    </div>
  );
}
