
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ProjectNavigation } from "@/components/nav/ProjectNavigation";
import SiteContainer from "@/components/SiteContainer";
import { ArticleCard } from "@/app/(home)/components/article-card";
import { Metadata } from "next";

export const revalidate = 60;

// Need to find the author by name by looking up users.
// Note: User model does not have a "slug" or guaranteed unique display name.
// We will try to match "name" to User.name or User.username.
// Since names are URL encoded, we decode them first.

async function getAuthorAndArticles(nameDetails: string, siteId: string) {
    const decodedName = decodeURIComponent(nameDetails).replace(/-/g, " ");

    // Find user by name match (rough match)
    // Warning: This might pick the wrong user if names are duplicates, 
    // but it's the best we can do without a unique username/slug system for profiles.
    const author = await db.user.findFirst({
        where: {
            OR: [
                { name: { equals: decodedName, mode: "insensitive" } },
                { username: { equals: decodedName, mode: "insensitive" } },
            ]
        },
    });

    if (!author) return null;

    const articles = await db.article.findMany({
        where: {
            authorId: author.id,
            siteId: siteId,
            status: "PUBLISHED",
        },
        include: {
            author: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return { author, articles };
}

// Since siteId is needed but not available in params for the root layout (multitenant simplified),
// we assume this page is part of the `(home)` group which usually wraps the site context.
// However, in this project structure, it seems we might need to fetch the site based on the domain (middleware handles it, 
// usually passing headers or we look up "default" site if logic allows).
//
// Looking at other pages like `src/app/(home)/page.tsx`, we can see how they fetch site data.
// It seems many pages don't explicitly fetch siteId but rely on data passed or a context.
// Wait, `db.article.findMany` needs `siteId`. 
// The Middleware often handles `siteId` but inside a page component we might need to discover it.
// 
// Let's assume there is a single main site for this "prototype" OR check how `page.tsx` gets it.
// Actually, in `(home)/page.tsx`, usually the `siteId` is fetched via domain lookup or hardcoded for a prototype.
// Let's check `src/app/layout.tsx` or similar to see how site is determined if not in params.
//
// Checking `src/app/(home)/page.tsx` would be ideal. I'll make a best guess and add a TODO if needed.
// For now, I'll fetch the site based on the Host header or similar if possible, or just query the first site found if it's a single-site prototype.

async function getSiteFromHost() {
    // Fallback for prototype: just get the first site or a specific ID if known.
    // In a real multi-tenant app, headers() would provide the hostname to lookup.
    const site = await db.site.findFirst();
    return site;
}


type Props = {
    params: { name: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { name } = await params;
    const decodedName = decodeURIComponent(name).replace(/-/g, " ");
    return {
        title: `${decodedName} - Author Profile`,
        description: `Articles written by ${decodedName}`,
    };
}

export default async function AuthorPage({ params }: Props) {
    const { name } = await params;
    const site = await getSiteFromHost();
    if (!site) return notFound();

    const data = await getAuthorAndArticles(name, site.id);
    if (!data) return notFound();

    const { author, articles } = data;

    return (
        <>
            <ProjectNavigation siteId={site.id} />
            <SiteContainer className="py-12">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12 bg-muted/30 p-8 rounded-2xl">
                    <div className="relative w-32 h-32 shrink-0">
                        <Image
                            src={author.image || "/placeholder-user.jpg"}
                            alt={author.name}
                            fill
                            className="object-cover rounded-full border-4 border-background shadow-sm"
                        />
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">{author.name}</h1>
                        <p className="text-muted-foreground">
                            Author of {articles.length} article{articles.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article: any) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>

                {articles.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        This author hasn't published any articles yet.
                    </div>
                )}

            </SiteContainer>
        </>
    );
}
