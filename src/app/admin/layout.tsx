
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b bg-muted/40 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-bold">Meindesk Admin</h1>
                    <nav className="flex items-center gap-4 text-sm font-medium">
                        <Link href="/admin/themes" className="hover:text-primary">Themes</Link>
                        {/* Add other admin links here */}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Logged in as {session.user.email}</span>
                    <Link href="/">
                        <Button variant="outline" size="sm">Exit Admin</Button>
                    </Link>
                </div>
            </header>
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    );
}
