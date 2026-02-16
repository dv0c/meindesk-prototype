import { AdminUserList } from "@/components/admin/AdminUserList";
import Link from "next/link";

export default function AdminPage() {
    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">
                        Manage users and impersonate accounts for support.
                    </p>
                </div>
                <Link
                    href="/admin/builder-2"
                    className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                >
                    Open Builder v2
                </Link>
            </div>
            <AdminUserList />
        </div>
    );
}
