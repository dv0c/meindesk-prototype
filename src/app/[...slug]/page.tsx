import { db } from "@/lib/db";

interface TenantPageProps {
    params: { slug: string[] };
}

export default async function TenantPage({ params }: TenantPageProps) {
    const { slug } = await params || []
    let subdomain = slug[0]; // first segment is tenant

    if (!subdomain) {
        return <h1>Tenant not found</h1>;
    }

    if (subdomain.includes(".")) {
        subdomain = subdomain.split(".")[0].toLowerCase(); // 'prototype.meindesk.gr' -> 'prototype'
    }


    // Lookup tenant
    const tenant = await db.site.findUnique({
        where: { subdomain },
        include: { features: true },
    });
    console.log(subdomain)

    if (!tenant) {
        return <h1>Tenant not found</h1>;
    }


    // Example: render content based on remaining slug
    const pagePath = slug.slice(1).join("/") || "home";

    // Fetch page content from DB if needed
    const page = await db.page.findFirst({
        where: { siteId: tenant.id, slug: pagePath },
    });

    return (
        <div>
            <h1>Tenant: {tenant.title}</h1>
            <h2>Page: {page?.title || pagePath}</h2>
            {/* <p>{page?.content || "This is a placeholder page."}</p> */}
        </div>
    );
}
