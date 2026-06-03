import { LoginForm } from "@/components/login-form"
import { getAuthSession } from "@/lib/auth";
import { sanitizeLoginCallbackUrl } from "@/lib/auth/safe-callback-url";
import { redirect } from "next/navigation"
import { Bebas_Neue } from "next/font/google";
import { AnimatedNoise } from "@/app/(home)/components/animated-noise";
import { cn } from "@/lib/utils";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
});

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string; embed?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = sanitizeLoginCallbackUrl(params.callbackUrl);
  const embedMode = params.embed === "1";

  const session = await getAuthSession()
  if (session) redirect(callbackUrl)

  return (
    <main
      className={cn(
        "relative flex items-center justify-center px-6 md:px-12",
        embedMode ? "min-h-0 flex-1 py-8" : "min-h-screen",
      )}
    >
      {/* Grid background matching homepage */}
      <div className="grid-bg fixed inset-0 opacity-30" aria-hidden="true" />

      {/* Animated noise ambient effect */}
      {!embedMode ? <AnimatedNoise opacity={0.03} /> : null}

      {/* Left vertical label matching homepage */}
      {!embedMode ? (
        <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground -rotate-90 origin-left block whitespace-nowrap">
            LOGIN
          </span>
        </div>
      ) : null}

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand matching homepage style */}
        <div className={embedMode ? "mb-8" : "mb-12"}>
          {!embedMode ? (
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="border border-foreground/20 px-4 py-2">
                <span className={`text-2xl tracking-widest text-foreground ${bebas.className}`}>PROTOTYPE</span>
              </div>
            </div>
          ) : null}
          <h1 className="font-[var(--font-bebas)] text-muted-foreground/60 text-[clamp(1.5rem,3vw,2.5rem)] tracking-wide">
            Welcome Back
          </h1>
          <p className="mt-4 font-mono text-xs text-muted-foreground leading-relaxed uppercase tracking-widest">
            Sign in to continue
          </p>
        </div>

        <LoginForm callbackUrl={callbackUrl} />

        {/* Footer matching homepage style */}
        {!embedMode ? (
          <div className="mt-12 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-foreground hover:text-accent transition-colors">
                Sign up
              </a>
            </p>
          </div>
        ) : null}
      </div>

      {/* Floating info tag matching homepage */}
      {!embedMode ? (
        <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
          <div className="border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Free Tier / Always Available
          </div>
        </div>
      ) : null}
    </main>
  )
}
