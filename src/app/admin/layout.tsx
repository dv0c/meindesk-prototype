import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GlobalHeader } from "@/components/nav/GlobalHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Meindesk Admin",
    description: "Meindesk Admin Area",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <main className='min-h-screen bg-background text-foreground flex flex-col'>
            <GlobalHeader />
            <div className="flex-1">
                {children}
            </div>
        </main>
    );
}
