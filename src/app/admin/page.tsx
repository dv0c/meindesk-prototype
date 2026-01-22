import { AdminUserList } from "@/components/admin/AdminUserList";

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
            </div>
            <AdminUserList />
        </div>
    );
}
