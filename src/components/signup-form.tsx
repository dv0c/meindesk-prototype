"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { signup } from "@/lib/actions/authentication/register-actions"
import { signIn } from "next-auth/react"
import { AnimatedNoise } from "@/app/(home)/components/animated-noise"
import { ScrambleTextOnHover } from "@/app/(home)/components/scramble-text"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { User, Mail, Lock, CheckCircle2 } from "lucide-react"

export function SignupForm({ ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Form State
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalSteps = 3

  const canProceed = () => {
    if (step === 1) return !!name.trim() && !!username.trim() && username.length >= 3
    if (step === 2) return !!email.trim() && email.includes("@")
    if (step === 3) return !!password && password.length >= 8 && password === confirmPassword
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      formData.append("name", name)
      formData.append("username", username)

      await signup(formData)
      toast.success("ACCOUNT INITIALIZED. Check your email.")
    } catch (err: any) {
      toast.error(err.message || "SYSTEM FAILURE")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignup() {
    setLoading(true)
    try {
      await signIn("google", { callbackUrl: "/setup" })
    } catch (err: any) {
      toast.error(err.message || "OAuth failed")
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="fixed inset-0 bg-background text-foreground font-mono z-50 flex flex-col overflow-hidden" {...props}>
      <AnimatedNoise opacity={0.05} />

      {/* Header */}
      <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-foreground/10 relative z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-foreground/20 flex items-center justify-center bg-foreground/5">
            <div className="w-2 h-2 bg-foreground/50" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 hidden sm:inline-block">
            Registration Sequence
          </span>
        </div>

        <a
          href="/login"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          <ScrambleTextOnHover text="LOGIN" />
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-2xl mx-auto flex flex-col items-center">

          <AnimatePresence mode="wait">
            {/* Step 1: Identity */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col items-center"
              >
                <h1 className="font-[var(--font-bebas)] text-3xl md:text-4xl lg:text-6xl text-center mb-4 tracking-wide text-foreground/80">
                  IDENTIFY YOURSELF
                </h1>
                <p className="text-center font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 md:mb-16">
                  // Begin user registration protocol
                </p>

                <div className="w-full max-w-md space-y-8">
                  <div className="space-y-4">
                    <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <div className="relative group">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ENTER YOUR NAME"
                        className="w-full h-14 bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 text-xl md:text-2xl font-mono placeholder:text-foreground/20 focus:outline-none focus:border-foreground transition-all"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground transition-all duration-300 group-focus-within:w-full" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Username
                    </label>
                    <div className="relative group">
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="CHOOSE USERNAME"
                        className="w-full h-14 bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 text-xl md:text-2xl font-mono placeholder:text-foreground/20 focus:outline-none focus:border-foreground transition-all"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground transition-all duration-300 group-focus-within:w-full" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Email */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col items-center"
              >
                <h1 className="font-[var(--font-bebas)] text-3xl md:text-4xl lg:text-6xl text-center mb-4 tracking-wide text-foreground/80">
                  NETWORK ADDRESS
                </h1>
                <p className="text-center font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 md:mb-16">
                  // Assign communication endpoint
                </p>

                <div className="w-full max-w-md space-y-8">
                  <div className="space-y-4">
                    <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <div className="relative group">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full h-14 bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 text-xl md:text-2xl font-mono placeholder:text-foreground/20 focus:outline-none focus:border-foreground transition-all lowercase"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground transition-all duration-300 group-focus-within:w-full" />
                    </div>
                    {email && email.includes("@") && (
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-green-500/80">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        VALID FORMAT
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Security */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex flex-col items-center"
              >
                <h1 className="font-[var(--font-bebas)] text-3xl md:text-4xl lg:text-6xl text-center mb-4 tracking-wide text-foreground/80">
                  SECURITY PROTOCOL
                </h1>
                <p className="text-center font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 md:mb-16">
                  // Configure access credentials
                </p>

                <div className="w-full max-w-md space-y-8">
                  <div className="space-y-4">
                    <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </label>
                    <div className="relative group">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="MIN 8 CHARACTERS"
                        className="w-full h-14 bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 text-xl font-mono placeholder:text-foreground/20 focus:outline-none focus:border-foreground transition-all"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground transition-all duration-300 group-focus-within:w-full" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="REPEAT PASSWORD"
                        className="w-full h-14 bg-transparent border-0 border-b border-foreground/20 rounded-none px-0 text-xl font-mono placeholder:text-foreground/20 focus:outline-none focus:border-foreground transition-all"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground transition-all duration-300 group-focus-within:w-full" />
                    </div>
                    {password && confirmPassword && password === confirmPassword && (
                      <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-green-500/80">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        PASSWORDS MATCH
                      </div>
                    )}
                  </div>

                  {/* OAuth Option */}
                  <div className="pt-8 mt-8 border-t border-foreground/10">
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                      disabled={loading}
                      className="w-full border border-foreground/20 px-4 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-all duration-200 disabled:opacity-50"
                    >
                      Or Sign Up With Google
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-foreground/10 bg-background/80 backdrop-blur-sm relative z-10 shrink-0">
        <div className="px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span className="hidden sm:inline">Step</span> 0{step} / 0{totalSteps}
            </div>
            {/* Steps Visualization */}
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-8 h-1 transition-all duration-300",
                    i + 1 <= step ? "bg-foreground" : "bg-foreground/10"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1 || loading}
              className={cn(
                "font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground/60 transition-colors px-4",
                step === 1 && "invisible"
              )}
            >
              <span className="mr-2 text-xs">{"<"}</span>
              BACK
            </button>

            <button
              onClick={step === totalSteps ? handleSubmit : () => setStep(s => Math.min(totalSteps, s + 1))}
              disabled={!canProceed() || loading}
              className="group relative px-4 md:px-6 py-3 bg-foreground text-background font-mono text-xs uppercase tracking-widest hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span className="relative z-10 flex items-center gap-2">
                <ScrambleTextOnHover
                  text={loading ? "PROCESSING..." : step === totalSteps ? "CREATE ACCOUNT" : "PROCEED"}
                  as="span"
                  duration={0.3}
                />
                {!loading && <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">{">"}</span>}
              </span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
