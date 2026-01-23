"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "loading") return;

        // If authenticated...
        if (session?.user) {
            // ...and missing username...
            if (!session.user.username) {
                // ...and not already on the setup page...
                if (pathname !== "/setup-user" && pathname !== "/api/auth/signout") {
                    // ...redirect to setup
                    router.push("/setup-user");
                }
            }
        }
    }, [session, status, pathname, router]);

    return <>{children}</>;
}
