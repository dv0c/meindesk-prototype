import { db } from "@/lib/db";
import { headers } from "next/headers";

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const tenantHeader = (await headers()).get("x-tenant");

  // Fallback: if missing (local dev maybe)
  const tenant = tenantHeader === "prototype" ? null : tenantHeader;

  // Get site data
  const site = tenant
    ? await db.site.findUnique({ where: { id: tenant } })
    : await db.site.findUnique({ where: { subdomain: "prototype" } });

  if (!site) {
    return (
      <html>
        <body>
          <h1>Tenant not found</h1>
        </body>
      </html>
    );
  }

  return (
    <html>
      <body>
        <header className="p-4 border-b">
          <h1>{site.title}</h1>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
