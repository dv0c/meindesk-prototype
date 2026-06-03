"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { signIn } from "next-auth/react"

type LoginFormProps = React.ComponentProps<"div"> & {
  callbackUrl?: string;
};

export function LoginForm({ className, callbackUrl = "/dashboard", ...props }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError("Invalid email or password")
        return
      }

      if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
        return
      }

      setError("Login failed. Please try again.")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    try {
      await signIn("google", { callbackUrl })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed")
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-8", className)} {...props}>
      <form onSubmit={handleEmailLogin} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="m@example.com"
            required
            autoComplete="email"
            className="w-full bg-transparent border border-foreground/20 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground"
            >
              Password
            </label>
            <a
              href="#"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot?
            </a>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full bg-transparent border border-foreground/20 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="border border-red-500/30 bg-red-500/5 px-4 py-2 font-mono text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="group w-full border border-foreground/20 px-6 py-3 font-mono text-xs uppercase tracking-widest text-foreground hover:border-accent hover:text-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Authenticating..." : "Login"}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-foreground/10"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Or Continue With
            </span>
          </div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            disabled
            className="border border-foreground/20 px-4 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-all duration-200 disabled:opacity-50"
          >
            Apple
          </button>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="border border-foreground/20 px-4 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Google
          </button>
        </div>
      </form>

      {/* Terms */}
      <div className="border-t border-foreground/10 pt-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 text-center">
          By continuing, you agree to{" "}
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </a>
          {" "}and{" "}
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </a>
        </p>
      </div>
    </div>
  )
}
