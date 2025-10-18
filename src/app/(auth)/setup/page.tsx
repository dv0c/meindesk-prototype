import { SetupForm } from "@/components/setup-form";
import { getAuthSession } from "@/lib/auth"; // adjust path to where you define your NextAuth config
import { ChartBarDecreasingIcon } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import LoginImage from "../../../../public/login.jpg";
import { getSite } from "@/lib/actions/helpers/site";

export default async function LoginPage() {

    const session = await getAuthSession()
    if (!session) redirect("/login")

    const site = await getSite()
    if (site) redirect("/dashboard")
    return (
        <div className="bg-muted-foreground flex min-h-svh relative flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="-z-0">
                <Image
                    src={LoginImage}
                    placeholder="blur"
                    alt="login"
                    fill
                    style={{ objectFit: "cover" }}
                    className="brightness-50 min-h-svh w-svh"
                />
            </div>
            <div className="flex w-full max-w-sm flex-col gap-6 z-1">
                <a
                    href="https://meindesk.gr/"
                    className="flex items-center gap-2 self-center font-medium flex-col"
                >
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <ChartBarDecreasingIcon className="size-4" />
                    </div>
                    Meindesk Prototype Gateway
                </a>
                <SetupForm />
            </div>
        </div>
    )
}
