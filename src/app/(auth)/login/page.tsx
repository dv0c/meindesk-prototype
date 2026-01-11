import { LoginForm } from "@/components/login-form"
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation"
import { Bebas_Neue } from "next/font/google";
import { AnimatedNoise } from "@/app/(home)/components/animated-noise";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

export default async function LoginPage() {
  const session = await getAuthSession()
  if (session) redirect("/dashboard")

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 md:px-12">
      {/* Grid background matching homepage */}
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      {/* Animated noise ambient effect */}
      <AnimatedNoise opacity={0.03} />

      {/* Left vertical label matching homepage */}
      <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap">
          LOGIN
        </span>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand matching homepage style */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="border border-foreground/20 px-4 py-2">
              <span className={`text-2xl tracking-widest text-foreground ${bebas.className}`}>PROTOTYPE</span>
            </div>
          </div>
          <h1 className="font-[var(--font-bebas)] text-muted-foreground/60 text-[clamp(1.5rem,3vw,2.5rem)] tracking-wide">
            Welcome Back
          </h1>
          <p className="mt-4 font-mono text-xs text-muted-foreground leading-relaxed uppercase tracking-widest">
            Sign in to continue
          </p>
        </div>

        {/* Login Form - no card wrapper */}
        <LoginForm />

        {/* Footer matching homepage style */}
        <div className="mt-12 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Don't have an account?{" "}
            <a href="/signup" className="text-foreground hover:text-accent transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Floating info tag matching homepage */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
        <div className="border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Free Tier / Always Available
        </div>
      </div>
    </main>
  )
}
