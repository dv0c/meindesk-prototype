"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      // Parse URL fragment (#access_token=...)
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.hash)
        .catch(() => ({ data: null, error: "Invalid hash" }))

      // If exchangeCodeForSession isn’t available (older SDK), fallback:
      if (!data && window.location.hash) {
        await supabase.auth.setSessionFromUrl({ storeSession: true })
      }

      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session) {
        router.replace("/dashboard") // redirect after login success
      } else {
        router.replace("/login?error=session")
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen text-center">
      <p className="text-gray-600 text-lg font-medium">
        Confirming your account... please wait.
      </p>
    </div>
  )
}
