// app/[tenantId]/page.tsx

import { notFound } from 'next/navigation';
import { db } from '@/lib/db'; // Adjust path as necessary
import Link from 'next/link';

// Define the expected shape of the route parameters
interface TenantPageProps {
  params: {
    tenantId: string; // This MUST match the folder name: [tenantId]
  };
}

// Define the fields needed for this page
const tenantSelectFields = {
    title: true,
    description: true,
    subdomain: true,
    // Add other fields relevant to the homepage content
};

export default async function TenantHomePage({ params }: TenantPageProps) {
  const { tenantId } = params;

  // 1. Fetch tenant-specific data using the ID from the URL segment
  const tenantData = await db.site.findUnique({
    where: { id: tenantId },
    select: tenantSelectFields,
  });

  // 2. Handle case where the ID is valid but the record is missing (should be rare 
  // if the middleware is working, but necessary for data consistency)
  if (!tenantData) {
    return notFound();
  }
  
  // 3. Render the tenant-specific content
  return (
    <div className="container mx-auto py-12 px-6">
      <div className="text-center">
        {/* Uses the primary text color defined by the injected CSS variables */}
        <h1 className="text-6xl font-bold text-primary">
          Welcome to **{tenantData.title}**
        </h1>
        
        {/* Uses a muted foreground color for secondary text */}
        <p className="mt-4 text-xl text-muted-foreground">
          Subdomain: **{tenantData.subdomain}**
        </p>
        
        <p className="mt-6 max-w-2xl mx-auto text-lg">
          {tenantData.description || "This is the default homepage for this tenant. The content below is scoped specifically to their data."}
        </p>
      </div>

      <div className="mt-16 border-t border-border pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Example of linking to other pages within the tenant context */}
        <ContentBlock title="Dashboard" href="/dashboard" />
        <ContentBlock title="Settings" href="/settings" />
        <ContentBlock title="Articles" href="/articles" />
      </div>
    </div>
  );
}

// --- Helper Component for Layout/Content ---
function ContentBlock({ title, href }: { title: string, href: string }) {
    return (
        <div className="p-6 border border-card-foreground rounded-lg shadow-lg bg-card transition-shadow hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-primary mb-3">{title}</h2>
            <p className="text-foreground">
                Visit the {title.toLowerCase()} page, still under the **same tenant context**.
            </p>
            <Link href={href} className="mt-4 inline-block text-accent-foreground underline hover:text-accent">
                Go to {title} &rarr;
            </Link>
        </div>
    );
}