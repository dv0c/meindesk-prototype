import { SignupForm } from "@/components/signup-form"
import { ChartBarDecreasingIcon } from "lucide-react"
import Image from "next/image"
import { redirect } from "next/navigation"
import LoginImage from '../../../../public/login.jpg'
import { getAuthSession } from "@/lib/auth"

export default async function Page() {
  const session = await getAuthSession()
  if (session) redirect("/dashboard")
  return (
    <div className="bg-muted flex min-h-svh relative flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="-z-0">
        <Image src={LoginImage} alt="login" fill objectFit="cover" className="brightness-50" />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6 z-1">
        <a href="https://meindesk.gr/ " className="flex items-center gap-2 self-center font-medium flex-col">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <ChartBarDecreasingIcon className="size-4" />
          </div>
          Meindesk Prototype Gateway
        </a>
        <SignupForm />
      </div>
    </div>
  )
}
